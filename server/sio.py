import socketio
import time
import auth_utils
from database import db_session
import crud
import schemas
from pydantic import ValidationError


sio = socketio.AsyncServer(async_mode="asgi")
sid_user_data = dict()


@sio.event
async def connect(sid, environ, auth):
    token = auth.get("token")
    if token is None:
        return False
    user_id = auth_utils.validate_token(token)
    if user_id is None:
        return False
    sid_user_data[sid] = user_id


@sio.event
async def disconnect(sid):
    sid_user_data.pop(sid, None)


@sio.event
async def message(sid, data):
    with db_session() as db:
        try:
            validated_data = schemas.Message(**data)
            user_id = sid_user_data[sid]
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
            user_id = sid_user_data[sid]
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
            user_id = sid_user_data[sid]
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