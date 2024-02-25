from fastapi.security import HTTPBasicCredentials
from fastapi import HTTPException
from argon2 import PasswordHasher
from argon2.exceptions import Argon2Error
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, ValidationError
import jwt
import secrets
import uuid
import hashlib
import re
import time
import os
from dotenv import load_dotenv
import crud
import db_models
from exceptions import AccessTokenValidationError, FieldSubmitError


load_dotenv()

ph = PasswordHasher()
secret_key = os.getenv("SECRET_KEY")


def generate_access_token(user_id_str: str, session_id_str: str):
    token = jwt.encode({
        "user_id": user_id_str,
        "session_id": session_id_str,
        "exp": int(time.time()) + 900
    }, secret_key, algorithm="HS256")
    return token


def extract_access_token_data(token: str):
    try:
        return jwt.decode(token, secret_key, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise AccessTokenValidationError("Token expired")
    except jwt.InvalidTokenError:
        raise AccessTokenValidationError("Invalid token")


def extract_user_id_from_access_token(token: str):
    return uuid.UUID(extract_access_token_data(token)["user_id"])


def generate_refresh_token():
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str):
    return hashlib.sha512(token.encode()).hexdigest()


def get_and_validate_session_from_refresh_token(db: Session, token: str):
    session = crud.get_session_by_refresh_token_hash(db, hash_refresh_token(token))
    if session is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return session


def validate_name(name: str):
    if not (1 <= len(name) <= 16):
        raise FieldSubmitError(status_code=400, detail="Name must be 1 to 16 characters long", field="name")

    if name.isspace():
        raise FieldSubmitError(status_code=400, detail="Name cannot consist of whitespace only", field="name")

    if re.match(r"[\x00-\x1F\x7F]", name):
        raise FieldSubmitError(status_code=400, detail="Name cannot contain control or non-displayable characters",
                               field="name")


def validate_username(username: str):
    if not (2 <= len(username) <= 24):
        raise FieldSubmitError(status_code=400, detail="Username must be 2 to 24 characters long", field="username")

    if not re.match(r"^[a-zA-Z0-9]+$", username):
        raise FieldSubmitError(status_code=400, detail="Username can have only English letters and numbers",
                               field="username")


def validate_password(password: str):
    if not (8 <= len(password) <= 32):
        raise FieldSubmitError(status_code=400, detail="Password must be 8 to 32 characters long", field="password")

    if not re.match(r"^[!-~]+$", password):
        raise FieldSubmitError(status_code=400, detail="Password can have only ASCII symbols excluding whitespace",
                               field="password")


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
        raise FieldSubmitError(status_code=400, detail="This username is taken", field="username")


def check_if_email_is_available(db: Session, email: str):
    if crud.get_user_by_email(db, email):
        raise FieldSubmitError(status_code=400, detail="Account with this email already exists", field="email")
    if crud.get_pending_rollback_change_email_application_by_email(db, email):
        raise FieldSubmitError(status_code=400, detail="This email is temporarily reserved", field="email")


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
