from pydantic import BaseModel, UUID4


class UserToAdd(BaseModel):
    user_id: UUID4
    make_admin: bool | None = None


class RoomCreation(BaseModel):
    title: str
    description: str | None = None
    theme: str
    languages: set[str]
    tags: set[str]
    make_public: bool = True
    users_to_add: list[UserToAdd] | None = None


class RoomUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    theme: str | None = None
    languages: set[str] | None = None
    tags_to_add: set[str] | None = None
    tags_to_remove: set[str] | None = None
    public: bool | None = None


class JoinRoom(BaseModel):
    room_id: UUID4


class LeaveRoom(BaseModel):
    room_id: UUID4


class AddUsers(BaseModel):
    room_id: UUID4
    users: list[UserToAdd]
