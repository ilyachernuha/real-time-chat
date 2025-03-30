from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_, and_, union
import uuid
from datetime import datetime, timezone
from .. import db_models
from ..attachment import AttachmentType
from ..users.crud import get_user_by_id


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


# PRIVATE MESSAGES


async def create_private_message(db: AsyncSession, sender_id: uuid.UUID, receiver_id: uuid.UUID, text: str | None,
                                 reply_message_id: uuid.UUID | None = None):
    message_id = uuid.uuid4()
    message = db_models.PrivateMessage(message_id=message_id, sender_id=sender_id, receiver_id=receiver_id, text=text,
                                       reply_message_id=reply_message_id)
    db.add(message)
    await db.commit()
    return message


async def get_private_message_by_id(db: AsyncSession, message_id: uuid.UUID):
    return await db.get(db_models.PrivateMessage, message_id)


async def get_private_messages_of_user_created_after_timestamp(db: AsyncSession, user_id: uuid.UUID,
                                                               timestamp: datetime):
    stmt = (
        select(db_models.PrivateMessage)
        .filter(or_(db_models.PrivateMessage.receiver_id == user_id, db_models.PrivateMessage.sender_id == user_id))
        .filter(db_models.PrivateMessage.timestamp >= timestamp)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_private_messages_of_user_updated_after_timestamp(db: AsyncSession, user_id: uuid.UUID,
                                                               timestamp: datetime):
    stmt = (
        select(db_models.PrivateMessage)
        .filter(or_(db_models.PrivateMessage.receiver_id == user_id, db_models.PrivateMessage.sender_id == user_id))
        .filter(db_models.PrivateMessage.update_time >= timestamp)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_private_messages_of_user_created_before_and_read_after_timestamp(db: AsyncSession, user_id: uuid.UUID,
                                                                               timestamp: datetime):
    stmt = (
        select(db_models.PrivateMessage)
        .filter(or_(db_models.PrivateMessage.receiver_id == user_id, db_models.PrivateMessage.sender_id == user_id))
        .filter(and_(db_models.PrivateMessage.timestamp <= timestamp, db_models.PrivateMessage.read_time >= timestamp))
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_conversation_partners_by_user_id(db: AsyncSession, user_id: uuid.UUID):
    stmt = (
        union(
            select(db_models.PrivateMessage.sender_id)
            .where(db_models.PrivateMessage.receiver_id == user_id),
            select(db_models.PrivateMessage.receiver_id)
            .where(db_models.PrivateMessage.sender_id == user_id)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_private_messages_between_two_users_before_timestamp(db: AsyncSession, user_id1: uuid.UUID,
                                                                  user_id2: uuid.UUID, timestamp: datetime,
                                                                  limit: int = 100):
    stmt = (
        select(db_models.PrivateMessage)
        .filter(or_(
            and_(db_models.PrivateMessage.sender_id == user_id1, db_models.PrivateMessage.receiver_id == user_id2),
            and_(db_models.PrivateMessage.sender_id == user_id2, db_models.PrivateMessage.receiver_id == user_id1),
        ))
        .filter(db_models.PrivateMessage.timestamp <= timestamp)
        .order_by(db_models.PrivateMessage.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_latest_private_messages_between_two_users(db: AsyncSession, user_id1: uuid.UUID, user_id2: uuid.UUID,
                                                        limit: int = 100):
    stmt = (
        select(db_models.PrivateMessage)
        .filter(or_(
            and_(db_models.PrivateMessage.sender_id == user_id1, db_models.PrivateMessage.receiver_id == user_id2),
            and_(db_models.PrivateMessage.sender_id == user_id2, db_models.PrivateMessage.receiver_id == user_id1),
        ))
        .order_by(db_models.PrivateMessage.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_private_message(db: AsyncSession, message_id: uuid.UUID, text: str | None):
    message = await get_private_message_by_id(db, message_id)
    message.text = text
    message.update_time = datetime.now(timezone.utc)
    await db.commit()
    return message


async def read_private_message(db: AsyncSession, message_id: uuid.UUID):
    message = await get_private_message_by_id(db, message_id)
    message.read_time = datetime.now(timezone.utc)
    await db.commit()
    return message


# ATTACHMENTS


async def create_attachment(db: AsyncSession, message_id: uuid.UUID, is_private_message: bool,
                            attachment_type: AttachmentType, original_name: str | None = None):
    attachment_id = uuid.uuid4()
    attachment = (
        db_models.Attachment(attachment_id=attachment_id, message_id=message_id, type=attachment_type,
                             original_name=original_name, message_type=db_models.Attachment.MessageType.public)
        if not is_private_message else
        db_models.Attachment(attachment_id=attachment_id, private_message_id=message_id, type=attachment_type,
                             original_name=original_name, message_type=db_models.Attachment.MessageType.private)
    )
    db.add(attachment)
    await db.commit()
    return attachment


async def get_attachment_by_id(db: AsyncSession, attachment_id: uuid.UUID):
    return await db.get(db_models.Attachment, attachment_id)


async def delete_attachment(db: AsyncSession, attachment_id: uuid.UUID):
    attachment = await get_attachment_by_id(db=db, attachment_id=attachment_id)
    await db.delete(attachment)
    await db.commit()


# USER BANS


async def create_user_ban(db: AsyncSession, banner_id: uuid.UUID, banned_id: uuid.UUID):
    ban = db_models.UserUserBan(banner_id=banner_id, banned_id=banned_id)
    db.add(ban)
    await db.commit()
    return ban


async def get_user_ban(db: AsyncSession, banner_id: uuid.UUID, banned_id: uuid.UUID):
    return await db.get(db_models.UserUserBan, (banned_id, banner_id))


async def remove_user_ban(db: AsyncSession, banner_id: uuid.UUID, banned_id: uuid.UUID):
    ban = await get_user_ban(db=db, banner_id=banner_id, banned_id=banned_id)
    if ban is not None:
        await db.delete(ban)
        await db.commit()


async def get_all_user_bans(db: AsyncSession):
    bans = await db.execute(select(db_models.UserUserBan))
    return bans.scalars().all()
