import socketio
from socketio.exceptions import ConnectionRefusedError
import time
from pydantic import ValidationError
from ..database import db_session
from ..auth import auth_utils
from . import crud
from . import schemas
from ..exceptions import AccessTokenValidationError, BearerTokenExtractionError


sio = socketio.AsyncServer(async_mode="asgi")


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

    await sio.save_session(sid, {"user_id": user_id, "session_id": session_id})


@sio.event
async def disconnect(sid):
    pass


@sio.event
async def message(sid, data):
    async with db_session() as db:
        if not isinstance(data, dict):
            return "Error", {"detail": "Data must be in JSON"}
        try:
            validated_data = schemas.Message(**data)
            user_id = (await sio.get_session(sid))["user_id"]
            name = (await crud.get_user_by_id(db, user_id)).name
            user_id_str = str(user_id)
            await sio.emit("message", {
                "user": {
                    "id": user_id_str,
                    "name": name
                },
                "text": validated_data.text,
                "room": validated_data.room,
                "timestamp": int(time.time() * 1000)
            })
        except ValidationError:
            return "Error", {"detail": "Validation failed"}


@sio.event
async def start_typing(sid, data):
    async with db_session() as db:
        if not isinstance(data, dict):
            return "Error", {"detail": "Data must be in JSON"}
        try:
            room = schemas.Typing(**data).room
            user_id = (await sio.get_session(sid))["user_id"]
            name = (await crud.get_user_by_id(db, user_id)).name
            user_id_str = str(user_id)
            await sio.emit("start_typing", {
                "user": {
                    "id": user_id_str,
                    "name": name
                },
                "room": room
            })
        except ValidationError:
            return "Error", {"detail": "Validation failed"}


@sio.event
async def stop_typing(sid, data):
    async with db_session() as db:
        if not isinstance(data, dict):
            return "Error", {"detail": "Data must be in JSON"}
        try:
            room = schemas.Typing(**data).room
            user_id = (await sio.get_session(sid))["user_id"]
            name = (await crud.get_user_by_id(db, user_id)).name
            user_id_str = str(user_id)
            await sio.emit("stop_typing", {
                "user": {
                    "id": user_id_str,
                    "name": name
                },
                "room": room
            })
        except ValidationError:
            return "Error", {"detail": "Validation failed"}
