from pydantic import BaseModel, UUID4


class EditMessage(BaseModel):
    text: str


class Message(BaseModel):
    text: str
    room_id: UUID4
