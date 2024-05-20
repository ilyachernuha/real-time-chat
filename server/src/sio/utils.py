from .. import db_models


async def get_user_room_ids(user: db_models.User):
    return [room.room_id for room in await user.awaitable_attrs.rooms]
