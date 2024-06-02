from pydantic import BaseModel, UUID4


class MessageInfo(BaseModel):
    user_id: UUID4
    room_id: UUID4
    reply_to: UUID4 | None
    text: str | None
    created_at: float
    updated_at: float | None


class MessageLoadInfo(BaseModel):
    message_id: UUID4
    user_id: UUID4
    reply_to: UUID4 | None
    text: str | None
    created_at: float
    updated_at: float | None


class RoomUpdates(BaseModel):
    new_messages: list[MessageLoadInfo]
    updated_messages: list[MessageLoadInfo]


class OldMessages(BaseModel):
    messages: list[MessageLoadInfo]
