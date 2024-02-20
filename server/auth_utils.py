from fastapi.security import HTTPBasic, HTTPBasicCredentials, OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from argon2 import PasswordHasher
from argon2.exceptions import Argon2Error
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, ValidationError
import jwt
import secrets
import re
import crud
import db_models


security = HTTPBasic()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
ph = PasswordHasher()
secret_key = secrets.token_hex(256)


def generate_token(user_id):
    token = jwt.encode({'user': user_id}, secret_key, algorithm='HS256')
    return token


def validate_token(token: str):
    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        user_id = payload['user']
        return user_id
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def validata_token_in_header(token: str = Depends(oauth2_scheme)):
    user_id = validate_token(token)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid token")
    return user_id


def validate_name(name: str):
    if not (1 <= len(name) <= 16):
        raise HTTPException(status_code=400, detail="Name must be 1 to 16 characters long")

    if name.isspace():
        raise HTTPException(status_code=400, detail="Name cannot consist of whitespace only")

    if re.match(r"[\x00-\x1F\x7F]", name):
        raise HTTPException(status_code=400, detail="Name cannot contain control or non-displayable characters")


def validate_username(username: str):
    if not (2 <= len(username) <= 24):
        raise HTTPException(status_code=400, detail="Username must be 2 to 24 characters long")

    if not re.match(r"^[a-zA-Z0-9]+$", username):
        raise HTTPException(status_code=400, detail="Username can have only English letters and numbers")


def validate_password(password: str):
    if not (8 <= len(password) <= 32):
        raise HTTPException(status_code=400, detail="Password must be 8 to 32 characters long")

    if not re.match(r"^[!-~]+$", password):
        raise HTTPException(status_code=400, detail="Password can have only ASCII symbols excluding whitespace")


def verify_password(hashed_password, password):
    try:
        if ph.verify(hashed_password, password):
            return True
        else:
            raise HTTPException(status_code=400, detail="Incorrect username or password")
    except Argon2Error:
        raise HTTPException(status_code=400, detail="Incorrect username or password")


def is_email(string_to_check: str):
    class Email(BaseModel):
        email: EmailStr

    try:
        Email(email=string_to_check)
        return True
    except ValidationError:
        return False


def get_user_by_basic_auth(db: Session, credentials: HTTPBasicCredentials):
    username = credentials.username
    password = credentials.password

    if is_email(username):
        user = crud.get_user_by_email(db, username)
    else:
        user = crud.get_user_by_username(db, username)

    if user is None:
        raise HTTPException(status_code=400, detail="Account with this login does not exist")

    verify_password(user.account_data.hashed_password, password)
    return user


def check_if_username_is_available(db: Session, username: str):
    if crud.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="This username is taken")


def check_if_email_is_available(db: Session, email: str):
    if crud.get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Account with this email already exists")
    if crud.get_pending_rollback_change_email_application_by_email(db, email):
        raise HTTPException(status_code=400, detail="This email is temporarily reserved")


def check_register_application_status(status: db_models.RegisterApplication.Status):
    if status == db_models.RegisterApplication.Status.expired:
        raise HTTPException(status_code=403, detail="Register application expired")
    if status == db_models.RegisterApplication.Status.failed:
        raise HTTPException(status_code=400, detail="Too many failed attempts")
    if status != db_models.RegisterApplication.Status.pending:
        raise HTTPException(status_code=403, detail="This email is already in use")


def check_change_email_application_status(status: db_models.ChangeEmailApplication.Status):
    if status == db_models.ChangeEmailApplication.Status.expired:
        raise HTTPException(status_code=403, detail="Application expired")
    if status == db_models.ChangeEmailApplication.Status.failed:
        raise HTTPException(status_code=400, detail="Too many failed attempts")
    if status != db_models.ChangeEmailApplication.Status.pending:
        raise HTTPException(status_code=400, detail="Application is already used")


def check_change_email_rollback_status(status: db_models.ChangeEmailApplication.RollbackStatus):
    if status == db_models.ChangeEmailApplication.RollbackStatus.expired:
        raise HTTPException(status_code=400, detail="Rollback time expired")
    if status == db_models.ChangeEmailApplication.RollbackStatus.completed:
        raise HTTPException(status_code=400, detail="Application already rolled back")
    if status == db_models.ChangeEmailApplication.RollbackStatus.unavailable:
        raise HTTPException(status_code=400, detail="Application is not confirmed")


def check_reset_password_application_status(status: db_models.ResetPasswordApplication.Status):
    if status == db_models.ResetPasswordApplication.Status.used:
        raise HTTPException(status_code=400, detail="This application is already used")
    if status == db_models.ResetPasswordApplication.Status.expired:
        raise HTTPException(status_code=400, detail="This application is expired")