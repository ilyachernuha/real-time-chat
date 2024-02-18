from pydantic import BaseModel, EmailStr, UUID4


class Registration(BaseModel):
    username: str
    email: EmailStr
    password: str
    device_info: str = "Unknown"


class RegistrationConfirmation(BaseModel):
    application_id: UUID4
    confirmation_code: str


class GuestLogin(BaseModel):
    name: str


class UpdateName(BaseModel):
    new_name: str
    # Bearer token must be included in HTTP header


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
    # Basic auth must be included in HTTP header


class ResetPassword(BaseModel):
    email: EmailStr


class FinishResetPassword(BaseModel):
    application_id: UUID4
    new_password: str


class Message(BaseModel):
    text: str
    room: str


class Typing(BaseModel):
    room: str
