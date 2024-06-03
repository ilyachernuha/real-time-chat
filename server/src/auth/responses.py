from pydantic import BaseModel, UUID4
from ..responses_global import GenericConfirmation


class ApplicationCreated(BaseModel):
    status: str
    application_id: UUID4


class SuccessfulLogin(BaseModel):
    user_id: UUID4
    session_id: UUID4
    refresh_token: str
    access_token: str


class TokenUpdate(BaseModel):
    access_token: str
    new_refresh_token: str


class Session(BaseModel):
    session_id: UUID4
    device_info: str
    latest_activity: float


class ActiveSessions(BaseModel):
    sessions: list[Session]


class UsernameUpdate(BaseModel):
    status: str
    new_username: str


class EmailUpdate(BaseModel):
    status: str
    new_email: str
