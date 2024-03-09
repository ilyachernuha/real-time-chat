from sqlalchemy.orm import Session
from sqlalchemy import update, delete
import uuid
from datetime import datetime, timezone, timedelta
import db_models
from room_themes import RoomTheme
from room_languages import RoomLanguage


# USERS


def create_user(db: Session, username: str, hashed_password: str, name: str, email: str):
    user_id = uuid.uuid4()
    user = db_models.User(user_id=user_id, name=name, is_guest=False)
    account_data = db_models.AccountData(user_id=user_id, username=username,
                                         hashed_password=hashed_password, email=email)
    user.account_data = account_data

    db.add(user)
    db.commit()
    return user


def create_guest_user(db: Session, name: str):
    user_id = uuid.uuid4()
    guest = db_models.User(user_id=user_id, name=name, is_guest=True)

    db.add(guest)
    db.commit()
    return guest


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


def upgrade_user_account(db: Session, user_id: uuid.UUID, username: str, hashed_password: str, email: str):
    user = get_user_by_id(db, user_id)
    user.is_guest = False
    account_data = db_models.AccountData(user_id=user_id, username=username,
                                         hashed_password=hashed_password, email=email)
    user.account_data = account_data
    db.commit()
    return user


# REGISTER APPLICATIONS


def create_register_application(db: Session, username: str, email: str, hashed_password: str, device_info: str):
    application_id = uuid.uuid4()
    application = db_models.RegisterApplication(application_id=application_id, username=username, email=email,
                                                hashed_password=hashed_password, device_info=device_info)

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
    stmt = (
        update(db_models.RegisterApplication).
        where(db_models.RegisterApplication.status == db_models.RegisterApplication.Status.pending).
        where(datetime.now(timezone.utc) > db_models.RegisterApplication.timestamp + expire_time).
        values(status=db_models.RegisterApplication.Status.expired)
    )

    db.execute(stmt)
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
    stmt = (
        update(db_models.ResetPasswordApplication).
        where(db_models.ResetPasswordApplication.status == db_models.ResetPasswordApplication.Status.pending).
        where(datetime.now(timezone.utc) > db_models.ResetPasswordApplication.timestamp + expire_time).
        values(status=db_models.ResetPasswordApplication.Status.expired)
    )

    db.execute(stmt)
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


def get_pending_rollback_change_email_application_by_email(db: Session, email: str):
    return (db.query(db_models.ChangeEmailApplication).
            filter(db_models.ChangeEmailApplication.old_email == email).
            filter(db_models.ChangeEmailApplication.rollback_status ==
                   db_models.ChangeEmailApplication.RollbackStatus.pending)).first()


def make_change_email_application_confirmed(db: Session, application_id: uuid.UUID):
    application = get_change_email_application_by_id(db, application_id)
    application.status = db_models.ChangeEmailApplication.Status.confirmed
    application.rollback_status = db_models.ChangeEmailApplication.RollbackStatus.pending
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
    stmt = (
        update(db_models.ChangeEmailApplication).
        where(db_models.ChangeEmailApplication.status == db_models.ChangeEmailApplication.Status.pending).
        where(datetime.now(timezone.utc) > db_models.ChangeEmailApplication.timestamp + expire_time).
        values(status=db_models.ChangeEmailApplication.Status.expired)
    )

    db.execute(stmt)
    db.commit()


def expire_change_email_rollback(db: Session, expire_time: timedelta):
    stmt = (
        update(db_models.ChangeEmailApplication).
        where(db_models.ChangeEmailApplication.rollback_status ==
              db_models.ChangeEmailApplication.RollbackStatus.pending).
        where(datetime.now(timezone.utc) > db_models.ChangeEmailApplication.timestamp + expire_time).
        values(rollback_status=db_models.ChangeEmailApplication.RollbackStatus.expired)
    )

    db.execute(stmt)
    db.commit()


# UPGRADE ACCOUNT APPLICATIONS


def create_upgrade_account_application(db: Session, user_id: uuid.UUID,
                                       username: str, email: str, hashed_password: str):
    application_id = uuid.uuid4()
    application = db_models.UpgradeAccountApplication(application_id=application_id, user_id=user_id, username=username,
                                                      email=email, hashed_password=hashed_password)

    db.add(application)
    db.commit()
    return application


def get_upgrade_account_application_by_id(db: Session, application_id: uuid.UUID):
    return db.query(db_models.UpgradeAccountApplication).filter(db_models.UpgradeAccountApplication.application_id
                                                                == application_id).first()


def make_upgrade_account_confirmed(db: Session, application_id: uuid.UUID):
    application = get_upgrade_account_application_by_id(db, application_id)
    application.status = db_models.UpgradeAccountApplication.Status.confirmed
    db.commit()
    return application


def increase_failed_upgrade_account_attempts(db: Session, application_id: uuid.UUID):
    application = get_upgrade_account_application_by_id(db, application_id)
    application.failed_attempts += 1
    if application.failed_attempts >= 3:
        application.status = db_models.UpgradeAccountApplication.Status.failed
    db.commit()
    return application


def expire_upgrade_account_applications(db: Session, expire_time: timedelta):
    stmt = (
        update(db_models.UpgradeAccountApplication).
        where(db_models.UpgradeAccountApplication.status == db_models.UpgradeAccountApplication.Status.pending).
        where(datetime.now(timezone.utc) > db_models.UpgradeAccountApplication.timestamp + expire_time).
        values(status=db_models.UpgradeAccountApplication.Status.expired)
    )

    db.execute(stmt)
    db.commit()


# SESSIONS


def create_session(db: Session, user: db_models.User, refresh_token_hash: str, device_info: str):
    session_id = uuid.uuid4()
    session = db_models.Session(session_id=session_id, user_id=user.user_id, refresh_token_hash=refresh_token_hash,
                                device_info=device_info, user=user)

    db.add(session)
    db.commit()
    return session


def get_session_by_id(db: Session, session_id: uuid.UUID):
    return db.query(db_models.Session).filter(db_models.Session.session_id == session_id).first()


def get_session_by_refresh_token_hash(db: Session, refresh_token_hash: str):
    return db.query(db_models.Session).filter(db_models.Session.refresh_token_hash == refresh_token_hash).first()


def get_sessions_by_user_id(db: Session, user_id: uuid.UUID):
    return db.query(db_models.Session).filter(db_models.Session.user_id == user_id).all()


def update_session_refresh_token_hash_and_update_expire_time(db: Session, session_id: uuid.UUID,
                                                             new_refresh_token_hash: str):
    session = get_session_by_id(db, session_id)
    session.refresh_token_hash = new_refresh_token_hash
    session.latest_activity = datetime.now(timezone.utc)
    db.commit()
    return session


def delete_session(db: Session, session_id: uuid.UUID):
    session = get_session_by_id(db, session_id)
    db.delete(session)
    db.commit()


def delete_sessions_by_user_id(db: Session, user_id: uuid.UUID):
    stmt = (
        delete(db_models.Session).
        where(db_models.Session.user_id == user_id)
    )

    db.execute(stmt)
    db.commit()


def delete_sessions_by_user_id_except_one(db: Session, user_id: uuid.UUID, session_id: uuid.UUID):
    stmt = (
        delete(db_models.Session).
        where(db_models.Session.user_id == user_id).
        where(db_models.Session.session_id != session_id)
    )

    db.execute(stmt)
    db.commit()


# ROOMS


def create_room(db: Session, owner: db_models.User, title: str, description: str | None, theme: RoomTheme,
                languages: list[RoomLanguage], tags: list[db_models.Tag]):
    room_id = uuid.uuid4()
    room = db_models.Room(room_id=room_id, owner_id=owner.user_id, title=title, description=description, theme=theme,
                          languages=languages)
    db.add(room)
    for tag in tags:
        association = db_models.RoomTagAssociation(room_id=room_id, tag_name=tag.tag, room=room, tag=tag)
        db.add(association)
    db.commit()
    return room


def get_room_by_id(db: Session, room_id: uuid.UUID):
    return db.query(db_models.Room).filter(db_models.Room.room_id == room_id).first()


def update_room_title(db: Session, room_id: uuid.UUID, new_title: str):
    room = get_room_by_id(db, room_id)
    room.title = new_title
    db.commit()
    return room


def update_room_description(db: Session, room_id: uuid.UUID, new_description: str):
    room = get_room_by_id(db, room_id)
    room.description = new_description
    db.commit()
    return room


def update_room_theme(db: Session, room_id: uuid.UUID, new_theme: RoomTheme):
    room = get_room_by_id(db, room_id)
    room.theme = new_theme
    db.commit()
    return room
    # tag associations with new theme must be handles separately
    # potential removal of tag association with old theme must be handles separately


def add_tags_to_room(db: Session, room_id: uuid.UUID, tags: list[db_models.Tag]):
    room = get_room_by_id(db, room_id)
    for tag in tags:
        association = db_models.RoomTagAssociation(room_id=room_id, tag_name=tag.tag, room=room, tag=tag)
        db.add(association)
    db.commit()
    return room


def remove_tags_from_room(db: Session, room_id: uuid.UUID, tags: list[db_models.Tag]):
    room = get_room_by_id(db, room_id)
    for tag in tags:
        tag_name: str = tag.tag
        association = (db.query(db_models.RoomTagAssociation).filter(db_models.RoomTagAssociation.room_id == room_id,
                                                                     db_models.RoomTagAssociation.tag_name == tag_name)
                       .first())
        db.delete(association)
    db.commit()
    return room
    # potential removal of tag theme association must be handles separately


def update_room_languages(db: Session, room_id: uuid.UUID, languages: list[RoomLanguage]):
    room = get_room_by_id(db, room_id)
    room.languages = languages
    db.commit()
    return room


def add_user_to_room(db: Session, room_id: uuid.UUID, user: db_models.User, make_admin: bool = False):
    room = get_room_by_id(db, room_id)
    association = db_models.UserRoomAssociation(user_id=user.user_id, room_id=room_id, is_admin=make_admin,
                                                user=user, room=room)
    db.add(association)
    db.commit()
    return room


def remove_user_from_room(db: Session, room_id: uuid.UUID, user_id: uuid.UUID):
    room = get_room_by_id(db, room_id)
    association = (db.query(db_models.UserRoomAssociation).filter(db_models.UserRoomAssociation.user_id == user_id,
                                                                  db_models.UserRoomAssociation.room_id == room_id)
                   .first())
    db.delete(association)
    db.commit()
    return room


def update_user_admin_status_in_room(db: Session, room_id: uuid.UUID, user_id: uuid.UUID, new_admin_status: bool):
    room = get_room_by_id(db, room_id)
    association = (db.query(db_models.UserRoomAssociation).filter(db_models.UserRoomAssociation.user_id == user_id,
                                                                  db_models.UserRoomAssociation.room_id == room_id)
                   .first())
    association.is_admin = new_admin_status
    db.commit()
    return room


# TAGS


def create_tag(db: Session, tag_name: str):
    tag = db_models.Tag(tag=tag_name)
    db.add(tag)
    db.commit()
    return tag


def get_tag_by_name(db: Session, tag_name: str):
    return db.query(db_models.Tag).filter(db_models.Tag.tag == tag_name).first()


def get_or_create_tag(db: Session, tag_name: str):
    tag = get_tag_by_name(db, tag_name)
    if tag is None:
        tag = create_tag(db, tag_name)
    return tag


def associate_tag_with_theme(db: Session, tag_name: str, theme: RoomTheme):
    tag = get_or_create_tag(db, tag_name)
    association = db_models.RoomTagAssociation(tag_name=tag_name, theme=theme, tag=tag)
    db.add(association)
    db.commit()
    return association  # idk what to return here


def dissociate_tag_with_theme(db: Session, tag_name: str, theme: RoomTheme):
    association = db.query(db_models.TagThemeAssociation).filter(db_models.TagThemeAssociation.tag_name == tag_name,
                                                                 db_models.TagThemeAssociation.theme == theme).first()
    db.delete(association)
    db.commit()
    # return ???
