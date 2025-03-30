from socketio.exceptions import ConnectionRefusedError
import asyncio
from .sio import sio, sid_map
from ..database import db_session
from ..auth import auth_utils
from ..users import user_utils
from ..rooms import room_utils
from ..messages import message_utils
from . import crud, schemas, utils, validators, external
from .exception_handlers import handle_exceptions


@sio.event
@handle_exceptions
async def connect(sid: str, environ: dict):
    auth_header = environ.get("HTTP_AUTHORIZATION")
    user_id, session_id = auth_utils.extract_access_token_data(auth_utils.extract_token_from_raw_header(auth_header))
    async with db_session() as db:
        session = await crud.get_session_by_id(db, session_id)
        if session is None:
            raise ConnectionRefusedError("Session not found")
        if sid_map.get(session.session_id):
            raise ConnectionRefusedError("Session already connected")
        user = await crud.get_user_by_id(db, user_id)
        await sio.save_session(
            sid=sid,
            session={
                "user_id": user_id,
                "session_id": session_id,
                "name": user.name,
                "profile_picture_id": user.profile_picture_id
            }
        )
        await sio.enter_room(sid, user_id)
        for room_id in await utils.get_user_room_ids(user):
            await sio.enter_room(sid, room_id)
        sid_map[session.session_id] = sid


@sio.event
async def disconnect(sid: str):
    sid_data = await sio.get_session(sid)
    await sio.leave_room(sid, sid_data["user_id"])
    sid_map.pop(sid_data["session_id"], None)


@sio.event
@handle_exceptions
@validators.validate_model(model=schemas.Message)
@validators.validate_user_in_room
async def message(sid: str, data: schemas.Message):
    async with db_session() as db:
        sid_data = await sio.get_session(sid)
        user_id, name, profile_picture_id = sid_data["user_id"], sid_data["name"], sid_data["profile_picture_id"]
        message_utils.validate_message_text(data.text)
        if data.reply_message_id is not None:
            await message_utils.validate_message_reply(db=db, message_id=data.reply_message_id, room_id=data.room_id)
        message = await crud.create_message(db=db, user_id=user_id, room_id=data.room_id, text=data.text,
                                            reply_message_id=data.reply_message_id)
        message_id_str = str(message.message_id)
        timestamp = message.timestamp.timestamp()
        task = asyncio.create_task(
            sio.emit(
                event="message",
                data={
                    "message_id": message_id_str,
                    "user": {
                        "id": str(user_id),
                        "name": name,
                        "profile_picture_id": str(profile_picture_id) if profile_picture_id is not None else None
                    },
                    "text": data.text,
                    "room_id": str(data.room_id),
                    "reply_to": str(message.reply_message_id) if message.reply_message_id else None,
                    "timestamp": timestamp
                },
                room=data.room_id,
                skip_sid=sid
            )
        )
        return "Success", {"message_id": message_id_str, "timestamp": timestamp}


@sio.event
@handle_exceptions
@validators.validate_model(model=schemas.PrivateMessage)
async def private_message(sid: str, data: schemas.PrivateMessage):
    async with db_session() as db:
        user_id = (await sio.get_session(sid))["user_id"]
        message_utils.validate_message_text(data.text)
        await message_utils.check_if_user_can_message_user(db=db, receiver_id=data.receiver_id, sender_id=user_id)
        if data.reply_message_id is not None:
            await message_utils.validate_private_message_reply(db=db, message_id=data.reply_message_id,
                                                               user_ids=(user_id, data.receiver_id))
        message = await crud.create_private_message(db=db, sender_id=user_id, receiver_id=data.receiver_id,
                                                    text=data.text, reply_message_id=data.reply_message_id)
        message_id_str = str(message.message_id)
        timestamp = message.timestamp.timestamp()
        await utils.emit_private_message_internal(message=message, sid_to_skip=sid)
        return "Success", {"message_id": message_id_str, "timestamp": timestamp}


@sio.event
@handle_exceptions
@validators.validate_model(model=schemas.ReadPrivateMessages)
async def read_private_messages(sid: str, data: schemas.ReadPrivateMessages):
    async with db_session() as db:
        user_id = (await sio.get_session(sid))["user_id"]
        messages = [await crud.get_private_message_by_id(db=db, message_id=message_id) for message_id in data.messages]
        if any(message is None or message.receiver_id != user_id for message in messages):
            return "Error", {"detail": "Invalid messages"}
        if len({message.sender_id for message in messages}) != 1:
            return "Error", {"detail": "Message sender mismatch"}
        str_list = []
        for message in messages:
            if message.read_time is None:
                await crud.read_private_message(db=db, message_id=message.message_id)
                str_list.append(str(message.message_id))
        if str_list:
            task1 = asyncio.create_task(
                sio.emit(
                    event="private_message_read",
                    data={"messages": str_list},
                    room=message.sender_id
                )
            )
            task2 = asyncio.create_task(
                sio.emit(
                    event="private_message_read",
                    data={"messages": str_list},
                    room=message.receiver_id,
                    skip_sid=sid
                )
            )
        
        

@sio.event
@validators.validate_model(model=schemas.UserTyping)
@validators.validate_user_in_room
async def start_typing(sid: str, data: schemas.UserTyping):
    sid_data = await sio.get_session(sid)
    user_id, name = sid_data["user_id"], sid_data["name"]
    await sio.emit(
        event="start_typing",
        data={
            "user": {
                "id": str(user_id),
                "name": name
            },
            "room_id": str(data.room_id)
        },
        room=data.room_id,
        skip_sid=user_id
    )


@sio.event
@validators.validate_model(model=schemas.UserTyping)
@validators.validate_user_in_room
async def stop_typing(sid: str, data: schemas.UserTyping):
    sid_data = await sio.get_session(sid)
    user_id, name = sid_data["user_id"], sid_data["name"]
    await sio.emit(
        event="stop_typing",
        data={
            "user": {
                "id": str(user_id),
                "name": name
            },
            "room_id": str(data.room_id)
        },
        room=data.room_id,
        skip_sid=user_id
    )


@sio.event
@validators.validate_model(model=schemas.UserTypingPrivate)
async def start_typing_private(sid, data: schemas.UserTypingPrivate):
    user_id = (await sio.get_session(sid))["user_id"]
    await sio.emit(
        event="start_typing_private",
        data={
            "user_id": str(user_id)
        },
        room=data.receiver_id,
        skip_sid=sid
    )


@sio.event
@validators.validate_model(model=schemas.UserTypingPrivate)
async def stop_typing_private(sid, data: schemas.UserTypingPrivate):
    user_id = (await sio.get_session(sid))["user_id"]
    await sio.emit(
        event="stop_typing_private",
        data={
            "user_id": str(user_id)
        },
        room=data.receiver_id,
        skip_sid=sid
    )


@sio.event
@handle_exceptions
@validators.validate_model(model=schemas.SearchUsers)
async def find_users(sid: str, data: schemas.SearchUsers):
    user_utils.validate_username(data.search)
    async with db_session() as db:
        users_data = [
            {
                "user_id": str(user.user_id),
                "username": (await user.awaitable_attrs.account_data).username,
                "name": user.name,
                "profile_picture_id": str(user.profile_picture_id)
            }
            for user in await crud.search_users(db, username=data.search, limit=10)
        ]
        return "Success", {"users": users_data}


@sio.event
@handle_exceptions
@validators.validate_model(model=schemas.SearchTags)
async def find_tags(sid: str, data: schemas.SearchTags):
    room_utils.validate_tag_name(data.search)
    async with db_session() as db:
        tags = [tag.tag for tag in await crud.search_tag(db=db, tag_name=data.search, limit=10)]
        return "Success", {"tags": tags}


@sio.event
@handle_exceptions
@validators.validate_model(model=schemas.SearchRooms)
async def find_rooms(sid: str, data: schemas.SearchRooms):
    room_utils.validate_title(data.search)
    if data.tags is not None and data.tags is not set():
        room_utils.validate_tag_names(data.tags)
    async with db_session() as db:
        rooms = await crud.filter_rooms(db=db, title=data.search,
                                        themes=([room_utils.get_theme_from_string(theme) for theme in data.themes]
                                                if data.themes else None),
                                        languages=(room_utils.get_language_list_from_codes(set(data.languages))
                                                   if data.languages else None),
                                        tags=data.tags, public=data.public)
        rooms_data = [
            {
                "room_id": str(room.room_id),
                "title": room.title,
                "room_picture_id": str(room.room_picture_id)
            }
            for room in rooms
        ]
        return "Success", {"rooms": rooms_data}
