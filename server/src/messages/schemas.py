from pydantic import BaseModel, UUID4
from fastapi import Form
from dataclasses import dataclass


class EditMessage(BaseModel):
    text: str


@dataclass
class Message:
    text: str = Form(...)
    room_id: UUID4 = Form(...)
    reply_message_id: UUID4 | None = Form(default=None)
