from pydantic import BaseModel, UUID4
from ..responses_global import GenericConfirmation


class NotificationInfo(BaseModel):
    notification_id: UUID4
    type: str
    timestamp: float
    details: dict


class NotificationList(BaseModel):
    notifications: list[NotificationInfo]
