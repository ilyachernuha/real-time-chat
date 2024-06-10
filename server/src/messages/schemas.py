from pydantic import BaseModel


class EditMessage(BaseModel):
    text: str
