from .sio import sio
import uuid
import asyncio
from typing import Any


def get_room_sids(room: Any, namespace: str = "/"):
    try:
        return sio.manager.rooms[namespace][room].keys()
    except KeyError:
        return []


async def update_user_name(user_id: uuid.UUID, new_name: str):
    for sid in get_room_sids(user_id):
        sid_data = await sio.get_session(sid)
        sid_data["name"] = new_name
        await sio.save_session(sid, sid_data)


async def room_state_notification(room_id: uuid.UUID, user_id: uuid.UUID, event: str):
    task = asyncio.create_task(
        sio.emit(
            event=event,
            data={"room_id": str(room_id)},
            room=user_id
        )
    )


async def add_user_to_room(user_id: uuid.UUID, room_id: uuid.UUID):
    for sid in get_room_sids(user_id):
        await sio.enter_room(sid=sid, room=room_id)
    await room_state_notification(room_id=room_id, user_id=user_id, event="added_to_room")


async def remove_user_from_room(user_id: uuid.UUID, room_id: uuid.UUID):
    for sid in get_room_sids(user_id):
        await sio.leave_room(sid=sid, room=room_id)
    await room_state_notification(room_id=room_id, user_id=user_id, event="removed_from_room")


async def add_multiple_users_to_room(user_ids: list[uuid.UUID], room_id: uuid.UUID):
    for user_id in user_ids:
        await add_user_to_room(user_id=user_id, room_id=room_id)


async def remove_multiple_users_from_room(user_ids: list[uuid.UUID], room_id: uuid.UUID):
    for user_id in user_ids:
        await remove_user_from_room(user_id=user_id, room_id=room_id)


async def close_room(room_id: uuid.UUID, member_ids: list[uuid.UUID]):
    await sio.close_room(room=room_id)
    for user_id in member_ids:
        await room_state_notification(room_id=room_id, user_id=user_id, event="room_deleted")
