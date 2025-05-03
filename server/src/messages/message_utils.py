from fastapi import HTTPException
from pydantic.functional_validators import ModelWrapValidator
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime, timezone, timedelta
from . import crud
from .. import db_models
from ..exceptions import MessageValidationError, PrivateMessageDeliveryError
from ..attachment import Attachment
from ..s3 import S3
from ..rooms import room_utils


def check_if_message_exits(message: db_models.Message | db_models.PrivateMessage | None):
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")


async def get_message_if_exits(db: AsyncSession, message_id: uuid.UUID):
    message = await crud.get_message_by_id(db=db, message_id=message_id)
    check_if_message_exits(message)
    return message


async def get_private_message_if_exits(db: AsyncSession, message_id: uuid.UUID):
    message = await crud.get_private_message_by_id(db=db, message_id=message_id)
    check_if_message_exits(message)
    return message


def check_if_message_belongs_to_user(message: db_models.Message | db_models.PrivateMessage, user_id: uuid.UUID):
    private = isinstance(message, db_models.PrivateMessage)
    if private and message.sender_id != user_id or not private and message.user_id != user_id:
        raise HTTPException(status_code=403, detail="This message is not yours")


async def check_if_message_is_not_deleted(message: db_models.Message | db_models.PrivateMessage):
    if message.text is None and not await message.awaitable_attrs.attachments:
        raise HTTPException(status_code=409, detail="Message is deleted")


def check_if_message_is_editable(message: db_models.Message | db_models.PrivateMessage):
    if message.timestamp + timedelta(days=2) < datetime.now(timezone.utc):
        raise HTTPException(status_code=403, detail="You cannot edit messages older then 2 days")


async def check_if_user_can_edit_message(message: db_models.Message | db_models.PrivateMessage, user_id: uuid.UUID):
    check_if_message_belongs_to_user(message=message, user_id=user_id)
    check_if_message_is_editable(message)
    await check_if_message_is_not_deleted(message)


async def check_if_user_can_delete_message(message: db_models.Message | db_models.PrivateMessage, user_id: uuid.UUID):
    check_if_message_belongs_to_user(message=message, user_id=user_id)
    await check_if_message_is_not_deleted(message)


# async def check_if_user_is_not_banned_by_user(db: AsyncSession, banner_id: uuid.UUID, banned_id: uuid.UUID):
#     if await crud.get_user_ban(db=db, banner_id=banner_id, banned_id=banned_id) is not None:
#         raise HTTPException(status_code=403, detail=f"You are banned by {banner_id}")


async def check_if_user_can_message_user(db: AsyncSession, sender_id: uuid.UUID, receiver_id: uuid.UUID):
    if await crud.get_user_by_id(db=db, user_id=receiver_id) is None or \
            await crud.get_user_ban(db=db, banner_id=receiver_id, banned_id=sender_id) is not None:
        raise PrivateMessageDeliveryError


async def attachment_to_dict(attachment: db_models.Attachment, message: db_models.Message | db_models.PrivateMessage):
    s3_folder = "private" if isinstance(message, db_models.PrivateMessage) else str(message.room_id)
    return {
        "attachment_id": str(attachment.attachment_id),
        "type": attachment.type.name,
        "presigned_url": await S3.generate_presigned_url(f"attachments/{s3_folder}/{attachment.attachment_id}"),
        "original_name": attachment.original_name
    }


async def attachments_to_dict(message: db_models.Message | db_models.PrivateMessage):
    return [
        await attachment_to_dict(attachment=attachment, message=message)
        for attachment in await message.awaitable_attrs.attachments
    ]


async def message_to_dict(message: db_models.Message, include_message_id: bool = False, include_room_id: bool = False):
    message_dict = {
        "user_id": message.user_id,
        "reply_to": message.reply_message_id,
        "text": message.text,
        "created_at": message.timestamp.timestamp(),
        "updated_at": message.update_time.timestamp() if message.update_time is not None else None,
        "attachments": await attachments_to_dict(message)
    }
    if include_message_id:
        message_dict["message_id"] = message.message_id
    if include_room_id:
        message_dict["room_id"] = message.room_id
    return message_dict


async def private_message_to_dict(message: db_models.PrivateMessage, include_message_id: bool = False):
    message_dict = {
        "sender_id": message.sender_id,
        "receiver_id": message.receiver_id,
        "reply_to": message.reply_message_id,
        "text": message.text,
        "created_at": message.timestamp.timestamp(),
        "updated_at": message.update_time.timestamp() if message.update_time is not None else None,
        "read": message.read_time is not None,
        "attachments": await attachments_to_dict(message)
    }
    if include_message_id:
        message_dict["message_id"] = message.message_id
    return message_dict


def validate_message_text(text: str):
    if not text:
        raise MessageValidationError("Message cannot be empty")
    if len(text) > 5000:
        raise MessageValidationError("Message cannot contain > 1000 characters")
    if text.isspace():
        raise MessageValidationError("Message cannot contain whitespace only")


def validate_text_and_attachments_logic(text: str, attachments: bool):
    if text is not None:
        validate_message_text(text)
    if text is None and not attachments:
        raise MessageValidationError("Message cannot be empty")


def check_if_reply_message_exists(message: db_models.Message | db_models.PrivateMessage):
    if message is None:
        raise MessageValidationError("Message you're replying to does not exist")


async def validate_message_reply(db: AsyncSession, message_id: uuid.UUID, room_id: uuid.UUID):
    message = await crud.get_message_by_id(db=db, message_id=message_id)
    check_if_reply_message_exists(message)
    if message.room_id != room_id:
        raise MessageValidationError(
            "Room you're sending message to and the room of the message you're replying to do not match"
        )


async def validate_message(db: AsyncSession, room_id: uuid.UUID, text: str | None, reply_message_id: uuid.UUID | None,
                           attachments: bool):
    validate_text_and_attachments_logic(text=text, attachments=attachments)
    if reply_message_id is not None:
        await validate_message_reply(db=db, message_id=reply_message_id, room_id=room_id)


async def validate_private_message_reply(db: AsyncSession, message_id: uuid.UUID,
                                         user_ids: tuple[uuid.UUID, uuid.UUID]):
    message = await crud.get_private_message_by_id(db=db, message_id=message_id)
    check_if_reply_message_exists(message)
    user_id1, user_id2 = message.sender_id, message.receiver_id
    if (user_id1, user_id2) != user_ids and (user_id2, user_id1) != user_ids:
        raise MessageValidationError("Message you're trying to reply to is not from this conversation")


async def validate_private_message(db: AsyncSession, text: str | None, user_ids: tuple[uuid.UUID, uuid.UUID],
                                   reply_message_id: uuid.UUID | None, attachments: bool):
    validate_text_and_attachments_logic(text=text, attachments=attachments)
    if reply_message_id is not None:
        await validate_private_message_reply(db=db, message_id=reply_message_id, user_ids=user_ids)


async def add_attachments_to_message_and_upload_to_s3(db: AsyncSession,
                                                      message: db_models.Message | db_models.PrivateMessage,
                                                      attachments: list[Attachment]):
    private = isinstance(message, db_models.PrivateMessage)
    s3_folder = "private" if private else str(message.room_id)
    for attachment in attachments:
        attachment_id = (await crud.create_attachment(db=db, message_id=message.message_id,
                                                      attachment_type=attachment.type,
                                                      original_name=attachment.filename,
                                                      is_private_message=private)).attachment_id
        await S3.upload_file(file=attachment.file, filename=f"attachments/{s3_folder}/{attachment_id}")


def check_if_attachment_exists(attachment: db_models.Attachment | None):
    if attachment is None:
        raise HTTPException(status_code=404, detail="Attachment not found")


async def get_attachment_if_exists(db: AsyncSession, attachment_id: uuid.UUID):
    attachment = await crud.get_attachment_by_id(db=db, attachment_id=attachment_id)
    check_if_attachment_exists(attachment)
    return attachment


# async def get_message_from_attachment(attachment: db_models.Attachment):
#     message = (
#         await attachment.awaitable_attrs.message
#         if attachment.message_type == db_models.Attachment.MessageType.public else
#         await attachment.awaitable_attrs.private_message
#     )
#     return message


async def check_if_user_can_access_attachment(db: AsyncSession, user_id: uuid.UUID, attachment: db_models.Attachment):
    if attachment.message_type == db_models.Attachment.MessageType.public:
        message = await attachment.awaitable_attrs.message
        room = await message.awaitable_attrs.room
        if not await room_utils.check_if_user_is_room_member(db=db, user_id=user_id, room_id=room.room_id):
            raise HTTPException(status_code=403, detail="You don't have access to this attachment")
    else:
        message = await attachment.awaitable_attrs.private_message
        if user_id != message.sender_id and user_id != message.receiver_id:
            raise HTTPException(status_code=403, detail="You don't have access to this attachment")


async def delete_attachments(db: AsyncSession, message: db_models.Message):
    for attachment in await message.awaitable_attrs.attachments:
        attachment_id = attachment.attachment_id
        await crud.delete_attachment(db=db, attachment_id=attachment_id)
        await S3.delete_file(f"attachments/{message.room_id}/{attachment_id}")
