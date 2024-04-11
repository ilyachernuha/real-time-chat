from pydantic import BaseModel


class Message(BaseModel):
    text: str
    room: str


class Typing(BaseModel):
    room: str
