from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
import uuid
from datetime import datetime, timezone, timedelta
from .. import db_models
from ..users.crud import *


# REGISTER APPLICATIONS


async def create_register_application(db: AsyncSession, username: str, email: str, hashed_password: str,
                                      device_info: str):
    application_id = uuid.uuid4()
    application = db_models.RegisterApplication(application_id=application_id, username=username, email=email,
                                                hashed_password=hashed_password, device_info=device_info)
    db.add(application)
    await db.commit()
    return application


async def get_register_application_by_id(db: AsyncSession, application_id: uuid.UUID):
    return await db.get(db_models.RegisterApplication, application_id)


async def confirm_register_application_and_invalidate_others_with_same_email(db: AsyncSession,
                                                                             application_id: uuid.UUID):
    application = await get_register_application_by_id(db, application_id)
    application.status = db_models.RegisterApplication.Status.confirmed
    email: str = application.email
    stmt = (
        update(db_models.RegisterApplication).
        where(db_models.RegisterApplication.email == email).
        where(db_models.RegisterApplication.status == db_models.RegisterApplication.Status.pending).
        where(db_models.RegisterApplication.application_id != application_id).
        values(status=db_models.RegisterApplication.Status.confirmed_elsewhere)
    )
    await db.execute(stmt)
    await db.commit()
    return application


async def increase_failed_registration_attempts(db: AsyncSession, application_id: uuid.UUID):
    application = await get_register_application_by_id(db, application_id)
    application.failed_attempts += 1
    if application.failed_attempts >= 3:
        application.status = db_models.RegisterApplication.Status.failed
    await db.commit()
    return application


async def expire_register_applications(db: AsyncSession, expire_time: timedelta):
    stmt = (
        update(db_models.RegisterApplication).
        where(db_models.RegisterApplication.status == db_models.RegisterApplication.Status.pending).
        where(datetime.now(timezone.utc) > db_models.RegisterApplication.timestamp + expire_time).
        values(status=db_models.RegisterApplication.Status.expired)
    )
    await db.execute(stmt)
    await db.commit()


# RESET PASSWORD APPLICATIONS


async def create_reset_password_application(db: AsyncSession, user_id: uuid.UUID):
    application_id = uuid.uuid4()
    application = db_models.ResetPasswordApplication(application_id=application_id, user_id=user_id)
    db.add(application)
    await db.commit()
    return application


async def get_reset_password_application(db: AsyncSession, application_id: uuid.UUID):
    return await db.get(db_models.ResetPasswordApplication, application_id)


async def make_reset_password_application_used(db: AsyncSession, application_id: uuid.UUID):
    application = await get_reset_password_application(db, application_id)
    application.status = db_models.ResetPasswordApplication.Status.used
    await db.commit()
    return application


async def expire_reset_password_applications(db: AsyncSession, expire_time: timedelta):
    stmt = (
        update(db_models.ResetPasswordApplication).
        where(db_models.ResetPasswordApplication.status == db_models.ResetPasswordApplication.Status.pending).
        where(datetime.now(timezone.utc) > db_models.ResetPasswordApplication.timestamp + expire_time).
        values(status=db_models.ResetPasswordApplication.Status.expired)
    )
    await db.execute(stmt)
    await db.commit()


# CHANGE EMAIL APPLICATIONS


async def create_change_email_application(db: AsyncSession, user_id: uuid.UUID, new_email: str):
    application_id = uuid.uuid4()
    old_email = (await get_user_by_id(db, user_id)).account_data.email
    application = db_models.ChangeEmailApplication(application_id=application_id, user_id=user_id,
                                                   new_email=new_email, old_email=old_email)
    db.add(application)
    await db.commit()
    return application


async def get_change_email_application_by_id(db: AsyncSession, application_id: uuid.UUID):
    return await db.get(db_models.ChangeEmailApplication, application_id)


async def get_pending_rollback_change_email_application_by_email(db: AsyncSession, email: str):
    stmt = (
        select(db_models.ChangeEmailApplication)
        .filter(db_models.ChangeEmailApplication.old_email == email)
        .filter(db_models.ChangeEmailApplication.rollback_status ==
                db_models.ChangeEmailApplication.RollbackStatus.pending)
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def make_change_email_application_confirmed(db: AsyncSession, application_id: uuid.UUID):
    application = await get_change_email_application_by_id(db, application_id)
    application.status = db_models.ChangeEmailApplication.Status.confirmed
    application.rollback_status = db_models.ChangeEmailApplication.RollbackStatus.pending
    await db.commit()
    return application


async def increase_failed_change_email_attempts(db: AsyncSession, application_id: uuid.UUID):
    application = await get_change_email_application_by_id(db, application_id)
    application.failed_attempts += 1
    if application.failed_attempts >= 3:
        application.status = db_models.ChangeEmailApplication.Status.failed
    await db.commit()
    return application


async def make_change_email_application_rolled_back(db: AsyncSession, application_id: uuid.UUID):
    application = await get_change_email_application_by_id(db, application_id)
    application.status = db_models.ChangeEmailApplication.Status.rolled_back
    await db.commit()
    return application


async def expire_change_email_applications(db: AsyncSession, expire_time: timedelta):
    stmt = (
        update(db_models.ChangeEmailApplication).
        where(db_models.ChangeEmailApplication.status == db_models.ChangeEmailApplication.Status.pending).
        where(datetime.now(timezone.utc) > db_models.ChangeEmailApplication.timestamp + expire_time).
        values(status=db_models.ChangeEmailApplication.Status.expired)
    )
    await db.execute(stmt)
    await db.commit()


async def expire_change_email_rollback(db: AsyncSession, expire_time: timedelta):
    stmt = (
        update(db_models.ChangeEmailApplication).
        where(db_models.ChangeEmailApplication.rollback_status ==
              db_models.ChangeEmailApplication.RollbackStatus.pending).
        where(datetime.now(timezone.utc) > db_models.ChangeEmailApplication.timestamp + expire_time).
        values(rollback_status=db_models.ChangeEmailApplication.RollbackStatus.expired)
    )
    await db.execute(stmt)
    await db.commit()


# UPGRADE ACCOUNT APPLICATIONS


async def create_upgrade_account_application(db: AsyncSession, user_id: uuid.UUID,
                                             username: str, email: str, hashed_password: str):
    application_id = uuid.uuid4()
    application = db_models.UpgradeAccountApplication(application_id=application_id, user_id=user_id, username=username,
                                                      email=email, hashed_password=hashed_password)
    db.add(application)
    await db.commit()
    return application


async def get_upgrade_account_application_by_id(db: AsyncSession, application_id: uuid.UUID):
    return await db.get(db_models.UpgradeAccountApplication, application_id)


async def make_upgrade_account_confirmed(db: AsyncSession, application_id: uuid.UUID):
    application = await get_upgrade_account_application_by_id(db, application_id)
    application.status = db_models.UpgradeAccountApplication.Status.confirmed
    await db.commit()
    return application


async def increase_failed_upgrade_account_attempts(db: AsyncSession, application_id: uuid.UUID):
    application = await get_upgrade_account_application_by_id(db, application_id)
    application.failed_attempts += 1
    if application.failed_attempts >= 3:
        application.status = db_models.UpgradeAccountApplication.Status.failed
    await db.commit()
    return application


async def expire_upgrade_account_applications(db: AsyncSession, expire_time: timedelta):
    stmt = (
        update(db_models.UpgradeAccountApplication).
        where(db_models.UpgradeAccountApplication.status == db_models.UpgradeAccountApplication.Status.pending).
        where(datetime.now(timezone.utc) > db_models.UpgradeAccountApplication.timestamp + expire_time).
        values(status=db_models.UpgradeAccountApplication.Status.expired)
    )
    await db.execute(stmt)
    await db.commit()


# SESSIONS


async def create_session(db: AsyncSession, user: db_models.User, refresh_token_hash: str, device_info: str):
    session_id = uuid.uuid4()
    session = db_models.Session(session_id=session_id, user_id=user.user_id, refresh_token_hash=refresh_token_hash,
                                device_info=device_info, user=user)
    db.add(session)
    await db.commit()
    return session


async def get_session_by_id(db: AsyncSession, session_id: uuid.UUID):
    return await db.get(db_models.Session, session_id)


async def get_session_by_refresh_token_hash(db: AsyncSession, refresh_token_hash: str):
    stmt = (
        select(db_models.Session)
        .filter(db_models.Session.refresh_token_hash == refresh_token_hash)
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_sessions_by_user_id(db: AsyncSession, user_id: uuid.UUID):
    stmt = (
        select(db_models.Session)
        .filter(db_models.Session.user_id == user_id)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_session_refresh_token_hash_and_update_expire_time(db: AsyncSession, session_id: uuid.UUID,
                                                                   new_refresh_token_hash: str):
    session = await get_session_by_id(db, session_id)
    session.refresh_token_hash = new_refresh_token_hash
    session.latest_activity = datetime.now(timezone.utc)
    await db.commit()
    return session


async def delete_session(db: AsyncSession, session_id: uuid.UUID):
    session = await get_session_by_id(db, session_id)
    await db.delete(session)
    await db.commit()


async def delete_sessions_by_user_id(db: AsyncSession, user_id: uuid.UUID):
    stmt = (
        delete(db_models.Session).
        where(db_models.Session.user_id == user_id)
    )
    await db.execute(stmt)
    await db.commit()


async def delete_sessions_by_user_id_except_one(db: AsyncSession, user_id: uuid.UUID, session_id: uuid.UUID):
    stmt = (
        delete(db_models.Session).
        where(db_models.Session.user_id == user_id).
        where(db_models.Session.session_id != session_id)
    )
    await db.execute(stmt)
    await db.commit()