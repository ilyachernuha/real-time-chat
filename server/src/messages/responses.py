from pydantic import BaseModel, UUID4


class MessageInfo(BaseModel):
    user_id: UUID4
    room_id: UUID4
    reply_to: UUID4 | None
    text: str | None
    created_at: str
    updated_at: str | None
