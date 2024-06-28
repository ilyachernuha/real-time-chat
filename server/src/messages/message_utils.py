from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime, timezone, timedelta
from . import crud
from .. import db_models
from ..exceptions import MessageValidationError


def check_if_message_exits(message: db_models.Message | None):
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")


async def get_message_if_exits(db: AsyncSession, message_id: uuid.UUID):
    message = await crud.get_message_by_id(db=db, message_id=message_id)
    check_if_message_exits(message)
    return message


def check_if_message_belongs_to_user(message: db_models.Message, user_id: uuid.UUID):
    if message.user_id != user_id:
        raise HTTPException(status_code=403, detail="This message is not yours")


def check_if_message_is_not_deleted(message: db_models.Message):
    if message.text is None:
        raise HTTPException(status_code=409, detail="Message is deleted")


def check_if_message_is_editable(message: db_models.Message):
    if message.timestamp + timedelta(days=2) < datetime.now(timezone.utc):
        raise HTTPException(status_code=403, detail="You cannot edit messages older then 2 days")


def check_if_user_can_edit_message(message: db_models.Message, user_id: uuid.UUID):
    check_if_message_belongs_to_user(message=message, user_id=user_id)
    check_if_message_is_not_deleted(message)
    check_if_message_is_editable(message)


def check_if_user_can_delete_message(message: db_models.Message, user_id: uuid.UUID):
    check_if_message_belongs_to_user(message=message, user_id=user_id)
    check_if_message_is_not_deleted(message)


def message_to_dict(message: db_models.Message, include_message_id: bool = False, include_room_id: bool = False):
    message_dict = {
        "user_id": message.user_id,
        "reply_to": message.reply_message_id,
        "text": message.text,
        "created_at": message.timestamp.timestamp(),
        "updated_at": message.update_time.timestamp() if message.update_time is not None else None
    }
    if include_message_id:
        message_dict["message_id"] = message.message_id
    if include_room_id:
        message_dict["room_id"] = message.room_id
    return message_dict


def validate_message_text(text: str):
    if not text:
        raise MessageValidationError("Message cannot be empty")
    if len(text) > 1000:
        raise MessageValidationError("Message cannot contain > 1000 characters")


async def validate_message_reply(db: AsyncSession, message_id: uuid.UUID, room_id: uuid.UUID):
    message = await crud.get_message_by_id(db=db, message_id=message_id)
    if message is None:
        raise MessageValidationError("Message you're replying to does not exist")
    if message.room_id != room_id:
        raise MessageValidationError(
            "Room you're sending message to and the room of the message you're replying to do not match")
