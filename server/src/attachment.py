from pydantic import BaseModel, ConfigDict
from enum import Enum
from io import BytesIO


class AttachmentType(Enum):
    file = "file"
    image = "image"
    video = "video"
    audio = "audio"
    voice_message = "voice_message"


class Attachment(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    type: AttachmentType
    file: BytesIO
    filename: str | None = None
