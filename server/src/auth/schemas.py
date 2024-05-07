from pydantic import BaseModel, UUID4, EmailStr


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


class GuestLogin(BaseModel):
    name: str
    device_info: str = "Unknown"


class TokenRefresh(BaseModel):
    refresh_token: str


class UpdateUsername(BaseModel):
    new_username: str


class UpdateEmail(BaseModel):
    new_email: EmailStr


class UpdateEmailConfirmation(BaseModel):
    application_id: UUID4
    confirmation_code: str


class UpdatePassword(BaseModel):
    new_password: str
    session_id: UUID4


class ResetPassword(BaseModel):
    email: EmailStr


class FinishResetPassword(BaseModel):
    application_id: UUID4
    new_password: str


class UpgradeAccount(BaseModel):
    username: str
    email: EmailStr
    password: str


class UpgradeAccountConfirmation(BaseModel):
    application_id: UUID4
    confirmation_code: str


class CloseSession(BaseModel):
    session_id: UUID4
