from sqlalchemy import Column, ForeignKey, String, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSON
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
    banned = relationship("UserRoomBan", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")
    user_bans_applied = relationship("UserUserBan", back_populates="banned_user",
                                     foreign_keys="[UserUserBan.banned_id]")
    user_bans_received = relationship("UserUserBan", back_populates="banned_by", foreign_keys="[UserUserBan.banner_id]")
    sent_private_messages = relationship("PrivateMessage", back_populates="sender",
                                         foreign_keys="[PrivateMessage.sender_id]", cascade="all, delete-orphan")
    received_private_messages = relationship("PrivateMessage", back_populates="receiver",
                                             foreign_keys="[PrivateMessage.receiver_id]", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

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
    is_public = Column(Boolean, nullable=False, default=True)
    owner = relationship("User", back_populates="rooms_owned")
    users = relationship("UserRoomAssociation", back_populates="room", cascade="all, delete-orphan")
    banned_users = relationship("UserRoomBan", back_populates="room", cascade="all, delete-orphan")
    tags = relationship("RoomTagAssociation", back_populates="room", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")


class UserRoomAssociation(Base):
    __tablename__ = "user_room_association"

    user_id = Column(UUID, ForeignKey("users.user_id"), primary_key=True)
    room_id = Column(UUID, ForeignKey("rooms.room_id"), primary_key=True)
    is_admin = Column(Boolean, default=False)
    user = relationship("User", back_populates="rooms")
    room = relationship("Room", back_populates="users")


class UserRoomBan(Base):
    __tablename__ = "users_banned_in_rooms"

    user_id = Column(UUID, ForeignKey("users.user_id"), primary_key=True)
    room_id = Column(UUID, ForeignKey("rooms.room_id"), primary_key=True)
    user = relationship("User", back_populates="banned")
    room = relationship("Room", back_populates="banned_users")


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


class PrivateMessage(Base):
    __tablename__ = "private_messages"

    message_id = Column(UUID, primary_key=True)
    sender_id = Column(UUID, ForeignKey("users.user_id"), nullable=False, index=True)
    receiver_id = Column(UUID, ForeignKey("users.user_id"), nullable=False, index=True)
    reply_message_id = Column(UUID, ForeignKey("private_messages.message_id"), nullable=True, default=None)
    text = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    update_time = Column(DateTime(timezone=True), nullable=True, default=None)
    sender = relationship("User", back_populates="sent_private_messages", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="received_private_messages", foreign_keys=[receiver_id])
    reply_to = relationship("PrivateMessage", back_populates="replies", remote_side=[message_id])
    replies = relationship("PrivateMessage", back_populates="reply_to")
    attachments = relationship("Attachment", back_populates="private_message", cascade="all, delete-orphan")


class Attachment(Base):
    __tablename__ = "attachments"

    class MessageType(Enum):
        public = 1
        private = 2

    attachment_id = Column(UUID, primary_key=True)
    message_id = Column(UUID, ForeignKey("messages.message_id"), nullable=True)
    private_message_id = Column(UUID, ForeignKey("private_messages.message_id"), nullable=True)
    type = Column(SQLAlchemyEnum(AttachmentType, neme="attachment_type"), nullable=False)
    original_name = Column(String, nullable=True, default=None)
    message_type = Column(SQLAlchemyEnum(MessageType, name="message_relationship_type"), nullable=False)
    message = relationship("Message", back_populates="attachments")
    private_message = relationship("PrivateMessage", back_populates="attachments")

    @validates("message_id", "private_message_id", "message_type")
    def validate_relationships(self, key, value):
        if key in {"message_id", "private_message_id"}:
            message_present = self.message_id is not None or (key == "message_id" and value is not None)
            private_message_present = self.private_message_id is not None or \
                                      (key == "private_message_id" and value is not None)
            if message_present and private_message_present:
                raise ValueError("An attachment cannot be linked to both a public and a private message")
            if not message_present and not private_message_present:
                raise ValueError("An attachment must be linked to either a public or a private message")
        if key == "message_type":
            if self.message_id is not None and value != Attachment.MessageType.public:
                raise ValueError("message_type must be 'public' if message_id is set")
            if self.private_message_id is not None and value != Attachment.MessageType.private:
                raise ValueError("message_type must be 'private' if private_message_id is set")
        return value


class UserUserBan(Base):
    __tablename__ = "users_banned_by_users"

    banned_id = Column(UUID, ForeignKey("users.user_id"), primary_key=True)
    banner_id = Column(UUID, ForeignKey("users.user_id"), primary_key=True)
    banned_user = relationship("User", back_populates="user_bans_applied", foreign_keys=[banned_id])
    banned_by = relationship("User", back_populates="user_bans_received", foreign_keys=[banner_id])


class Notification(Base):
    __tablename__ = "notifications"

    class Type(Enum):
        new_login = 1
        added_to_room = 2
        banned_from_room = 3
        unbanned_from_room = 4

    notification_id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.user_id"), nullable=False)
    type = Column(SQLAlchemyEnum(Type, name="notification_type"), nullable=False)
    details = Column(JSON, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="notifications")
