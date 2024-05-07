from pydantic import BaseModel, UUID4
from ..responses_global import GenericConfirmation


class RoomCreated(BaseModel):
    status: str
    room_id: UUID4


class RoomPictureUpdate(BaseModel):
    status: str
    room_picture_id: UUID4


class RoomInfo(BaseModel):
    title: str
    description: str | None
    theme: str
    languages: list[str]
    tags: list[str]
    room_picture_id: UUID4 | None


class RoomBasicInfo(BaseModel):
    room_id: UUID4
    title: str
    room_picture_id: UUID4 | None


class RoomList(BaseModel):
    rooms: list[RoomBasicInfo]


class TagList(BaseModel):
    tags: list[str]


class RoomMember(BaseModel):
    user_id: UUID4
    username: str | None
    name: str
    profile_picture_id: UUID4 | None
    guest: bool
    admin: bool


class RoomMemberList(BaseModel):
    members: list[RoomMember]
