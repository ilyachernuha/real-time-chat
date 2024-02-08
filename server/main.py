from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import socketio
from pydantic import ValidationError
import time
import uuid
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import datetime
import schemas
from database import init_db, get_db, db_session
import crud
import db_models
from email_utils import send_email_confirmation
from auth import (
    generate_token, validate_token, validata_token_in_header, ph, validate_username, validate_password, verify_password,
    validate_name
)


init_db()
app = FastAPI()
security = HTTPBasic()
sio = socketio.AsyncServer(async_mode="asgi")
sid_user_data = dict()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
async def ping():
    return "pong"


@app.post("/create_account")
async def register(body: schemas.Registration, db: Session = Depends(get_db)):
    validate_username(body.username)
    validate_password(body.password)
    hashed_password = ph.hash(body.password)
    try:
        if crud.get_user_by_username(db, body.username):
            raise HTTPException(status_code=400, detail="This username is taken")
        if crud.get_user_by_email(db, body.email):
            raise HTTPException(status_code=400, detail="Account with this email already exists")
        application = crud.create_register_application(db=db, username=body.username,
                                                       email=body.email, hashed_password=hashed_password)
        application_id = str(application.application_id)
        send_email_confirmation(receiver=body.email, code=application.confirmation_code, device_info=body.device_info)
        return {"status": "Email confirmation required", "application_id": application_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/finish_registration")
async def finish_registration(body: schemas.RegistrationConfirmation, db: Session = Depends(get_db)):
    try:
        application = crud.get_register_application_by_id(db, uuid.UUID(body.application_id))
        if application is None:
            raise HTTPException(status_code=404, detail="Register application not found")
        if datetime.datetime.utcnow() > application.timestamp + datetime.timedelta(minutes=15):
            raise HTTPException(status_code=403, detail="Register application expired")
        if application.status == db_models.RegisterApplication.Status.failed:
            raise HTTPException(status_code=400, detail="Too many failed attempts")
        if application.status != db_models.RegisterApplication.Status.pending:
            raise HTTPException(status_code=403, detail="This email is already in use")
        if application.confirmation_code != body.confirmation_code:
            application = crud.increase_failed_registration_confirmations(db, uuid.UUID(body.application_id))
            if application.failed_attempts >= 3:
                crud.make_register_application_failed(db, uuid.UUID(body.application_id))
            raise HTTPException(status_code=400, detail="Incorrect confirmation code")

        crud.confirm_register_application_and_invalidate_others_with_same_email(db, application.application_id)
        user_id = str(crud.create_user(db=db, username=application.username,
                                       hashed_password=application.hashed_password, name=application.username,
                                       email=application.email))
        token = generate_token(user_id)
        return {"user_id": user_id, "token": token}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/login")
async def login(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        username = credentials.username
        password = credentials.password

        try:
            schemas.Email(email=username)
            user = crud.get_user_by_email(db, username)
        except ValidationError:
            user = crud.get_user_by_username(db, username)

        if user is None:
            raise HTTPException(status_code=400, detail="Account with this login does not exist")
        verify_password(user.account_data.hashed_password, password)
        user_id_str = str(user.user_id)
        token = generate_token(user_id_str)
        return {"user_id": user_id_str, "token": token}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/guest_login")
async def guest_login(body: schemas.GuestLogin, db: Session = Depends(get_db)):
    validate_name(body.name)
    try:
        user_id_str = str(crud.create_guest_user(db, body.name))
        token = generate_token(user_id_str)
        return {"user_id": user_id_str, "token": token}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/change_name")
async def change_name(body: schemas.UpdateName, user_id: str = Depends(validata_token_in_header),
                      db: Session = Depends(get_db)):
    validate_name(body.new_name)
    try:
        user = crud.update_user_name(db, uuid.UUID(user_id), body.new_name)
        return {"status": "success", "new_name": user.name}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@sio.event
async def connect(sid, environ, auth):
    token = auth.get("token")
    if token is None:
        return False
    user_id = validate_token(token)
    if user_id is None:
        return False
    sid_user_data[sid] = user_id


@sio.event
async def disconnect(sid):
    sid_user_data.pop(sid, None)


@sio.event
async def message(sid, data):
    with db_session() as db:
        try:
            validated_data = schemas.Message(**data)
            user_id = sid_user_data[sid]
            name = crud.get_user_by_id(db, user_id).name
            await sio.emit("message", {
                "user": {
                    "id": user_id,
                    "name": name
                },
                "text": validated_data.text,
                "room": validated_data.room,
                "timestamp": int(time.time() * 1000)
            })
        except ValidationError:
            pass


@sio.event
async def start_typing(sid, data):
    with db_session() as db:
        try:
            room = schemas.Typing(**data).room
            user_id = sid_user_data[sid]
            name = crud.get_user_by_id(db, user_id).name
            await sio.emit("start_typing", {
                "user": {
                    "id": user_id,
                    "name": name
                },
                "room": room
            })
        except ValidationError:
            pass


@sio.event
async def stop_typing(sid, data):
    with db_session() as db:
        try:
            room = schemas.Typing(**data).room
            user_id = sid_user_data[sid]
            name = crud.get_user_by_id(db, user_id).name
            await sio.emit("stop_typing", {
                "user": {
                    "id": user_id,
                    "name": name
                },
                "room": room
            })
        except ValidationError:
            pass


app.mount("/socket.io", socketio.ASGIApp(sio))
