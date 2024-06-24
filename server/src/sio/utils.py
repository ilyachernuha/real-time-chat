import uuid
from typing import Any
from .sio import sio, sid_map
from .. import db_models


async def get_user_room_ids(user: db_models.User):
    return [room.room_id for room in await user.awaitable_attrs.rooms]


def get_room_sids(room: Any, namespace: str = "/"):
    try:
        return sio.manager.rooms[namespace][room].keys()
    except KeyError:
        return []


def get_sid_by_session_id(session_id: uuid.UUID | None):
    try:
        return sid_map[session_id]
    except KeyError:
        return None
