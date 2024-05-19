from socketio.exceptions import ConnectionRefusedError
import asyncio
import time
import uuid
from .sio import sio
from ..database import db_session
from ..auth import auth_utils
from ..users import user_utils
from ..rooms import room_utils
from . import crud, schemas, utils, validators, exception_handlers
from ..exceptions import AccessTokenValidationError, BearerTokenExtractionError


@sio.event
async def connect(sid, environ):
    auth_header = environ.get("HTTP_AUTHORIZATION")
    try:
        user_id, session_id = auth_utils.extract_access_token_data(
                              auth_utils.extract_token_from_raw_header(auth_header))
    except (AccessTokenValidationError, BearerTokenExtractionError) as e:
        raise ConnectionRefusedError(str(e))

    async with db_session() as db:
        session = await crud.get_session_by_id(db, session_id)
        if session is None:
            raise ConnectionRefusedError("Session not found")
        user = await crud.get_user_by_id(db, user_id)

        await sio.save_session(sid, {"user_id": user_id, "session_id": session_id, "name": user.name})
        await sio.enter_room(sid, user_id)
        for room_id in await utils.get_user_room_ids(user):
            await sio.enter_room(sid, room_id)


@sio.event
async def disconnect(sid):
    user_id = (await sio.get_session(sid))["user_id"]
    await sio.leave_room(sid, user_id)


@sio.event
@exception_handlers.handle_sqlalchemy_error
@validators.validate_user_in_room
@validators.validate_model(model=schemas.Message)
async def message(sid, data):
    async with db_session() as db:
        sid_data = await sio.get_session(sid)
        user_id, name = sid_data["user_id"], sid_data["name"]
        message_id = uuid.uuid4()
        timestamp = int(time.time() * 1000)
        task = asyncio.create_task(
            sio.emit(
                event="message",
                data={
                    "message_id": str(message_id),
                    "user": {
                        "id": str(user_id),
                        "name": name
                    },
                    "text": data.text,
                    "room_id": str(data.room_id),
                    "timestamp": timestamp
                },
                room=data.room_id,
                skip_sid=sid
            )
        )
        return "Success", {"message_id": str(message_id), "timestamp": timestamp}


@sio.event
@validators.validate_user_in_room
@validators.validate_model(model=schemas.UserTyping)
async def start_typing(sid, data):
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
@validators.validate_user_in_room
@validators.validate_model(model=schemas.UserTyping)
async def stop_typing(sid, data):
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
@exception_handlers.handle_sqlalchemy_error
@exception_handlers.handle_field_submission_error
@validators.validate_model(model=schemas.SearchUsers)
async def find_users(sid, data):
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
@exception_handlers.handle_sqlalchemy_error
@exception_handlers.handle_field_submission_error
@validators.validate_model(model=schemas.SearchTags)
async def find_tags(sid, data):
    room_utils.validate_tag_name(data.search)
    async with db_session() as db:
        tags = [tag.tag for tag in await crud.search_tag(db=db, tag_name=data.search, limit=10)]
        return "Success", {"tags": tags}


@sio.event
@exception_handlers.handle_sqlalchemy_error
@exception_handlers.handle_field_submission_error
@validators.validate_model(model=schemas.SearchRooms)
async def find_rooms(sid, data):
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
