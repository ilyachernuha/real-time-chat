from pydantic import BaseModel, UUID4


# REQUESTS


class UpdateName(BaseModel):
    new_name: str


# RESPONSES


class GenericConfirmation(BaseModel):
    status: str


class UserData(BaseModel):
    user_id: UUID4
    username: str
    name: str
    profile_picture_id: UUID4 | None


class UserList(BaseModel):
    users: list[UserData]


class NameUpdate(BaseModel):
    status: str
    new_name: str


class UserProfile(BaseModel):
    name: str
    guest: bool
    username: str | None
    profile_picture_id: UUID4 | None


class OwnProfile(BaseModel):
    name: str
    guest: bool
    username: str | None
    email: str | None
    profile_picture_id: UUID4 | None


class ProfilePictureUpdate(BaseModel):
    status: str
    profile_picture_id: UUID4
