from socketio.exceptions import ConnectionRefusedError
import asyncio
from .sio import sio
from ..database import db_session
from ..auth import auth_utils
from ..users import user_utils
from ..rooms import room_utils
from ..messages import message_utils
from . import crud, schemas, utils, validators
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


@sio.event
async def disconnect(sid: str):
    user_id = (await sio.get_session(sid))["user_id"]
    await sio.leave_room(sid, user_id)


@sio.event
@handle_exceptions
@validators.validate_model(model=schemas.Message)
@validators.validate_user_in_room
async def message(sid: str, data: schemas.Message):
    async with db_session() as db:
        sid_data = await sio.get_session(sid)
        user_id, name, profile_picture_id = sid_data["user_id"], sid_data["name"], sid_data["profile_picture_id"]
        message_utils.validate_message_text(data.text)
        message = await crud.create_message(db=db, user_id=user_id, room_id=data.room_id, text=data.text)
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
                    "timestamp": timestamp
                },
                room=data.room_id,
                skip_sid=sid
            )
        )
        return "Success", {"message_id": message_id_str, "timestamp": timestamp}


@sio.event
@validators.validate_model(model=schemas.UserTyping)
@validators.validate_user_in_room
async def start_typing(sid: str, data: schemas.UserTyping):
    sid_data = await sio.get_session(sid)
    user_id, name = sid_data["user_id"], sid_data["name"]
    user_id_str = str(user_id)
    await sio.emit("start_typing", {
        "user": {
            "id": user_id_str,
            "name": name
        },
        "room_id": str(data.room_id)
    })


@sio.event
@validators.validate_model(model=schemas.UserTyping)
@validators.validate_user_in_room
async def stop_typing(sid: str, data: schemas.UserTyping):
    sid_data = await sio.get_session(sid)
    user_id, name = sid_data["user_id"], sid_data["name"]
    user_id_str = str(user_id)
    await sio.emit("stop_typing", {
        "user": {
            "id": user_id_str,
            "name": name
        },
        "room_id": str(data.room_id)
    })


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
                                        tags=data.tags)
        rooms_data = [
            {
                "room_id": str(room.room_id),
                "title": room.title,
                "room_picture_id": str(room.room_picture_id)
            }
            for room in rooms
        ]
        return "Success", {"rooms": rooms_data}
