from pydantic import BaseModel, UUID4


class EditMessage(BaseModel):
    text: str


class Message(BaseModel):
    text: str
    room_id: UUID4
    reply_message_id: UUID4 | None = None
