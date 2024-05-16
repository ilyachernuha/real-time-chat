import socketio
from socketio.exceptions import ConnectionRefusedError
import asyncio
import time
import uuid
from ..database import db_session
from ..auth import auth_utils
from . import crud, schemas, validators, utils
from .user_sids import UserSIDs
from ..exceptions import AccessTokenValidationError, BearerTokenExtractionError


sio = socketio.AsyncServer(async_mode="asgi")
user_sids = UserSIDs()


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
        user_sids.add_sid(user_id=user_id, sid=sid)
        for room_id in await utils.get_user_room_ids(user):
            await sio.enter_room(sid, room_id)


@sio.event
async def disconnect(sid):
    user_sids.remove_sid(user_id=(await sio.get_session(sid))["user_id"], sid=sid)


@sio.event
@validators.validate_model(model=schemas.Message)
async def message(sid, data):
    async with db_session() as db:
        if data.room_id not in sio.rooms(sid):
            return "Error", {"detail": "You're not member of this room"}
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
@validators.validate_model(model=schemas.Typing)
async def start_typing(sid, data):
    async with db_session() as db:
        user_id = (await sio.get_session(sid))["user_id"]
        name = (await crud.get_user_by_id(db, user_id)).name
        user_id_str = str(user_id)
        await sio.emit("start_typing", {
            "user": {
                "id": user_id_str,
                "name": name
            },
            "room_id": str(data.room_id)
        })


@sio.event
@validators.validate_model(model=schemas.Typing)
async def stop_typing(sid, data):
    async with db_session() as db:
        user_id = (await sio.get_session(sid))["user_id"]
        name = (await crud.get_user_by_id(db, user_id)).name
        user_id_str = str(user_id)
        await sio.emit("stop_typing", {
            "user": {
                "id": user_id_str,
                "name": name
            },
            "room_id": str(data.room_id)
        })
