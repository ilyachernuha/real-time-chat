from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import timedelta
from database import db_session
import crud


async def expire_applications_task():
    async with db_session() as db:
        await crud.expire_register_applications(db, timedelta(minutes=15))
        await crud.expire_reset_password_applications(db, timedelta(minutes=15))
        await crud.expire_change_email_applications(db, timedelta(minutes=15))
        await crud.expire_upgrade_account_applications(db, timedelta(minutes=15))


async def expire_email_rollback_task():
    async with db_session() as db:
        await crud.expire_change_email_rollback(db, timedelta(hours=72))


scheduler = AsyncIOScheduler()
scheduler.add_job(expire_applications_task, "interval", minutes=1)
scheduler.add_job(expire_email_rollback_task, "interval", hours=1)
