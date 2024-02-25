from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import socketio
import uuid
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import schemas
from database import init_db, get_db
import crud
import bg_tasks
import email_utils
import auth_utils
import html_generator
from sio import sio


init_db()
app = FastAPI()
security_basic = HTTPBasic()
security_bearer = HTTPBearer()


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


@app.exception_handler(auth_utils.AccessTokenValidationError)
async def access_token_validation_error_handler(request: Request, exc: auth_utils.AccessTokenValidationError):
    return JSONResponse(
        status_code=401,
        content={"detail": str(exc)}
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected database error"}
    )


@app.get("/ping")
async def ping():
    return "pong"


@app.post("/create_account")
async def register(body: schemas.Registration, db: Session = Depends(get_db)):
    auth_utils.validate_username(body.username)
    auth_utils.validate_password(body.password)
    hashed_password = auth_utils.ph.hash(body.password)

    auth_utils.check_if_username_is_available(db, body.username)
    auth_utils.check_if_email_is_available(db, body.email)
    application = crud.create_register_application(db=db, username=body.username,
                                                   email=body.email, hashed_password=hashed_password)
    application_id = str(application.application_id)
    email_utils.send_registration_confirmation(receiver=body.email, code=application.confirmation_code,
                                               device_info=body.device_info)
    return {"status": "Email confirmation required", "application_id": application_id}


@app.post("/finish_registration")
async def finish_registration(body: schemas.RegistrationConfirmation, db: Session = Depends(get_db)):
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
    user = crud.create_user(db=db, username=application.username, hashed_password=application.hashed_password,
                            name=application.username, email=application.email)
    refresh_token = auth_utils.generate_refresh_token()
    session = crud.create_session(db, user=user, refresh_token_hash=auth_utils.hash_refresh_token(refresh_token),
                                  device_info="unknown")
    user_id_str = str(user.user_id)
    session_id_str = str(session.session_id)
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {
        "user_id": user_id_str,
        "session_id": session_id_str,
        "refresh_token": refresh_token,
        "access_token": access_token
    }


@app.post("/login")
async def login(credentials: HTTPBasicCredentials = Depends(security_basic), db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_basic_auth(db, credentials)
    refresh_token = auth_utils.generate_refresh_token()
    session = crud.create_session(db, user=user, refresh_token_hash=auth_utils.hash_refresh_token(refresh_token),
                                  device_info="unknown")
    user_id_str = str(user.user_id)
    session_id_str = str(session.session_id)
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {
        "user_id": user_id_str,
        "session_id": session_id_str,
        "refresh_token": refresh_token,
        "access_token": access_token
    }


@app.post("/guest_login")
async def guest_login(body: schemas.GuestLogin, db: Session = Depends(get_db)):
    auth_utils.validate_name(body.name)
    user = crud.create_guest_user(db, body.name)
    refresh_token = auth_utils.generate_refresh_token()
    session = crud.create_session(db, user=user, refresh_token_hash=auth_utils.hash_refresh_token(refresh_token),
                                  device_info="unknown")
    user_id_str = str(user.user_id)
    session_id_str = str(session.session_id)
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {
        "user_id": user_id_str,
        "session_id": session_id_str,
        "refresh_token": refresh_token,
        "access_token": access_token
    }


@app.post("/token_refresh")
async def token_refresh(body: schemas.TokenRefresh, db: Session = Depends(get_db)):
    session = auth_utils.get_and_validate_session_from_refresh_token(db, body.refresh_token)
    user_id_str = str(session.user.user_id)
    session_id_str = str(session.session_id)
    new_refresh_token = auth_utils.generate_refresh_token()
    crud.update_session_refresh_token_hash_and_update_expire_time(db, session.session_id,
                                                                  auth_utils.hash_refresh_token(new_refresh_token))
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {"access_token": access_token, "new_refresh_token": new_refresh_token}


@app.put("/change_name")
async def change_name(body: schemas.UpdateName, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    auth_utils.validate_name(body.new_name)
    user = crud.update_user_name(db, user_id, body.new_name)
    return {"status": "success", "new_name": user.name}


@app.put("/change_username")
async def change_username(body: schemas.UpdateUsername, credentials: HTTPBasicCredentials = Depends(security_basic),
                          db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_basic_auth(db, credentials)
    auth_utils.validate_username(body.new_username)
    auth_utils.check_if_username_is_available(db, body.new_username)
    crud.update_username(db, user.user_id, body.new_username)
    return {"status": "success", "new_username": user.account_data.username}


@app.post("/change_email")
async def change_email(body: schemas.UpdateEmail, credentials: HTTPBasicCredentials = Depends(security_basic),
                       db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_basic_auth(db, credentials)
    auth_utils.check_if_email_is_available(db, body.new_email)
    application = crud.create_change_email_application(db, user.user_id, body.new_email)
    email_utils.send_change_email_confirmation(body.new_email, application.confirmation_code,
                                               user.account_data.username)
    application_id_str = str(application.application_id)
    return {"status": "Email confirmation required", "application_id": application_id_str}


@app.post("/finish_change_email")
async def finish_change_email(body: schemas.UpdateEmailConfirmation, db: Session = Depends(get_db)):
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


@app.get("/rollback_email_change/{application_id}")
async def rollback_email_change(application_id: uuid.UUID, db: Session = Depends(get_db)):
    application = crud.get_change_email_application_by_id(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    auth_utils.check_change_email_rollback_status(application.status)

    crud.update_email(db, application.user_id, application.old_email)
    crud.make_change_email_application_rolled_back(db, application_id)
    return {"status": "Email change rolled back"}


@app.put("/change_password")
async def change_password(body: schemas.UpdatePassword, credentials: HTTPBasicCredentials = Depends(security_basic),
                          db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_basic_auth(db, credentials)
    auth_utils.validate_password(body.new_password)
    new_password_hash = auth_utils.ph.hash(body.new_password)
    crud.update_password(db, user.user_id, new_password_hash)
    crud.delete_sessions_by_user_id_except_one(db, user.user_id, body.session_id)
    return {"status": "success"}


@app.post("/reset_password")
async def reset_password(body: schemas.ResetPassword, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, body.email)
    if user is None:
        raise HTTPException(status_code=404, detail="Account with this email does not exist")
    if user.is_guest:
        raise HTTPException(status_code=400, detail="This is a guest user")
    application = crud.create_reset_password_application(db, user.account_data.user_id)
    email_utils.send_reset_password_email(receiver=body.email, application_id=str(application.application_id))

    return {"status": "email sent"}


@app.get("/reset_password_page/{application_id}")
async def reset_password_page(application_id: uuid.UUID, db: Session = Depends(get_db)):
    application = crud.get_reset_password_application(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    auth_utils.check_reset_password_application_status(application.status)
    return HTMLResponse(html_generator.generate_reset_password_page(str(application_id)))


@app.put("/finish_reset_password")
async def finish_reset_password(body: schemas.FinishResetPassword, db: Session = Depends(get_db)):
    application = crud.get_reset_password_application(db, body.application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    auth_utils.check_reset_password_application_status(application.status)

    auth_utils.validate_password(body.new_password)
    new_password_hash = auth_utils.ph.hash(body.new_password)
    crud.update_password(db, application.user_id, new_password_hash)
    crud.make_reset_password_application_used(db, application.application_id)
    crud.delete_sessions_by_user_id(db, application.user_id)

    return {"status": "success"}


@app.get("/active_sessions")
async def get_active_sessions(credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                              db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    sessions = crud.get_sessions_by_user_id(db, user_id)
    session_list = []
    for session in sessions:
        session_details = {
            "session_id": str(session.session_id),
            "device_info": session.device_info,
            "latest_activity": session.latest_activity.isoformat()
        }
        session_list.append(session_details)
    return {"sessions": session_list}


@app.post("/close_session")
async def close_session(body: schemas.CloseSession,
                        credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                        db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    session = crud.get_session_by_id(db, body.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not fount")
    if user_id != session.user_id:
        raise HTTPException(status_code=403, detail="Session is not yours")
    crud.delete_session(db, body.session_id)
    return {"status": "success"}


app.mount("/public", StaticFiles(directory="public"))
app.mount("/socket.io", socketio.ASGIApp(sio))
