from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
from dotenv import load_dotenv
from contextlib import contextmanager
import db_models


load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("POSTGRESQL_URL")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    try:
        db_models.Base.metadata.create_all(bind=engine)
    except OperationalError:
        print("Error: Could not connect to the database")


# to be used by FastAPI Depends()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# to be used in a with statement outside FastAPI
@contextmanager
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
