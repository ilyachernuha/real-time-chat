from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from .. import db_models
from .room_languages import RoomLanguage
from .room_themes import RoomTheme
from ..users.crud import get_user_by_id


# ROOMS


async def create_room(db: AsyncSession, owner: db_models.User, title: str, description: str | None, theme: RoomTheme,
                      languages: list[RoomLanguage], tags: list[db_models.Tag], public: bool):
    room_id = uuid.uuid4()
    room = db_models.Room(room_id=room_id, owner_id=owner.user_id, title=title, description=description, theme=theme,
                          languages=languages, is_public=public)
    db.add(room)
    for tag in tags:
        association = db_models.RoomTagAssociation(room_id=room_id, tag_name=tag.tag, theme=theme, room=room, tag=tag)
        db.add(association)
    await db.commit()
    return room


async def get_room_by_id(db: AsyncSession, room_id: uuid.UUID):
    return await db.get(db_models.Room, room_id)


async def filter_rooms(db: AsyncSession, title: str | None, themes: list[RoomTheme] | None,
                       languages: list[RoomLanguage] | None, tags: list[str] | None):
    stmt = select(db_models.Room) if tags is None else select(db_models.Room).join(db_models.RoomTagAssociation)
    if title is not None:
        stmt = stmt.where(db_models.Room.title.ilike(f"%{title}%"))
    if themes is not None:
        stmt = stmt.where(db_models.Room.theme.in_(themes))
    if languages is not None:
        stmt = stmt.where(db_models.Room.languages.op("&&")(languages))
    if tags is not None:
        stmt = stmt.where(db_models.Room.tags.any(db_models.RoomTagAssociation.tag_name.in_(tags)))
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_room_title(db: AsyncSession, room_id: uuid.UUID, new_title: str):
    room = await get_room_by_id(db, room_id)
    room.title = new_title
    await db.commit()
    return room


async def update_room_description(db: AsyncSession, room_id: uuid.UUID, new_description: str | None):
    room = await get_room_by_id(db, room_id)
    room.description = new_description
    await db.commit()
    return room


async def update_room_theme(db: AsyncSession, room_id: uuid.UUID, new_theme: RoomTheme):
    room = await get_room_by_id(db, room_id)
    room.theme = new_theme
    for tag_association in room.tags:
        tag_association.theme = new_theme
    await db.commit()
    return room


async def update_privacy_type(db: AsyncSession, room_id: uuid.UUID, public: bool):
    room = await get_room_by_id(db, room_id)
    room.is_public = public
    await db.commit()
    return room


async def update_room_picture_id(db: AsyncSession, room_id: uuid.UUID, new_room_picture_id: uuid.UUID | None):
    room = await get_room_by_id(db, room_id)
    room.room_picture_id = new_room_picture_id
    await db.commit()
    return room


async def get_room_tag_association(db: AsyncSession, room_id: uuid.UUID, tag_name: str):
    return await db.get(db_models.RoomTagAssociation, (room_id, tag_name))


async def add_tags_to_room(db: AsyncSession, room_id: uuid.UUID, tags: list[db_models.Tag]):
    room = await get_room_by_id(db, room_id)
    for tag in tags:
        if not await get_room_tag_association(db, room_id, tag.tag):
            association = db_models.RoomTagAssociation(room_id=room_id, tag_name=tag.tag, theme=room.theme,
                                                       room=room, tag=tag)
            db.add(association)
    await db.commit()
    return room


async def remove_tags_from_room(db: AsyncSession, room_id: uuid.UUID, tags: list[str]):
    room = await get_room_by_id(db, room_id)
    for tag in tags:
        association = await get_room_tag_association(db, room_id, tag)
        if association is not None:
            await db.delete(association)
    await db.commit()
    return room


async def update_room_languages(db: AsyncSession, room_id: uuid.UUID, languages: list[RoomLanguage]):
    room = await get_room_by_id(db, room_id)
    room.languages = languages
    await db.commit()
    return room


async def add_user_to_room(db: AsyncSession, room_id: uuid.UUID, user: db_models.User, make_admin: bool = False):
    room = await get_room_by_id(db, room_id)
    association = db_models.UserRoomAssociation(user_id=user.user_id, room_id=room_id, is_admin=make_admin,
                                                user=user, room=room)
    db.add(association)
    await db.commit()
    return room


async def get_user_room_association(db: AsyncSession, room_id: uuid.UUID, user_id: uuid.UUID):
    return await db.get(db_models.UserRoomAssociation, (user_id, room_id))


async def remove_user_from_room(db: AsyncSession, room_id: uuid.UUID, user_id: uuid.UUID):
    room = await get_room_by_id(db, room_id)
    association = await get_user_room_association(db, room_id, user_id)
    await db.delete(association)
    await db.commit()
    return room


async def update_user_admin_status_in_room(db: AsyncSession, room_id: uuid.UUID, user_id: uuid.UUID,
                                           new_admin_status: bool):
    room = await get_room_by_id(db, room_id)
    association = await get_user_room_association(db, room_id, user_id)
    association.is_admin = new_admin_status
    await db.commit()
    return room


async def delete_room(db: AsyncSession, room_id: uuid.UUID):
    room = await get_room_by_id(db, room_id)
    await db.delete(room)
    await db.commit()


# TAGS


async def create_tag(db: AsyncSession, tag_name: str):
    tag = db_models.Tag(tag=tag_name)
    db.add(tag)
    await db.commit()
    return tag


async def get_tag_by_name(db: AsyncSession, tag_name: str):
    return await db.get(db_models.Tag, tag_name)


async def get_or_create_tag(db: AsyncSession, tag_name: str):
    tag = await get_tag_by_name(db, tag_name)
    if tag is None:
        tag = await create_tag(db, tag_name)
    return tag


async def delete_tag(db: AsyncSession, tag_name: str):
    tag = await get_tag_by_name(db, tag_name)
    await db.delete(tag)
    await db.commit()


async def search_tag(db: AsyncSession, tag_name: str, limit: int | None):
    stmt = (
        select(db_models.Tag)
        .where(db_models.Tag.tag.ilike(f"%{tag_name}%"))
    )
    if limit is not None:
        stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()
