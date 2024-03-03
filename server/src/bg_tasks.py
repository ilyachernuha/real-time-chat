from datetime import timedelta
from database import db_session
import crud


def expire_applications_task():
    with db_session() as db:
        crud.expire_register_applications(db, timedelta(minutes=15))
        crud.expire_reset_password_applications(db, timedelta(minutes=15))
        crud.expire_change_email_applications(db, timedelta(minutes=15))
        crud.expire_upgrade_account_applications(db, timedelta(minutes=15))


def expire_email_rollback_task():
    with db_session() as db:
        crud.expire_change_email_rollback(db, timedelta(hours=72))
