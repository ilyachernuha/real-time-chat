from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import socketio
from pydantic import ValidationError
from jinja2 import Environment, FileSystemLoader
import time
import uuid
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import os
from dotenv import load_dotenv
import schemas
from database import init_db, get_db, db_session
import crud
import bg_tasks
import email_utils
import auth_utils


load_dotenv()
init_db()
app = FastAPI()
security = HTTPBasic()
sio = socketio.AsyncServer(async_mode="asgi")
sid_user_data = dict()
template_env = Environment(loader=FileSystemLoader("html_templates"))


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def init_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(bg_tasks.expire_applications_task, "interval", minutes=1)
    scheduler.add_job(bg_tasks.expire_email_rollback_task, "interval", hours=1)
    scheduler.start()


@app.get("/ping")
async def ping():
    return "pong"

app.mount("/public", StaticFiles(directory="public"), name="public")

@app.post("/create_account")
async def register(body: schemas.Registration, db: Session = Depends(get_db)):
    auth_utils.validate_username(body.username)
    auth_utils.validate_password(body.password)
    hashed_password = auth_utils.ph.hash(body.password)
    try:
        auth_utils.check_if_username_is_available(db, body.username)
        auth_utils.check_if_email_is_available(db, body.email)
        application = crud.create_register_application(db=db, username=body.username,
                                                       email=body.email, hashed_password=hashed_password)
        application_id = str(application.application_id)
        email_utils.send_registration_confirmation(receiver=body.email, code=application.confirmation_code,
                                                   device_info=body.device_info)
        return {"status": "Email confirmation required", "application_id": application_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/finish_registration")
async def finish_registration(body: schemas.RegistrationConfirmation, db: Session = Depends(get_db)):
    try:
        application = crud.get_register_application_by_id(db, body.application_id)
        if application is None:
            raise HTTPException(status_code=404, detail="Register application not found")
        auth_utils.check_register_application_status(application.status)
        if application.confirmation_code != body.confirmation_code:
            crud.increase_failed_registration_attempts(db, body.application_id)
            raise HTTPException(status_code=400, detail="Incorrect confirmation code")

        auth_utils.check_if_username_is_available(db, application.username)
        auth_utils.check_if_email_is_available(db, application.email)
        crud.confirm_register_application_and_invalidate_others_with_same_email(db, application.application_id)
        user_id = str(crud.create_user(db=db, username=application.username,
                                       hashed_password=application.hashed_password, name=application.username,
                                       email=application.email))
        token = auth_utils.generate_token(user_id)
        return {"user_id": user_id, "token": token}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/login")
async def login(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        user = auth_utils.get_user_by_basic_auth(db, credentials)
        user_id_str = str(user.user_id)
        token = auth_utils.generate_token(user_id_str)
        return {"user_id": user_id_str, "token": token}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/guest_login")
async def guest_login(body: schemas.GuestLogin, db: Session = Depends(get_db)):
    auth_utils.validate_name(body.name)
    try:
        user_id_str = str(crud.create_guest_user(db, body.name))
        token = auth_utils.generate_token(user_id_str)
        return {"user_id": user_id_str, "token": token}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.put("/change_name")
async def change_name(body: schemas.UpdateName, user_id: str = Depends(auth_utils.validate_token_in_header),
                      db: Session = Depends(get_db)):
    auth_utils.validate_name(body.new_name)
    try:
        user = crud.update_user_name(db, uuid.UUID(user_id), body.new_name)
        return {"status": "success", "new_name": user.name}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.put("/change_username")
async def change_username(body: schemas.UpdateUsername, credentials: HTTPBasicCredentials = Depends(security),
                          db: Session = Depends(get_db)):
    try:
        user = auth_utils.get_user_by_basic_auth(db, credentials)
        auth_utils.validate_username(body.new_username)
        auth_utils.check_if_username_is_available(db, body.new_username)
        crud.update_username(db, user.user_id, body.new_username)
        return {"status": "success", "new_username": user.account_data.username}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/change_email")
async def change_email(body: schemas.UpdateEmail, credentials: HTTPBasicCredentials = Depends(security),
                       db: Session = Depends(get_db)):
    try:
        user = auth_utils.get_user_by_basic_auth(db, credentials)
        auth_utils.check_if_email_is_available(db, body.new_email)
        application = crud.create_change_email_application(db, user.user_id, body.new_email)
        email_utils.send_change_email_confirmation(body.new_email, application.confirmation_code,
                                                   user.account_data.username)
        application_id_str = str(application.application_id)
        return {"status": "Email confirmation required", "application_id": application_id_str}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/finish_change_email")
async def finish_change_email(body: schemas.UpdateEmailConfirmation, db: Session = Depends(get_db)):
    try:
        application = crud.get_change_email_application_by_id(db, body.application_id)
        if application is None:
            raise HTTPException(status_code=404, detail="Application not found")
        auth_utils.check_change_email_application_status(application.status)
        if application.confirmation_code != body.confirmation_code:
            crud.increase_failed_change_email_attempts(db, application.application_id)
            raise HTTPException(status_code=400, detail="Incorrect confirmation code")

        auth_utils.check_if_email_is_available(db, application.new_email)
        user = crud.update_email(db, application.user_id, application.new_email)
        application = crud.make_change_email_application_confirmed(db, application.application_id)
        email_utils.send_email_change_rollback(application.old_email,
                                               str(application.application_id), user.account_data.username)
        return {"status": "Email changed", "new_email": user.account_data.email}

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.get("/rollback_email_change/{application_id}")
async def rollback_email_change(application_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        application = crud.get_change_email_application_by_id(db, application_id)
        if application is None:
            raise HTTPException(status_code=404, detail="Application not found")
        auth_utils.check_change_email_rollback_status(application.status)

        crud.update_email(db, application.user_id, application.old_email)
        crud.make_change_email_application_rolled_back(db, application_id)
        return {"status": "Email change rolled back"}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.put("/change_password")
async def change_password(body: schemas.UpdatePassword, credentials: HTTPBasicCredentials = Depends(security),
                          db: Session = Depends(get_db)):
    try:
        user = auth_utils.get_user_by_basic_auth(db, credentials)
        auth_utils.validate_password(body.new_password)
        new_password_hash = auth_utils.ph.hash(body.new_password)
        crud.update_password(db, user.user_id, new_password_hash)
        return {"status": "success"}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.post("/reset_password")
async def reset_password(body: schemas.ResetPassword, db: Session = Depends(get_db)):
    try:
        user = crud.get_user_by_email(db, body.email)
        if user is None:
            raise HTTPException(status_code=404, detail="Account with this email does not exist")
        if user.is_guest:
            raise HTTPException(status_code=400, detail="This is a guest user")
        application = crud.create_reset_password_application(db, user.account_data.user_id)
        email_utils.send_reset_password_email(receiver=body.email, application_id=str(application.application_id))

        return {"status": "email sent"}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.get("/reset_password_page/{application_id}")
async def reset_password_page(application_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        application = crud.get_reset_password_application(db, application_id)
        if application is None:
            raise HTTPException(status_code=404, detail="Application not found")
        auth_utils.check_reset_password_application_status(application.status)

        url = os.getenv("BASE_URL") + "/finish_reset_password"
        response = template_env.get_template("reset_password_page.html").render(url=url, application_id=application_id)
        return HTMLResponse(response)

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@app.put("/finish_reset_password")
async def finish_reset_password(body: schemas.FinishResetPassword, db: Session = Depends(get_db)):
    try:
        application = crud.get_reset_password_application(db, body.application_id)
        if application is None:
            raise HTTPException(status_code=404, detail="Application not found")
        auth_utils.check_reset_password_application_status(application.status)

        auth_utils.validate_password(body.new_password)
        new_password_hash = auth_utils.ph.hash(body.new_password)
        crud.update_password(db, application.user_id, new_password_hash)
        crud.make_reset_password_application_used(db, application.application_id)

        return {"status": "success"}

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Unexpected database error")


@sio.event
async def connect(sid, environ, auth):
    token = auth.get("token")
    if token is None:
        return False
    user_id = auth_utils.validate_token(token)
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
