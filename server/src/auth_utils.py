from fastapi.security import HTTPBasicCredentials
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
from argon2 import PasswordHasher
from argon2.exceptions import Argon2Error
from sqlalchemy.ext.asyncio import AsyncSession
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
from exceptions import AccessTokenValidationError, FieldSubmitError, BearerTokenExtractionError


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


def validate_access_token(token: str):
    try:
        return jwt.decode(token, secret_key, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise AccessTokenValidationError("Token expired")
    except jwt.InvalidTokenError:
        raise AccessTokenValidationError("Invalid token")


def extract_user_id_from_access_token(token: str):
    return uuid.UUID(validate_access_token(token)["user_id"])


def extract_access_token_data(token: str):
    payload = validate_access_token(token)
    user_id = uuid.UUID(payload["user_id"])
    session_id = uuid.UUID(payload["session_id"])
    return user_id, session_id


def generate_refresh_token():
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str):
    return hashlib.sha512(token.encode()).hexdigest()


async def get_and_validate_session_from_refresh_token(db: AsyncSession, token: str):
    session = await crud.get_session_by_refresh_token_hash(db, hash_refresh_token(token))
    if session is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return session


def extract_token_from_raw_header(auth_header: str):
    if auth_header is None:
        raise BearerTokenExtractionError("Authorization header not present")
    scheme, token = auth_header.split()
    if scheme != "Bearer":
        raise BearerTokenExtractionError("Unsupported authorization type")
    return token


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


async def hash_password(password: str):
    return await run_in_threadpool(lambda: ph.hash(password))


async def verify_password(hashed_password, password):
    try:
        if await run_in_threadpool(lambda: ph.verify(hashed_password, password)):
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


async def get_user_by_basic_auth(db: AsyncSession, credentials: HTTPBasicCredentials):
    username = credentials.username
    password = credentials.password

    if is_email(username):
        user = await crud.get_user_by_email(db, username)
    else:
        user = await crud.get_user_by_username(db, username)

    if user is None:
        raise HTTPException(status_code=400, detail="Account with this login does not exist")

    await verify_password((await user.awaitable_attrs.account_data).hashed_password, password)
    return user


async def get_user_by_access_token(db: AsyncSession, token: str):
    user_id = extract_user_id_from_access_token(token)
    return await crud.get_user_by_id(db, user_id)


async def check_if_user_is_guest(db: AsyncSession, user_id: uuid.UUID):
    user = await crud.get_user_by_id(db, user_id)
    if not user.is_guest:
        raise HTTPException(status_code=409, detail="This account is not guest")


async def check_if_username_is_available(db: AsyncSession, username: str):
    user = await crud.get_user_by_username(db, username)
    if user is not None:
        raise FieldSubmitError(status_code=400, detail="This username is taken", field="username")


def check_if_application_exists(application: db_models.RegisterApplication | db_models.ChangeEmailApplication |
                                db_models.UpgradeAccountApplication | db_models.ResetPasswordApplication | None):
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")


async def check_if_email_is_available(db: AsyncSession, email: str):
    user = await crud.get_user_by_email(db, email)
    if user is not None:
        raise FieldSubmitError(status_code=400, detail="Account with this email already exists", field="email")
    application = await crud.get_pending_rollback_change_email_application_by_email(db, email)
    if application is not None:
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


def check_upgrade_account_application_status(status: db_models.UpgradeAccountApplication.Status):
    if status == db_models.UpgradeAccountApplication.Status.expired:
        raise HTTPException(status_code=403, detail="Register application expired")
    if status == db_models.UpgradeAccountApplication.Status.failed:
        raise HTTPException(status_code=400, detail="Too many failed attempts")
    if status != db_models.UpgradeAccountApplication.Status.pending:
        raise HTTPException(status_code=403, detail="This email is already in use")
