from pydantic import BaseModel, UUID4


class Message(BaseModel):
    text: str
    room_id: UUID4
    reply_message_id: UUID4 | None = None


class UserTyping(BaseModel):
    room_id: UUID4


class SearchUsers(BaseModel):
    search: str


class SearchTags(BaseModel):
    search: str


class SearchRooms(BaseModel):
    search: str
    themes: set[str] | None = None
    tags: set[str] | None = None
    languages: set[str] | None = None
