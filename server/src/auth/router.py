from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPAuthorizationCredentials, HTTPBasicCredentials
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from . import crud, schemas, responses, auth_utils, email_utils
from ..users import user_utils
from ..database import get_db
from ..security import security_basic, security_bearer
from ..sio import external as sio
from .. import html_generator


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/create_account", response_model=responses.ApplicationCreated)
async def register(body: schemas.Registration, db: AsyncSession = Depends(get_db)):
    user_utils.validate_username(body.username)
    user_utils.validate_password(body.password)
    hashed_password = await auth_utils.hash_password(body.password)

    await auth_utils.check_if_username_is_available(db, body.username)
    await auth_utils.check_if_email_is_available(db, body.email)
    application = await crud.create_register_application(db=db, username=body.username, email=body.email,
                                                         hashed_password=hashed_password, device_info=body.device_info)
    application_id_str = str(application.application_id)
    await email_utils.send_registration_confirmation(receiver=body.email, code=application.confirmation_code,
                                                     device_info=body.device_info)
    return {"status": "Email confirmation required", "application_id": application_id_str}


@router.post("/finish_registration", response_model=responses.SuccessfulLogin)
async def finish_registration(body: schemas.RegistrationConfirmation, db: AsyncSession = Depends(get_db)):
    application = await crud.get_register_application_by_id(db, body.application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_register_application_status(application.status)
    if application.confirmation_code != body.confirmation_code:
        await crud.increase_failed_registration_attempts(db, body.application_id)
        raise HTTPException(status_code=400, detail="Incorrect confirmation code")

    await auth_utils.check_if_username_is_available(db, application.username)
    await auth_utils.check_if_email_is_available(db, application.email)
    await crud.make_register_application_confirmed(db, application.application_id)
    await auth_utils.invalidate_all_applications_with_email(db, application.email)
    user = await crud.create_user(db=db, username=application.username, hashed_password=application.hashed_password,
                                  name=application.username, email=application.email)
    refresh_token = auth_utils.generate_refresh_token()
    session = await crud.create_session(db, user=user, refresh_token_hash=auth_utils.hash_refresh_token(refresh_token),
                                        device_info=application.device_info)
    return auth_utils.generate_successful_login_dict(user_id=user.user_id, session_id=session.session_id,
                                                     refresh_token=refresh_token)


@router.post("/login", response_model=responses.SuccessfulLogin)
async def login(body: schemas.Login = Body(default=None), credentials: HTTPBasicCredentials = Depends(security_basic),
                db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_basic_auth(db, credentials)
    refresh_token = auth_utils.generate_refresh_token()
    session = await crud.create_session(db, user=user, refresh_token_hash=auth_utils.hash_refresh_token(refresh_token),
                                        device_info=body.device_info if body else "Unknown")
    return auth_utils.generate_successful_login_dict(user_id=user.user_id, session_id=session.session_id,
                                                     refresh_token=refresh_token)


@router.post("/guest_login", response_model=responses.SuccessfulLogin)
async def guest_login(body: schemas.GuestLogin, db: AsyncSession = Depends(get_db)):
    user_utils.validate_name(body.name)
    user = await crud.create_guest_user(db, body.name)
    refresh_token = auth_utils.generate_refresh_token()
    session = await crud.create_session(db, user=user, refresh_token_hash=auth_utils.hash_refresh_token(refresh_token),
                                        device_info=body.device_info)
    return auth_utils.generate_successful_login_dict(user_id=user.user_id, session_id=session.session_id,
                                                     refresh_token=refresh_token)


@router.post("/token_refresh", response_model=responses.TokenUpdate)
async def token_refresh(body: schemas.TokenRefresh, db: AsyncSession = Depends(get_db)):
    session = (
        await auth_utils.get_session_by_id_and_validate_refresh_token(db, body.session_id, body.refresh_token)
        if body.session_id is not None else
        await auth_utils.get_and_validate_session_from_refresh_token(db, body.refresh_token)
    )
    user_id_str = str((await session.awaitable_attrs.user).user_id)
    session_id_str = str(session.session_id)
    new_refresh_token = auth_utils.generate_refresh_token()
    new_refresh_token_hash = auth_utils.hash_refresh_token(new_refresh_token)
    await crud.update_session_refresh_token_hash_and_update_expire_time(db, session.session_id, new_refresh_token_hash)
    access_token = auth_utils.generate_access_token(user_id_str, session_id_str)
    return {"access_token": access_token, "new_refresh_token": new_refresh_token}


@router.put("/change_username", response_model=responses.UsernameUpdate)
async def change_username(body: schemas.UpdateUsername, credentials: HTTPBasicCredentials = Depends(security_basic),
                          db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_basic_auth(db, credentials)
    user_utils.validate_username(body.new_username)
    await auth_utils.check_if_username_is_available(db, body.new_username)
    user = await crud.update_username(db, user.user_id, body.new_username)
    return {"status": "success", "new_username": user.account_data.username}


@router.post("/change_email", response_model=responses.ApplicationCreated)
async def change_email(body: schemas.UpdateEmail, credentials: HTTPBasicCredentials = Depends(security_basic),
                       db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_basic_auth(db, credentials)
    await auth_utils.check_if_email_is_available(db, body.new_email)
    application = await crud.create_change_email_application(db, user.user_id, body.new_email)
    await email_utils.send_change_email_confirmation(body.new_email, application.confirmation_code,
                                                     user.account_data.username)
    application_id_str = str(application.application_id)
    return {"status": "Email confirmation required", "application_id": application_id_str}


@router.post("/finish_change_email", response_model=responses.EmailUpdate)
async def finish_change_email(body: schemas.UpdateEmailConfirmation, db: AsyncSession = Depends(get_db)):
    application = await crud.get_change_email_application_by_id(db, body.application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_change_email_application_status(application.status)
    if application.confirmation_code != body.confirmation_code:
        await crud.increase_failed_change_email_attempts(db, application.application_id)
        raise HTTPException(status_code=400, detail="Incorrect confirmation code")

    await auth_utils.check_if_email_is_available(db, application.new_email)
    user = await crud.update_email(db, application.user_id, application.new_email)
    application = await crud.make_change_email_application_confirmed(db, application.application_id)
    await auth_utils.invalidate_all_applications_with_email(db, application.new_email)
    await email_utils.send_email_change_rollback(application.old_email,
                                                 str(application.application_id), user.account_data.username)
    return {"status": "Email changed", "new_email": user.account_data.email}


@router.get("/rollback_email_change/{application_id}", response_model=responses.GenericConfirmation)
async def rollback_email_change(application_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    application = await crud.get_change_email_application_by_id(db, application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_change_email_rollback_status(application.rollback_status)

    await crud.update_email(db, application.user_id, application.old_email)
    await crud.make_change_email_application_rolled_back(db, application_id)
    return {"status": "Email change rolled back"}


@router.put("/change_password", response_model=responses.GenericConfirmation)
async def change_password(body: schemas.UpdatePassword, credentials: HTTPBasicCredentials = Depends(security_basic),
                          db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_basic_auth(db, credentials)
    user_utils.validate_password(body.new_password)
    new_password_hash = await auth_utils.hash_password(body.new_password)
    await crud.update_password(db, user.user_id, new_password_hash)
    await crud.delete_sessions_by_user_id_except_one(db, user.user_id, body.session_id)
    return {"status": "success"}


@router.post("/reset_password", response_model=responses.GenericConfirmation)
async def reset_password(body: schemas.ResetPassword, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, body.email)
    if user is None:
        raise HTTPException(status_code=404, detail="Account with this email does not exist")
    if user.is_guest:
        raise HTTPException(status_code=400, detail="This is a guest user")
    application = await crud.create_reset_password_application(db, (await user.awaitable_attrs.account_data).user_id)
    await email_utils.send_reset_password_email(receiver=body.email, application_id=str(application.application_id))

    return {"status": "email sent"}


@router.get("/reset_password_page/{application_id}", response_class=HTMLResponse)
async def reset_password_page(application_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    application = await crud.get_reset_password_application(db, application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_reset_password_application_status(application.status)
    return HTMLResponse(await html_generator.generate_reset_password_page(str(application_id)))


@router.post("/finish_reset_password", response_model=responses.GenericConfirmation)
async def finish_reset_password(body: schemas.FinishResetPassword, db: AsyncSession = Depends(get_db)):
    application = await crud.get_reset_password_application(db, body.application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_reset_password_application_status(application.status)

    user_utils.validate_password(body.new_password)
    new_password_hash = await auth_utils.hash_password(body.new_password)
    await crud.update_password(db, application.user_id, new_password_hash)
    await crud.make_reset_password_application_used(db, application.application_id)
    await crud.delete_sessions_by_user_id(db, application.user_id)

    return {"status": "success"}


@router.post("/upgrade_account", response_model=responses.ApplicationCreated)
async def upgrade_account(body: schemas.UpgradeAccount,
                          credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                          db: AsyncSession = Depends(get_db)):
    user_id, session_id = auth_utils.extract_access_token_data(credentials.credentials)

    user_utils.validate_username(body.username)
    user_utils.validate_password(body.password)
    hashed_password = await auth_utils.hash_password(body.password)

    await auth_utils.check_if_username_is_available(db, body.username)
    await auth_utils.check_if_email_is_available(db, body.email)
    await auth_utils.check_if_user_is_guest(db, user_id)
    application = await crud.create_upgrade_account_application(db=db, user_id=user_id, username=body.username,
                                                                email=body.email, hashed_password=hashed_password)
    application_id_str = str(application.application_id)

    session = await crud.get_session_by_id(db, session_id)
    device_info = session.device_info
    await email_utils.send_registration_confirmation(receiver=body.email, code=application.confirmation_code,
                                                     device_info=device_info)
    return {"status": "Email confirmation required", "application_id": application_id_str}


@router.post("/finish_upgrade_account", response_model=responses.GenericConfirmation)
async def finish_upgrade_account(body: schemas.UpgradeAccountConfirmation,
                                 credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                                 db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    application = await crud.get_upgrade_account_application_by_id(db, body.application_id)
    auth_utils.check_if_application_exists(application)
    auth_utils.check_upgrade_account_application_status(application.status)
    if application.confirmation_code != body.confirmation_code:
        await crud.increase_failed_upgrade_account_attempts(db, body.application_id)
        raise HTTPException(status_code=400, detail="Incorrect confirmation code")

    await auth_utils.check_if_username_is_available(db, application.username)
    await auth_utils.check_if_email_is_available(db, application.email)
    await auth_utils.check_if_user_is_guest(db, user_id)
    await crud.make_upgrade_account_confirmed(db, application.application_id)
    await auth_utils.invalidate_all_applications_with_email(db, application.email)
    await crud.upgrade_user_account(db=db, user_id=user_id, username=application.username,
                                    hashed_password=application.hashed_password, email=application.email)
    return {"status": "success"}


@router.get("/active_sessions", response_model=responses.ActiveSessions)
async def get_active_sessions(credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                              db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    sessions = await crud.get_sessions_by_user_id(db, user_id)
    session_list = [
        {
            "session_id": str(session.session_id),
            "device_info": session.device_info,
            "latest_activity": session.latest_activity.timestamp()
        }
        for session in sessions
    ]
    return {"sessions": session_list}


@router.post("/close_session", response_model=responses.GenericConfirmation)
async def close_session(body: schemas.CloseSession,
                        credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                        db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    session = await crud.get_session_by_id(db, body.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not fount")
    if user_id != session.user_id:
        raise HTTPException(status_code=403, detail="Session is not yours")
    await crud.delete_session(db, body.session_id)
    await sio.disconnect_client(session_id=session.session_id)
    return {"status": "success"}
