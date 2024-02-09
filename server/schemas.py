from pydantic import BaseModel, EmailStr


class Registration(BaseModel):
    username: str
    email: EmailStr
    password: str
    device_info: str = "Unknown"


class RegistrationConfirmation(BaseModel):
    application_id: str
    confirmation_code: str


class GuestLogin(BaseModel):
    name: str


class UpdateName(BaseModel):
    new_name: str


class Message(BaseModel):
    text: str
    room: str


class Typing(BaseModel):
    room: str


class Email(BaseModel):
    email: EmailStr
