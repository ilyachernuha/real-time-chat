from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime, timezone
from . import crud, responses, notification_utils
from ..security import security_bearer
from ..database import get_db
from ..auth import auth_utils


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/after_timestamp/{after}", response_model=responses.NotificationList)
async def get_notifications_after_timestamp(after: float,
                                            credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                                            db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    timestamp = datetime.fromtimestamp(after, timezone.utc)
    notifications = [
        {
            "notification_id": notification.notification_id,
            "type": notification.type.name,
            "timestamp": notification.timestamp.timestamp(),
            "details": notification.details
        }
        for notification in await crud.get_notification_of_user_created_after_timestamp(db=db, user_id=user_id,
                                                                                       timestamp=timestamp)
    ]
    return {"notifications": notifications}


@router.delete("/delete_notification/{notification_id}", response_model=responses.GenericConfirmation)
async def delete_notification(notification_id: uuid.UUID,
                              credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                              db: AsyncSession = Depends(get_db)):
    user_id, session_id = auth_utils.extract_access_token_data(credentials.credentials)
    notification = await notification_utils.get_notification_if_exists(db=db, notification_id=notification_id)
    notification_utils.check_if_notification_belongs_to_user(notification=notification, user_id=user_id)
    notification_utils.check_if_notification_can_be_deleted(notification=notification, session_id=session_id)
    await crud.delete_notification(db=db, notification_id=notification_id)
    return {"status": "success"}
