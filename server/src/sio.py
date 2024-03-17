import socketio
from socketio.exceptions import ConnectionRefusedError
import time
import auth_utils
from database import db_session
import crud
import schemas
from pydantic import ValidationError
from exceptions import AccessTokenValidationError, BearerTokenExtractionError


sio = socketio.AsyncServer(async_mode="asgi")


@sio.event
async def connect(sid, environ):
    auth_header = environ.get("HTTP_AUTHORIZATION")
    try:
        user_id, session_id = auth_utils.extract_access_token_data(
                              auth_utils.extract_token_from_raw_header(auth_header))
    except (AccessTokenValidationError, BearerTokenExtractionError) as e:
        raise ConnectionRefusedError(str(e))

    with db_session() as db:
        session = crud.get_session_by_id(db, session_id)
        if session is None:
            raise ConnectionRefusedError("Session not found")

    await sio.save_session(sid, {"user_id": user_id, "session_id": session_id})


@sio.event
async def disconnect(sid):
    pass


@sio.event
async def message(sid, data):
    with db_session() as db:
        try:
            validated_data = schemas.Message(**data)
            user_id = (await sio.get_session(sid))["user_id"]
            name = crud.get_user_by_id(db, user_id).name
            await sio.emit("message", {
                "user": {
                    "id": user_id,
                    "name": name
                },
                "text": validated_data.text,
                "room": validated_data.room,
                "timestamp": int(time.time() * 1000)
            })
        except ValidationError:
            pass


@sio.event
async def start_typing(sid, data):
    with db_session() as db:
        try:
            room = schemas.Typing(**data).room
            user_id = (await sio.get_session(sid))["user_id"]
            name = crud.get_user_by_id(db, user_id).name
            await sio.emit("start_typing", {
                "user": {
                    "id": user_id,
                    "name": name
                },
                "room": room
            })
        except ValidationError:
            pass


@sio.event
async def stop_typing(sid, data):
    with db_session() as db:
        try:
            room = schemas.Typing(**data).room
            user_id = (await sio.get_session(sid))["user_id"]
            name = crud.get_user_by_id(db, user_id).name
            await sio.emit("stop_typing", {
                "user": {
                    "id": user_id,
                    "name": name
                },
                "room": room
            })
        except ValidationError:
            pass
