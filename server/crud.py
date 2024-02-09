from sqlalchemy.orm import Session
from sqlalchemy import update
import uuid
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


def increase_failed_registration_confirmations(db: Session, application_id: uuid.UUID):
    application = get_register_application_by_id(db, application_id)
    application.failed_attempts += 1
    db.commit()
    return application


def make_register_application_failed(db: Session, application_id: uuid.UUID):
    application = get_register_application_by_id(db, application_id)
    application.status = db_models.RegisterApplication.Status.failed
    db.commit()
    return application
