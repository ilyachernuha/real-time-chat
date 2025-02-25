from pydantic import BaseModel, UUID4
from ..responses_global import GenericConfirmation


class MessageCreated(BaseModel):
    status: str
    message_id: UUID4


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


class PrivateMessageInfo(BaseModel):
    sender_id: UUID4
    receiver_id: UUID4
    reply_to: UUID4 | None
    text: str | None
    created_at: float
    updated_at: float | None
    attachments: list[Attachment]


class PrivateConversations(BaseModel):
    user_ids: list[UUID4]


class PrivateMessageInfoWithId(BaseModel):
    message_id: UUID4
    sender_id: UUID4
    receiver_id: UUID4
    reply_to: UUID4 | None
    text: str | None
    created_at: float
    updated_at: float | None
    attachments: list[Attachment]


class PrivateMessageUpdates(BaseModel):
    new_messages: list[PrivateMessageInfoWithId]
    updated_messages: list[PrivateMessageInfoWithId]


class OldPrivateMessages(BaseModel):
    messages: list[PrivateMessageInfoWithId]
