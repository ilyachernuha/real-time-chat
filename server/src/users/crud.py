from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from .. import db_models


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
