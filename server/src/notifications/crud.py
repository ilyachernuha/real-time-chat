from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from datetime import datetime
from .. import db_models


async def create_notification(db: AsyncSession, user_id: uuid.UUID, type: db_models.Notification.Type, details: dict):
    notification_id = uuid.uuid4()
    notification = db_models.Notification(notification_id=notification_id, user_id=user_id, type=type, details=details)
    db.add(notification)
    await db.commit()
    return notification


async def get_notification_by_id(db: AsyncSession, notification_id: uuid.UUID):
    return await db.get(db_models.Notification, notification_id)


async def get_notification_of_user_created_after_timestamp(db: AsyncSession, user_id: uuid.UUID, timestamp: datetime):
    stmt = (
        select(db_models.Notification)
        .filter(db_models.Notification.user_id == user_id)
        .filter(db_models.Notification.timestamp >= timestamp)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def delete_notification(db: AsyncSession, notification_id: uuid.UUID):
    notification = await get_notification_by_id(db=db, notification_id=notification_id)
    await db.delete(notification)
    await db.commit()
