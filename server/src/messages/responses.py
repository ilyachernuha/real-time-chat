from pydantic import BaseModel, UUID4
from ..responses_global import GenericConfirmation


class Attachment(BaseModel):
    attachment_id: UUID4
    type: str
    presigned_url: str
    original_name: str | None


class MessageInfo(BaseModel):
    user_id: UUID4
    room_id: UUID4
    reply_to: UUID4 | None
    text: str | None
    created_at: float
    updated_at: float | None
    attachments: list[Attachment]


class MessageInRoomInfo(BaseModel):
    message_id: UUID4
    user_id: UUID4
    reply_to: UUID4 | None
    text: str | None
    created_at: float
    updated_at: float | None
    attachments: list[Attachment]


class RoomUpdates(BaseModel):
    new_messages: list[MessageInRoomInfo]
    updated_messages: list[MessageInRoomInfo]


class OldMessages(BaseModel):
    messages: list[MessageInRoomInfo]


class MessageCreated(BaseModel):
    status: str
    message_id: UUID4
