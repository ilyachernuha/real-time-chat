from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
import uuid
from datetime import datetime, timezone, timedelta
import db_models
from room_themes import RoomTheme
from room_languages import RoomLanguage


# USERS


async def create_user(db: AsyncSession, username: str, hashed_password: str, name: str, email: str):
    user_id = uuid.uuid4()
    user = db_models.User(user_id=user_id, name=name, is_guest=False)
    account_data = db_models.AccountData(user_id=user_id, username=username,
                                         hashed_password=hashed_password, email=email)
    user.account_data = account_data
    db.add(user)
    await db.commit()
    return user


async def create_guest_user(db: AsyncSession, name: str):
    user_id = uuid.uuid4()
    guest = db_models.User(user_id=user_id, name=name, is_guest=True)
    db.add(guest)
    await db.commit()
    return guest


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID):
    return await db.get(db_models.User, user_id)


async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(
        select(db_models.User)
        .join(db_models.AccountData)
        .where(db_models.AccountData.username == username)
    )
    return result.scalars().first()


async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(
        select(db_models.User)
        .join(db_models.AccountData)
        .where(db_models.AccountData.email == email)
    )
    return result.scalars().first()


async def search_users(db: AsyncSession, username: str, limit: int | None):
    stmt = (
        select(db_models.User)
        .join(db_models.AccountData)
        .where(db_models.AccountData.username.ilike(f"%{username}%"))
    )
    if limit is not None:
        stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_user_name(db: AsyncSession, user_id: uuid.UUID, new_name: str):
    user = await get_user_by_id(db, user_id)
    user.name = new_name
    await db.commit()
    return user


async def update_username(db: AsyncSession, user_id: uuid.UUID, new_username: str):
    user = await get_user_by_id(db, user_id)
    (await user.awaitable_attrs.account_data).username = new_username
    await db.commit()
    return user


async def update_email(db: AsyncSession, user_id: uuid.UUID, new_email: str):
    user = await get_user_by_id(db, user_id)
    (await user.awaitable_attrs.account_data).email = new_email
    await db.commit()
    return user


async def update_password(db: AsyncSession, user_id: uuid.UUID, new_password_hash: str):
    user = await get_user_by_id(db, user_id)
    (await user.awaitable_attrs.account_data).hashed_password = new_password_hash
    await db.commit()
    return user


async def upgrade_user_account(db: AsyncSession, user_id: uuid.UUID, username: str, hashed_password: str, email: str):
    user = await get_user_by_id(db, user_id)
    user.is_guest = False
    account_data = db_models.AccountData(user_id=user_id, username=username,
                                         hashed_password=hashed_password, email=email)
    user.account_data = account_data
    await db.commit()
    return user


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


# ROOMS


async def create_room(db: AsyncSession, owner: db_models.User, title: str, description: str | None, theme: RoomTheme,
                      languages: list[RoomLanguage], tags: list[db_models.Tag]):
    room_id = uuid.uuid4()
    room = db_models.Room(room_id=room_id, owner_id=owner.user_id, title=title, description=description, theme=theme,
                          languages=languages)
    db.add(room)
    for tag in tags:
        association = db_models.RoomTagAssociation(room_id=room_id, tag_name=tag.tag, theme=theme, room=room, tag=tag)
        db.add(association)
    await db.commit()
    return room


async def get_room_by_id(db: AsyncSession, room_id: uuid.UUID):
    return await db.get(db_models.Room, room_id)


async def filter_rooms(db: AsyncSession, title: str | None, themes: list[RoomTheme] | None,
                       languages: list[RoomLanguage] | None, tags: list[str] | None):
    stmt = select(db_models.Room) if tags is None else select(db_models.Room).join(db_models.RoomTagAssociation)
    if title is not None:
        stmt = stmt.where(db_models.Room.title.ilike(f"%{title}%"))
    if themes is not None:
        stmt = stmt.where(db_models.Room.theme.in_(themes))
    if languages is not None:
        stmt = stmt.where(db_models.Room.languages.op("&&")(languages))
    if tags is not None:
        stmt = stmt.where(db_models.Room.tags.any(db_models.RoomTagAssociation.tag_name.in_(tags)))
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_room_title(db: AsyncSession, room_id: uuid.UUID, new_title: str):
    room = await get_room_by_id(db, room_id)
    room.title = new_title
    await db.commit()
    return room


async def update_room_description(db: AsyncSession, room_id: uuid.UUID, new_description: str | None):
    room = await get_room_by_id(db, room_id)
    room.description = new_description
    await db.commit()
    return room


async def update_room_theme(db: AsyncSession, room_id: uuid.UUID, new_theme: RoomTheme):
    room = await get_room_by_id(db, room_id)
    room.theme = new_theme
    for tag_association in room.tags:
        tag_association.theme = new_theme
    await db.commit()
    return room


async def get_room_tag_association(db: AsyncSession, room_id: uuid.UUID, tag_name: str):
    return await db.get(db_models.RoomTagAssociation, (room_id, tag_name))


async def add_tags_to_room(db: AsyncSession, room_id: uuid.UUID, tags: list[db_models.Tag]):
    room = await get_room_by_id(db, room_id)
    for tag in tags:
        if not await get_room_tag_association(db, room_id, tag.tag):
            association = db_models.RoomTagAssociation(room_id=room_id, tag_name=tag.tag, theme=room.theme,
                                                       room=room, tag=tag)
            db.add(association)
    await db.commit()
    return room


async def remove_tags_from_room(db: AsyncSession, room_id: uuid.UUID, tags: list[str]):
    room = await get_room_by_id(db, room_id)
    for tag in tags:
        association = await get_room_tag_association(db, room_id, tag)
        if association is not None:
            await db.delete(association)
    await db.commit()
    return room


async def update_room_languages(db: AsyncSession, room_id: uuid.UUID, languages: list[RoomLanguage]):
    room = await get_room_by_id(db, room_id)
    room.languages = languages
    await db.commit()
    return room


async def add_user_to_room(db: AsyncSession, room_id: uuid.UUID, user: db_models.User, make_admin: bool = False):
    room = await get_room_by_id(db, room_id)
    association = db_models.UserRoomAssociation(user_id=user.user_id, room_id=room_id, is_admin=make_admin,
                                                user=user, room=room)
    db.add(association)
    await db.commit()
    return room


async def get_user_room_association(db: AsyncSession, room_id: uuid.UUID, user_id: uuid.UUID):
    return await db.get(db_models.UserRoomAssociation, (user_id, room_id))


async def remove_user_from_room(db: AsyncSession, room_id: uuid.UUID, user_id: uuid.UUID):
    room = await get_room_by_id(db, room_id)
    association = await get_user_room_association(db, room_id, user_id)
    await db.delete(association)
    await db.commit()
    return room


async def update_user_admin_status_in_room(db: AsyncSession, room_id: uuid.UUID, user_id: uuid.UUID,
                                           new_admin_status: bool):
    room = await get_room_by_id(db, room_id)
    association = await get_user_room_association(db, room_id, user_id)
    association.is_admin = new_admin_status
    await db.commit()
    return room


async def delete_room(db: AsyncSession, room_id: uuid.UUID):
    room = await get_room_by_id(db, room_id)
    await db.delete(room)
    await db.commit()


# TAGS


async def create_tag(db: AsyncSession, tag_name: str):
    tag = db_models.Tag(tag=tag_name)
    db.add(tag)
    await db.commit()
    return tag


async def get_tag_by_name(db: AsyncSession, tag_name: str):
    return await db.get(db_models.Tag, tag_name)


async def get_or_create_tag(db: AsyncSession, tag_name: str):
    tag = await get_tag_by_name(db, tag_name)
    if tag is None:
        tag = await create_tag(db, tag_name)
    return tag


async def delete_tag(db: AsyncSession, tag_name: str):
    tag = await get_tag_by_name(db, tag_name)
    await db.delete(tag)
    await db.commit()


async def search_tag(db: AsyncSession, tag_name: str, limit: int | None):
    stmt = (
        select(db_models.Tag)
        .where(db_models.Tag.tag.ilike(f"%{tag_name}%"))
    )
    if limit is not None:
        stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()
