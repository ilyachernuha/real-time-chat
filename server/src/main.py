from fastapi import FastAPI, Depends, HTTPException, Request, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse
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
import room_utils
import html_generator
from sio import sio
from exceptions import AccessTokenValidationError, FieldSubmitError


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


@app.exception_handler(FieldSubmitError)
async def field_submit_error_handler(request: Request, exc: FieldSubmitError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "field": exc.field
        }
    )


@app.exception_handler(AccessTokenValidationError)
async def access_token_validation_error_handler(request: Request, exc: AccessTokenValidationError):
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


@app.get("/ping", response_class=PlainTextResponse)
async def ping():
    return "pong"


@app.post("/create_account", response_model=schemas.ApplicationCreated, tags=["auth"])
async def register(body: schemas.Registration, db: Session = Depends(get_db)):
    auth_utils.validate_username(body.username)
    auth_utils.validate_password(body.password)
    hashed_password = auth_utils.ph.hash(body.password)

    auth_utils.check_if_username_is_available(db, body.username)
    auth_utils.check_if_email_is_available(db, body.email)
    application = crud.create_register_application(db=db, username=body.username, email=body.email,
                                                   hashed_password=hashed_password, device_info=body.device_info)
    application_id_str = str(application.application_id)
    await email_utils.send_registration_confirmation(receiver=body.email, code=application.confirmation_code,
                                                     device_info=body.device_info)
    return {"status": "Email confirmation required", "application_id": application_id_str}


@app.post("/finish_registration", response_model=schemas.SuccessfulLogin, tags=["auth"])
async def finish_registration(body: schemas.RegistrationConfirmation, db: Session = Depends(get_db)):
    application = crud.get_register_application_by_id(db, body.application_id)
    auth_utils.check_if_application_exists(application)
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
                                  device_info=application.device_info)
    user_id_str = str(user.user_id)
    session_id_str = str(session.session_id)
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {
        "user_id": user_id_str,
        "session_id": session_id_str,
        "refresh_token": refresh_token,
        "access_token": access_token
    }


@app.post("/login", response_model=schemas.SuccessfulLogin, tags=["auth"])
async def login(body: schemas.Login = Body(default=None), credentials: HTTPBasicCredentials = Depends(security_basic),
                db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_basic_auth(db, credentials)
    refresh_token = auth_utils.generate_refresh_token()
    session = crud.create_session(db, user=user, refresh_token_hash=auth_utils.hash_refresh_token(refresh_token),
                                  device_info=body.device_info if body else "Unknown")
    user_id_str = str(user.user_id)
    session_id_str = str(session.session_id)
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {
        "user_id": user_id_str,
        "session_id": session_id_str,
        "refresh_token": refresh_token,
        "access_token": access_token
    }


@app.post("/guest_login", response_model=schemas.SuccessfulLogin, tags=["auth"])
async def guest_login(body: schemas.GuestLogin, db: Session = Depends(get_db)):
    auth_utils.validate_name(body.name)
    user = crud.create_guest_user(db, body.name)
    refresh_token = auth_utils.generate_refresh_token()
    session = crud.create_session(db, user=user, refresh_token_hash=auth_utils.hash_refresh_token(refresh_token),
                                  device_info=body.device_info)
    user_id_str = str(user.user_id)
    session_id_str = str(session.session_id)
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {
        "user_id": user_id_str,
        "session_id": session_id_str,
        "refresh_token": refresh_token,
        "access_token": access_token
    }


@app.post("/token_refresh", response_model=schemas.TokenUpdate, tags=["auth"])
async def token_refresh(body: schemas.TokenRefresh, db: Session = Depends(get_db)):
    session = auth_utils.get_and_validate_session_from_refresh_token(db, body.refresh_token)
    user_id_str = str(session.user.user_id)
    session_id_str = str(session.session_id)
    new_refresh_token = auth_utils.generate_refresh_token()
    crud.update_session_refresh_token_hash_and_update_expire_time(db, session.session_id,
                                                                  auth_utils.hash_refresh_token(new_refresh_token))
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {"access_token": access_token, "new_refresh_token": new_refresh_token}


@app.put("/change_name", response_model=schemas.NameUpdate, tags=["auth"])
async def change_name(body: schemas.UpdateName, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    auth_utils.validate_name(body.new_name)
    user = crud.update_user_name(db, user_id, body.new_name)
    return {"status": "success", "new_name": user.name}


@app.put("/change_username", response_model=schemas.UsernameUpdate, tags=["auth"])
async def change_username(body: schemas.UpdateUsername, credentials: HTTPBasicCredentials = Depends(security_basic),
                          db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_basic_auth(db, credentials)
    auth_utils.validate_username(body.new_username)
    auth_utils.check_if_username_is_available(db, body.new_username)
    crud.update_username(db, user.user_id, body.new_username)
    return {"status": "success", "new_username": user.account_data.username}


@app.post("/change_email", response_model=schemas.ApplicationCreated, tags=["auth"])
async def change_email(body: schemas.UpdateEmail, credentials: HTTPBasicCredentials = Depends(security_basic),
                       db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_basic_auth(db, credentials)
    auth_utils.check_if_email_is_available(db, body.new_email)
    application = crud.create_change_email_application(db, user.user_id, body.new_email)
    await email_utils.send_change_email_confirmation(body.new_email, application.confirmation_code,
                                               user.account_data.username)
    application_id_str = str(application.application_id)
    return {"status": "Email confirmation required", "application_id": application_id_str}


@app.post("/finish_change_email", response_model=schemas.EmailUpdate, tags=["auth"])
async def finish_change_email(body: schemas.UpdateEmailConfirmation, db: Session = Depends(get_db)):
    application = crud.get_change_email_application_by_id(db, body.application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_change_email_application_status(application.status)
    if application.confirmation_code != body.confirmation_code:
        crud.increase_failed_change_email_attempts(db, application.application_id)
        raise HTTPException(status_code=400, detail="Incorrect confirmation code")

    auth_utils.check_if_email_is_available(db, application.new_email)
    user = crud.update_email(db, application.user_id, application.new_email)
    application = crud.make_change_email_application_confirmed(db, application.application_id)
    await email_utils.send_email_change_rollback(application.old_email,
                                           str(application.application_id), user.account_data.username)
    return {"status": "Email changed", "new_email": user.account_data.email}


@app.get("/rollback_email_change/{application_id}", response_model=schemas.GenericConfirmation, tags=["auth"])
async def rollback_email_change(application_id: uuid.UUID, db: Session = Depends(get_db)):
    application = crud.get_change_email_application_by_id(db, application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_change_email_rollback_status(application.status)

    crud.update_email(db, application.user_id, application.old_email)
    crud.make_change_email_application_rolled_back(db, application_id)
    return {"status": "Email change rolled back"}


@app.put("/change_password", response_model=schemas.GenericConfirmation, tags=["auth"])
async def change_password(body: schemas.UpdatePassword, credentials: HTTPBasicCredentials = Depends(security_basic),
                          db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_basic_auth(db, credentials)
    auth_utils.validate_password(body.new_password)
    new_password_hash = auth_utils.ph.hash(body.new_password)
    crud.update_password(db, user.user_id, new_password_hash)
    crud.delete_sessions_by_user_id_except_one(db, user.user_id, body.session_id)
    return {"status": "success"}


@app.post("/reset_password", response_model=schemas.GenericConfirmation, tags=["auth"])
async def reset_password(body: schemas.ResetPassword, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, body.email)
    if user is None:
        raise HTTPException(status_code=404, detail="Account with this email does not exist")
    if user.is_guest:
        raise HTTPException(status_code=400, detail="This is a guest user")
    application = crud.create_reset_password_application(db, user.account_data.user_id)
    await email_utils.send_reset_password_email(receiver=body.email, application_id=str(application.application_id))

    return {"status": "email sent"}


@app.get("/reset_password_page/{application_id}", response_class=HTMLResponse, tags=["auth"])
async def reset_password_page(application_id: uuid.UUID, db: Session = Depends(get_db)):
    application = crud.get_reset_password_application(db, application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_reset_password_application_status(application.status)
    return HTMLResponse(html_generator.generate_reset_password_page(str(application_id)))


@app.post("/finish_reset_password", response_model=schemas.GenericConfirmation, tags=["auth"])
async def finish_reset_password(body: schemas.FinishResetPassword, db: Session = Depends(get_db)):
    application = crud.get_reset_password_application(db, body.application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_reset_password_application_status(application.status)

    auth_utils.validate_password(body.new_password)
    new_password_hash = auth_utils.ph.hash(body.new_password)
    crud.update_password(db, application.user_id, new_password_hash)
    crud.make_reset_password_application_used(db, application.application_id)
    crud.delete_sessions_by_user_id(db, application.user_id)

    return {"status": "success"}


@app.post("/upgrade_account", response_model=schemas.ApplicationCreated, tags=["auth"])
async def upgrade_account(body: schemas.UpgradeAccount,
                          credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                          db: Session = Depends(get_db)):
    user_id, session_id = auth_utils.extract_access_token_data(credentials.credentials)

    auth_utils.validate_username(body.username)
    auth_utils.validate_password(body.password)
    hashed_password = auth_utils.ph.hash(body.password)

    auth_utils.check_if_username_is_available(db, body.username)
    auth_utils.check_if_email_is_available(db, body.email)
    auth_utils.check_if_user_is_guest(db, user_id)
    application = crud.create_upgrade_account_application(db=db, user_id=user_id, username=body.username,
                                                          email=body.email, hashed_password=hashed_password)
    application_id_str = str(application.application_id)

    device_info = crud.get_session_by_id(db, session_id).device_info
    await email_utils.send_registration_confirmation(receiver=body.email, code=application.confirmation_code,
                                               device_info=device_info)
    return {"status": "Email confirmation required", "application_id": application_id_str}


@app.post("/finish_upgrade_account", response_model=schemas.GenericConfirmation, tags=["auth"])
async def finish_upgrade_account(body: schemas.UpgradeAccountConfirmation,
                                 credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                                 db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    application = crud.get_upgrade_account_application_by_id(db, body.application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_upgrade_account_application_status(application.status)
    if application.confirmation_code != body.confirmation_code:
        crud.increase_failed_upgrade_account_attempts(db, body.application_id)
        raise HTTPException(status_code=400, detail="Incorrect confirmation code")

    auth_utils.check_if_username_is_available(db, application.username)
    auth_utils.check_if_email_is_available(db, application.email)
    auth_utils.check_if_user_is_guest(db, user_id)
    crud.make_upgrade_account_confirmed(db, application.application_id)
    crud.upgrade_user_account(db=db, user_id=user_id, username=application.username,
                              hashed_password=application.hashed_password, email=application.email)
    return {"status": "success"}


@app.get("/active_sessions", response_model=schemas.ActiveSessions, tags=["auth"])
async def get_active_sessions(credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                              db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    sessions = crud.get_sessions_by_user_id(db, user_id)
    session_list = [
        {
            "session_id": str(session.session_id),
            "device_info": session.device_info,
            "latest_activity": session.latest_activity.isoformat()
        }
        for session in sessions
    ]
    return {"sessions": session_list}


@app.post("/close_session", response_model=schemas.GenericConfirmation, tags=["auth"])
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


@app.post("/create_room", response_model=schemas.RoomCreated, tags=["rooms"])
async def create_room(body: schemas.RoomCreation, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_access_token(db, credentials.credentials)
    room_utils.check_if_creator_not_guest(user)
    room_utils.validate_title(body.title)
    room_utils.validate_description(body.description)
    theme = room_utils.get_theme_from_string(body.theme)
    languages = room_utils.get_language_list_from_codes(body.languages)
    room_utils.validate_tag_names(body.tags)
    tags = room_utils.get_or_create_tags_from_string_set(db, body.tags)
    room = crud.create_room(db=db, owner=user, title=body.title, description=body.description, theme=theme,
                            languages=languages, tags=tags)
    crud.add_user_to_room(db=db, room_id=room.room_id, user=user, make_admin=True)
    return {"status": "success", "room_id": room.room_id}


@app.patch("/update_room/{room_id}", response_model=schemas.GenericConfirmation, tags=["rooms"])
async def update_room(room_id: uuid.UUID, body: schemas.RoomUpdate,
                      credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = crud.get_room_by_id(db, room_id)
    room_utils.check_if_room_exists(room)
    room_utils.check_if_user_is_admin(db=db, user_id=user_id, room=room)
    room_utils.validate_room_update_data(body)
    room_utils.patch_room(db=db, room=room, update=body)
    return {"status": "success"}


@app.get("/room_info/{room_id}", response_model=schemas.RoomInfo, tags=["rooms"])
async def get_room_info(room_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                        db: Session = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    room = crud.get_room_by_id(db, room_id)
    room_utils.check_if_room_exists(room)
    return {
        "title": room.title,
        "description": room.description,
        "theme": room.theme.value,
        "languages": room_utils.convert_room_languages_to_str_list(room.languages),
        "tags": room_utils.convert_room_tags_to_str_list(list(room.tags))
    }


@app.delete("/delete_room/{room_id}", response_model=schemas.GenericConfirmation, tags=["rooms"])
async def delete_room(room_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = crud.get_room_by_id(db, room_id)
    room_utils.check_if_room_exists(room)
    room_utils.check_if_user_is_owner(user_id, room)
    crud.delete_room(db, room_id)
    return {"status": "success"}


@app.post("/join_room", response_model=schemas.GenericConfirmation, tags=["rooms"])
async def join_room(body: schemas.JoinRoom, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                    db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_access_token(db, credentials.credentials)
    room = crud.get_room_by_id(db, body.room_id)
    room_utils.check_if_room_exists(room)
    room_utils.check_if_user_can_join_room(db, user.user_id, room)
    crud.add_user_to_room(db=db, room_id=room.room_id, user=user)
    return {"status": "success"}


@app.post("/leave_room", response_model=schemas.GenericConfirmation, tags=["rooms"])
async def leave_room(body: schemas.LeaveRoom, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = crud.get_room_by_id(db, body.room_id)
    room_utils.check_if_room_exists(room)
    room_utils.check_if_user_can_leave_room(db, user_id, room)
    crud.remove_user_from_room(db=db, room_id=room.room_id, user_id=user_id)
    return {"status": "success"}


@app.post("/add_users_to_room", response_model=schemas.GenericConfirmation, tags=["rooms"])
async def add_users_to_room(body: schemas.AddUsers,
                            credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                            db: Session = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = crud.get_room_by_id(db, body.room_id)
    room_utils.check_if_room_exists(room)
    add_admins = any(user.make_admin for user in body.users)
    room_utils.check_if_user_can_add_users_to_room(db=db, user_id=user_id, room=room, add_admins=add_admins)
    add_data = room_utils.get_and_validate_list_of_users_to_add(db=db, room=room, add_list=body.users)
    for user, make_admin in add_data:
        crud.add_user_to_room(db=db, room_id=room.room_id, user=user, make_admin=make_admin)
    return {"status": "success"}


@app.get("/find_rooms", response_model=schemas.RoomList, tags=["rooms"])
async def find_rooms(search: str | None = None, themes: list[str] = Query(default=None),
                     tags: list[str] = Query(default=None), languages: list[str] = Query(default=None),
                     credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: Session = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    if search is None and themes is None and tags is None and languages is None:
        raise HTTPException(status_code=400, detail="Empty search and filters not allowed")
    if search is not None:
        room_utils.validate_title(search)
    if tags is not None:
        room_utils.validate_tag_names(set(tags))
    rooms = crud.filter_rooms(db=db, title=search,
                              themes=[room_utils.get_theme_from_string(theme) for theme in themes] if themes else None,
                              languages=room_utils.get_language_list_from_codes(set(languages)) if languages else None,
                              tags=tags)
    rooms_data = [{"room_id": room.room_id, "title": room.title} for room in rooms]
    return {"rooms": rooms_data}


@app.get("/my_rooms", response_model=schemas.RoomList, tags=["rooms"])
async def my_rooms(credentials: HTTPAuthorizationCredentials = Depends(security_bearer), db: Session = Depends(get_db)):
    user = auth_utils.get_user_by_access_token(db, credentials.credentials)
    rooms = [{"room_id": room.room_id, "title": room.room.title} for room in user.rooms]
    return {"rooms": rooms}


@app.get("/find_tags", response_model=schemas.TagList, tags=["rooms"])
async def find_tags(search: str, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                    db: Session = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    room_utils.validate_tag_name(search)
    tags = [tag.tag for tag in crud.search_tag(db=db, tag_name=search, limit=None)]
    return {"tags": tags}


@app.get("/find_users", response_model=schemas.UserList, tags=["rooms"])
async def find_users(search: str, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: Session = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    auth_utils.validate_username(search)
    users = crud.search_users(db=db, username=search, limit=None)
    users_data = [
        {
            "user_id": user.user_id,
            "username": user.account_data.username,
            "name": user.name
        }
        for user in users
    ]
    return {"users": users_data}


app.mount("/public", StaticFiles(directory="../public"))
app.mount("/socket.io", socketio.ASGIApp(sio))
