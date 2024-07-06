from sqlalchemy import Column, ForeignKey, String, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import DeclarativeBase, relationship, validates
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.types import Enum as SQLAlchemyEnum
from enum import Enum
from datetime import datetime, timezone
import secrets
from .rooms.room_languages import RoomLanguage
from .rooms.room_themes import RoomTheme
from .attachment import AttachmentType


class Base(AsyncAttrs, DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID, primary_key=True)
    is_guest = Column(Boolean, nullable=False)
    name = Column(String, nullable=False)
    profile_picture_id = Column(UUID, nullable=True, default=None)
    account_data = relationship("AccountData", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    rooms_owned = relationship("Room", back_populates="owner", cascade="all, delete-orphan")
    rooms = relationship("UserRoomAssociation", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")

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
        email_confirmed_elsewhere = 4
        expired = 5

    application_id = Column(UUID, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    confirmation_code = Column(String(4), nullable=False, default=lambda: f"{secrets.randbelow(10000):04d}")
    failed_attempts = Column(Integer, default=0)
    status = Column(SQLAlchemyEnum(Status, name="register_application_status"), default=Status.pending)
    device_info = Column(String)


class ResetPasswordApplication(Base):
    __tablename__ = "reset_password_applications"

    class Status(Enum):
        pending = 1
        used = 2
        expired = 3

    application_id = Column(UUID, primary_key=True)
    user_id = Column(UUID, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status = Column(SQLAlchemyEnum(Status, name="reset_password_status"), default=Status.pending)


class ChangeEmailApplication(Base):
    __tablename__ = "change_email_applications"

    class Status(Enum):
        pending = 1
        confirmed = 2
        failed = 3
        email_confirmed_elsewhere = 4
        expired = 5
        rolled_back = 6

    class RollbackStatus(Enum):
        unavailable = 1
        pending = 2
        completed = 3
        expired = 4

    application_id = Column(UUID, primary_key=True)
    user_id = Column(UUID, nullable=False)
    new_email = Column(String, nullable=False)
    old_email = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    confirmation_code = Column(String(4), nullable=False, default=lambda: f"{secrets.randbelow(10000):04d}")
    failed_attempts = Column(Integer, default=0)
    status = Column(SQLAlchemyEnum(Status, name="change_email_status"), default=Status.pending)
    rollback_status = Column(SQLAlchemyEnum(RollbackStatus, name="email_roll_back_status"),
                             default=RollbackStatus.unavailable)


class UpgradeAccountApplication(Base):
    __tablename__ = "upgrade_account_applications"

    class Status(Enum):
        pending = 1
        confirmed = 2
        failed = 3
        email_confirmed_elsewhere = 4
        expired = 5

    application_id = Column(UUID, primary_key=True)
    user_id = Column(UUID, nullable=False)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    confirmation_code = Column(String(4), nullable=False, default=lambda: f"{secrets.randbelow(10000):04d}")
    failed_attempts = Column(Integer, default=0)
    status = Column(SQLAlchemyEnum(Status, name="upgrade_account_status"), default=Status.pending)


class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.user_id"), index=True)
    refresh_token_hash = Column(String, nullable=False, unique=True)
    device_info = Column(String)
    latest_activity = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="sessions")


class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(UUID, primary_key=True)
    owner_id = Column(UUID, ForeignKey("users.user_id"), index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    theme = Column(SQLAlchemyEnum(RoomTheme, name="room_theme"), nullable=False)
    languages = Column(ARRAY(SQLAlchemyEnum(RoomLanguage, name="room_language")), nullable=False)
    room_picture_id = Column(UUID, nullable=True, default=None)
    owner = relationship("User", back_populates="rooms_owned")
    users = relationship("UserRoomAssociation", back_populates="room", cascade="all, delete-orphan")
    tags = relationship("RoomTagAssociation", back_populates="room", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")


class UserRoomAssociation(Base):
    __tablename__ = "user_room_association"

    user_id = Column(UUID, ForeignKey("users.user_id"), primary_key=True)
    room_id = Column(UUID, ForeignKey("rooms.room_id"), primary_key=True)
    is_admin = Column(Boolean, default=False)
    user = relationship("User", back_populates="rooms")
    room = relationship("Room", back_populates="users")


class Tag(Base):
    __tablename__ = "tags"

    tag = Column(String, primary_key=True)
    rooms = relationship("RoomTagAssociation", back_populates="tag")


class RoomTagAssociation(Base):
    __tablename__ = "room_tag_association"

    room_id = Column(UUID, ForeignKey("rooms.room_id"), primary_key=True)
    tag_name = Column(String, ForeignKey("tags.tag"), primary_key=True)
    theme = Column(SQLAlchemyEnum(RoomTheme, name="room_theme"), nullable=False, index=True)
    room = relationship("Room", back_populates="tags")
    tag = relationship("Tag", back_populates="rooms")


class Message(Base):
    __tablename__ = "messages"

    message_id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.user_id"), nullable=False)
    room_id = Column(UUID, ForeignKey("rooms.room_id"), nullable=False, index=True)
    reply_message_id = Column(UUID, ForeignKey("messages.message_id"), nullable=True, default=None)
    text = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    update_time = Column(DateTime(timezone=True), nullable=True, default=None)
    room = relationship("Room", back_populates="messages")
    user = relationship("User", back_populates="messages")
    reply_to = relationship("Message", back_populates="replies", remote_side=[message_id])
    replies = relationship("Message", back_populates="reply_to")
    attachments = relationship("Attachment", back_populates="message", cascade="all, delete-orphan")


class Attachment(Base):
    __tablename__ = "attachments"

    attachment_id = Column(UUID, primary_key=True)
    message_id = Column(UUID, ForeignKey("messages.message_id"), nullable=False)
    type = Column(SQLAlchemyEnum(AttachmentType, neme="attachment_type"), nullable=False)
    original_name = Column(String, nullable=True, default=None)
    message = relationship("Message", back_populates="attachments")
