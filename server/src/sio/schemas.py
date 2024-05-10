from pydantic import BaseModel, UUID4


class Message(BaseModel):
    text: str
    room: UUID4


class Typing(BaseModel):
    room: UUID4
