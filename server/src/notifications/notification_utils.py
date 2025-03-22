from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from .. import db_models
from . import crud
from ..sio import external as sio


def check_if_notification_exists(notification: db_models.Notification | None):
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")


async def get_notification_if_exists(db: AsyncSession, notification_id: uuid.UUID):
    notification = await crud.get_notification_by_id(db=db, notification_id=notification_id)
    check_if_notification_exists(notification)
    return notification


def check_if_notification_can_be_deleted(notification: db_models.Notification, session_id: uuid.UUID):
    if notification.type == db_models.Notification.Type.new_login and notification.details["session_id"] == str(session_id):
        raise HTTPException(status_code=403, detail="You cannot detele this notification")


def check_if_nofitication_belongs_to_user(notification: db_models.Notification, user_id: uuid.UUID):
    if notification.user_id != user_id:
        raise HTTPException(status_code=403, detail="This notification does not belong to you")


async def create_new_login_notification(db: AsyncSession, session: db_models.Session):
    details = {
        "session_id": str(session.session_id),
        "device_info": session.device_info
    }
    notification = await crud.crate_nofitication(db=db, user_id=session.user_id,
                                                 type=db_models.Notification.Type.new_login, details=details)
    await sio.emit_notification(user_id=session.user_id, notification_id=notification.notification_id,
                                type="new_login", details=details, skip_session=session.session_id)


async def create_added_to_room_notification(db: AsyncSession, user_id: uuid.UUID, room_id: uuid.UUID,
                                            adder_id: uuid.UUID):
    details = {
        "room_id": str(room_id),
        "added_by": str(adder_id)
    }
    notification = await crud.crate_nofitication(db=db, user_id=user_id, type=db_models.Notification.Type.added_to_room,
                                                 details=details)
    await sio.emit_notification(user_id=user_id, notification_id=notification.notification_id, type="added_to_room", 
                                details=details)


async def create_banned_from_room_notification(db: AsyncSession, user_id: uuid.UUID, room_id: uuid.UUID,
                                               banner_id: uuid.UUID, reason: str):
    details = {
        "room_id": str(room_id),
        "banned_by": str(banner_id),
        "reason": reason
    }
    notification = await crud.crate_nofitication(db=db, user_id=user_id,
                                                 type=db_models.Notification.Type.banned_from_room,
                                                 details=details)
    await sio.emit_notification(user_id=user_id, notification_id=notification.notification_id, type="banned_from_room",
                                details=details)


async def create_unbanned_from_room_notification(db: AsyncSession, user_id: uuid.UUID, room_id: uuid.UUID,
                                                 unbanner_id: uuid.UUID):
    details = {
        "room_id": str(room_id),
        "unbanned_by": str(unbanner_id)
    }
    notification = await crud.crate_nofitication(db=db, user_id=user_id,
                                                 type=db_models.Notification.Type.unbanned_from_room,
                                                 details=details)
    await sio.emit_notification(user_id=user_id, notification_id=notification.notification_id,
                                type="unbanned_from_room", details=details)
