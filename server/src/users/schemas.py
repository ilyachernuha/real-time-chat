from pydantic import BaseModel, UUID4


# REQUESTS


class UserData(BaseModel):
    user_id: UUID4
    username: str
    name: str


class UserList(BaseModel):
    users: list[UserData]


class UpdateName(BaseModel):
    new_name: str


# RESPONSES


class NameUpdate(BaseModel):
    status: str
    new_name: str
