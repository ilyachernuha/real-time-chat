from pydantic import BaseModel, UUID4
from fastapi import Form, Depends
from dataclasses import dataclass
from .. import file_utils


class EditMessage(BaseModel):
    text: str


@dataclass
class Message:
    text: str = Form(...)
    room_id: UUID4 = Form(...)
    reply_message_id: UUID4 | None = Form(default=None)
    attachments: list[file_utils.Attachment] | None = Depends(file_utils.get_attachments)


@dataclass
class VoiceMessage:
    room_id: UUID4 = Form(...)
    reply_message_id: UUID4 | None = Form(default=None)
    voice: file_utils.Attachment | None = Depends(file_utils.get_voice)
