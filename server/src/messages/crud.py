from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import uuid
from datetime import datetime, timezone
from .. import db_models
from ..attachment import AttachmentType


# MESSAGES


async def create_message(db: AsyncSession, user_id: uuid.UUID, room_id: uuid.UUID, text: str | None,
                         reply_message_id: uuid.UUID | None = None):
    message_id = uuid.uuid4()
    message = db_models.Message(message_id=message_id, user_id=user_id, room_id=room_id, text=text,
                                reply_message_id=reply_message_id)
    db.add(message)
    await db.commit()
    return message


async def get_message_by_id(db: AsyncSession, message_id: uuid.UUID):
    return await db.get(db_models.Message, message_id)


async def get_messages_in_room_created_after_timestamp(db: AsyncSession, room_id: uuid.UUID, timestamp: datetime):
    stmt = (
        select(db_models.Message)
        .filter(db_models.Message.room_id == room_id)
        .filter(db_models.Message.timestamp >= timestamp)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_messages_in_room_updated_after_timestamp(db: AsyncSession, room_id: uuid.UUID, timestamp: datetime):
    stmt = (
        select(db_models.Message)
        .filter(db_models.Message.room_id == room_id)
        .filter(db_models.Message.update_time >= timestamp)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_messages_in_room_before_timestamp(db: AsyncSession, room_id: uuid.UUID, timestamp: datetime,
                                                limit: int = 100):
    stmt = (
        select(db_models.Message)
        .filter(db_models.Message.room_id == room_id)
        .filter(db_models.Message.timestamp <= timestamp)
        .order_by(db_models.Message.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_latest_messages_in_room(db: AsyncSession, room_id: uuid.UUID, limit: int = 100):
    stmt = (
        select(db_models.Message)
        .filter(db_models.Message.room_id == room_id)
        .order_by(db_models.Message.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_message(db: AsyncSession, message_id: uuid.UUID, text: str | None):
    message = await get_message_by_id(db, message_id)
    message.text = text
    message.update_time = datetime.now(timezone.utc)
    await db.commit()
    return message


# ATTACHMENTS


async def create_attachment(db: AsyncSession, message_id: uuid.UUID, attachment_type: AttachmentType,
                            original_name: str | None = None):
    attachment_id = uuid.uuid4()
    attachment = db_models.Attachment(attachment_id=attachment_id, message_id=message_id, type=attachment_type,
                                      original_name=original_name)
    db.add(attachment)
    await db.commit()
    return attachment


async def get_attachment_by_id(db: AsyncSession, attachment_id: uuid.UUID):
    return await db.get(db_models.Attachment, attachment_id)
