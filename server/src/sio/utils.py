import uuid
from typing import Any
import asyncio
from .sio import sio, sid_map
from .. import db_models
from ..messages import message_utils


async def get_user_room_ids(user: db_models.User):
    return [room.room_id for room in await user.awaitable_attrs.rooms]


def get_room_sids(room: Any, namespace: str = "/"):
    try:
        return sio.manager.rooms[namespace][room].keys()
    except KeyError:
        return []


def get_sid_by_session_id(session_id: uuid.UUID | None):
    return sid_map.get(session_id, None)


async def emit_private_message_internal(message: db_models.PrivateMessage, sid_to_skip: str | None):
    attachments = await message_utils.attachments_to_dict(message)
    task1 = asyncio.create_task(
        sio.emit(
            event="private_message_received",
            data={
                "message_id": str(message.message_id),
                "sender_id": str(message.sender_id),
                "text": message.text,
                "reply_to": str(message.reply_message_id) if message.reply_message_id else None,
                "attachments": attachments,
                "timestamp": message.timestamp.timestamp()
            },
            room=message.receiver_id
        )
    )
    task2 = asyncio.create_task(
        sio.emit(
            event="private_message_sent",
            data={
                "message_id": str(message.message_id),
                "receiver_id": str(message.receiver_id),
                "text": message.text,
                "reply_to": str(message.reply_message_id) if message.reply_message_id else None,
                "attachments": attachments,
                "timestamp": message.timestamp.timestamp()
            },
            room=message.receiver_id,
            skip_sid=sid_to_skip
        )
    )