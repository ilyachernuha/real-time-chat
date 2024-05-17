from pydantic import BaseModel, UUID4


class Message(BaseModel):
    text: str
    room_id: UUID4


class UserTyping(BaseModel):
    room_id: UUID4
