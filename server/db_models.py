from sqlalchemy import Column, ForeignKey, String, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import Enum as SQLAlchemyEnum
from enum import Enum
import datetime
import secrets


Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID, primary_key=True)
    is_guest = Column(Boolean, nullable=False)
    name = Column(String, nullable=False)
    account_data = relationship("AccountData", back_populates="user", uselist=False, cascade="all, delete-orphan")

    @validates("is_guest", "account_data")
    def validate_user(self, key, value):
        if key == "is_guest":
            if value and self.account_data:
                raise ValueError("Users with account data cannot be guests")
        elif key == "account_data":
            if value and self.is_guest:
                raise ValueError("Guest users cannot have account data")
            if not value and not self.is_guest:
                raise ValueError("Non-guest users must have account data")
        return value


class AccountData(Base):
    __tablename__ = "account_data"

    user_id = Column(UUID, ForeignKey("users.user_id"), primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    user = relationship("User", back_populates="account_data")


class RegisterApplication(Base):
    __tablename__ = "register_applications"

    class Status(Enum):
        pending = 1
        confirmed = 2
        failed = 3
        confirmed_elsewhere = 4

    application_id = Column(UUID, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow())
    confirmation_code = Column(String(4), nullable=False, default=lambda: f"{secrets.randbelow(10000):04d}")
    failed_attempts = Column(Integer, default=0)
    status = Column(SQLAlchemyEnum(Status), default=Status.pending)
