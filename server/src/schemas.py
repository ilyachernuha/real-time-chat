from pydantic import BaseModel, EmailStr, UUID4


# REQUEST SCHEMAS


class Registration(BaseModel):
    username: str
    email: EmailStr
    password: str
    device_info: str = "Unknown"


class RegistrationConfirmation(BaseModel):
    application_id: UUID4
    confirmation_code: str


class Login(BaseModel):
    device_info: str = "Unknown"
    # Basic auth must be included in HTTP header


class GuestLogin(BaseModel):
    name: str
    device_info: str = "Unknown"


class TokenRefresh(BaseModel):
    refresh_token: str


class UpdateName(BaseModel):
    new_name: str
    # Access token must be included in HTTP header


class UpdateUsername(BaseModel):
    new_username: str
    # Basic auth must be included in HTTP header


class UpdateEmail(BaseModel):
    new_email: EmailStr
    # Basic auth must be included in HTTP header


class UpdateEmailConfirmation(BaseModel):
    application_id: UUID4
    confirmation_code: str


class UpdatePassword(BaseModel):
    new_password: str
    session_id: UUID4
    # Basic auth must be included in HTTP header


class ResetPassword(BaseModel):
    email: EmailStr


class FinishResetPassword(BaseModel):
    application_id: UUID4
    new_password: str


class UpgradeAccount(BaseModel):
    username: str
    email: EmailStr
    password: str
    # Access token must be included in HTTP header


class UpgradeAccountConfirmation(BaseModel):
    application_id: UUID4
    confirmation_code: str
    # Access token must be included in HTTP header


class CloseSession(BaseModel):
    session_id: UUID4
    # Access token must be included in HTTP header


# RESPONSE SCHEMAS


class GenericConfirmation(BaseModel):
    status: str


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
    latest_activity: str


class ActiveSessions(BaseModel):
    sessions: list[Session]


class NaneUpdate(BaseModel):
    status: str
    new_name: str


class UsernameUpdate(BaseModel):
    status: str
    new_username: str


class EmailUpdate(BaseModel):
    status: str
    new_email: str


# SIO EVENT SCHEMAS


class Message(BaseModel):
    text: str
    room: str


class Typing(BaseModel):
    room: str
