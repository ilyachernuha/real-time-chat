from sqlalchemy.orm import Session
from sqlalchemy import update
import uuid
from datetime import datetime, timezone, timedelta
import db_models


# USERS


def create_user(db: Session, username: str, hashed_password: str, name: str, email: str):
    user_id = uuid.uuid4()
    user = db_models.User(user_id=user_id, name=name, is_guest=False)
    account_data = db_models.AccountData(user_id=user_id, username=username,
                                         hashed_password=hashed_password, email=email)
    user.account_data = account_data

    db.add(user)
    db.commit()
    return user_id


def create_guest_user(db: Session, name: str):
    user_id = uuid.uuid4()
    guest = db_models.User(user_id=user_id, name=name, is_guest=True)

    db.add(guest)
    db.commit()
    return user_id


def get_user_by_id(db: Session, user_id: uuid.UUID):
    return db.query(db_models.User).filter(db_models.User.user_id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(db_models.User).join(db_models.AccountData).filter(db_models.AccountData.username
                                                                       == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(db_models.User).join(db_models.AccountData).filter(db_models.AccountData.email == email).first()


def update_user_name(db: Session, user_id: uuid.UUID, new_name: str):
    user = get_user_by_id(db, user_id)
    user.name = new_name
    db.commit()
    return user


def update_username(db: Session, user_id: uuid.UUID, new_username: str):
    user = get_user_by_id(db, user_id)
    user.account_data.username = new_username
    db.commit()
    return user


def update_email(db: Session, user_id: uuid.UUID, new_email: str):
    user = get_user_by_id(db, user_id)
    user.account_data.email = new_email
    db.commit()
    return user


def update_password(db: Session, user_id: uuid.UUID, new_password_hash: str):
    user = get_user_by_id(db, user_id)
    user.account_data.hashed_password = new_password_hash
    db.commit()
    return user


# REGISTER APPLICATIONS


def create_register_application(db: Session, username: str, email: str, hashed_password: str):
    application_id = uuid.uuid4()
    application = db_models.RegisterApplication(application_id=application_id, username=username, email=email,
                                                hashed_password=hashed_password)

    db.add(application)
    db.commit()
    return application


def get_register_application_by_id(db: Session, application_id: uuid.UUID):
    return db.query(db_models.RegisterApplication).filter(db_models.RegisterApplication.application_id
                                                          == application_id).first()


def get_register_applications_by_email(db: Session, email: str):
    return db.query(db_models.RegisterApplication).filter(db_models.RegisterApplication.email == email).all()


def confirm_register_application_and_invalidate_others_with_same_email(db: Session, application_id: uuid.UUID):
    application = get_register_application_by_id(db, application_id)
    application.status = db_models.RegisterApplication.Status.confirmed

    email: str = application.email

    stmt = (
        update(db_models.RegisterApplication).
        where(db_models.RegisterApplication.email == email).
        where(db_models.RegisterApplication.status == db_models.RegisterApplication.Status.pending).
        where(db_models.RegisterApplication.application_id != application_id).
        values(status=db_models.RegisterApplication.Status.confirmed_elsewhere)
    )

    db.execute(stmt)
    db.commit()
    return application


def increase_failed_registration_attempts(db: Session, application_id: uuid.UUID):
    application = get_register_application_by_id(db, application_id)
    application.failed_attempts += 1
    if application.failed_attempts >= 3:
        application.status = db_models.RegisterApplication.Status.failed
    db.commit()
    return application


def expire_register_applications(db: Session, expire_time: timedelta):
    expired_applications = db.query(db_models.RegisterApplication).filter(
        db_models.RegisterApplication.status == db_models.RegisterApplication.Status.pending,
        datetime.now(timezone.utc) > db_models.RegisterApplication.timestamp + expire_time
    ).all()

    for application in expired_applications:
        application.status = db_models.RegisterApplication.Status.expired

    db.commit()


# RESET PASSWORD APPLICATIONS


def create_reset_password_application(db: Session, user_id: uuid.UUID):
    application_id = uuid.uuid4()
    application = db_models.ResetPasswordApplication(application_id=application_id, user_id=user_id)

    db.add(application)
    db.commit()
    return application


def get_reset_password_application(db: Session, application_id: uuid.UUID):
    return db.query(db_models.ResetPasswordApplication).filter(db_models.ResetPasswordApplication.application_id
                                                               == application_id).first()


def make_reset_password_application_used(db: Session, application_id: uuid.UUID):
    application = get_reset_password_application(db, application_id)
    application.status = db_models.ResetPasswordApplication.Status.used
    db.commit()
    return application


def expire_reset_password_applications(db: Session, expire_time: timedelta):
    expired_applications = db.query(db_models.ResetPasswordApplication).filter(
        db_models.ResetPasswordApplication.status == db_models.ResetPasswordApplication.Status.pending,
        datetime.now(timezone.utc) > db_models.ResetPasswordApplication.timestamp + expire_time
    ).all()

    for application in expired_applications:
        application.status = db_models.ResetPasswordApplication.Status.expired

    db.commit()


# CHANGE EMAIL APPLICATIONS


def create_change_email_application(db: Session, user_id: uuid.UUID, new_email: str):
    application_id = uuid.uuid4()
    old_email = get_user_by_id(db, user_id).account_data.email
    application = db_models.ChangeEmailApplication(application_id=application_id, user_id=user_id,
                                                   new_email=new_email, old_email=old_email)

    db.add(application)
    db.commit()
    return application


def get_change_email_application_by_id(db: Session, application_id: uuid.UUID):
    return db.query(db_models.ChangeEmailApplication).filter(db_models.ChangeEmailApplication.application_id
                                                             == application_id).first()


def make_change_email_application_confirmed(db: Session, application_id: uuid.UUID):
    application = get_change_email_application_by_id(db, application_id)
    application.status = db_models.ChangeEmailApplication.Status.confirmed
    db.commit()
    return application


def increase_failed_change_email_attempts(db: Session, application_id: uuid.UUID):
    application = get_change_email_application_by_id(db, application_id)
    application.failed_attempts += 1
    if application.failed_attempts >= 3:
        application.status = db_models.ChangeEmailApplication.Status.failed
    db.commit()
    return application


def make_change_email_application_rolled_back(db: Session, application_id: uuid.UUID):
    application = get_change_email_application_by_id(db, application_id)
    application.status = db_models.ChangeEmailApplication.Status.rolled_back
    db.commit()
    return application


def expire_change_email_applications(db: Session, expire_time: timedelta):
    expired_applications = db.query(db_models.ChangeEmailApplication).filter(
        db_models.ChangeEmailApplication.status == db_models.ChangeEmailApplication.Status.pending,
        datetime.now(timezone.utc) > db_models.ChangeEmailApplication.timestamp + expire_time
    ).all()

    for application in expired_applications:
        application.status = db_models.ChangeEmailApplication.Status.expired

    db.commit()


def expire_change_email_rollback(db: Session, expire_time: timedelta):
    expired_applications = db.query(db_models.ChangeEmailApplication).filter(
        db_models.ChangeEmailApplication.rollback_status == db_models.ChangeEmailApplication.RollbackStatus.pending,
        datetime.now(timezone.utc) > db_models.ChangeEmailApplication.timestamp + expire_time
    ).all()

    for application in expired_applications:
        application.status = db_models.ChangeEmailApplication.RollbackStatus.expired

    db.commit()
