from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime, timezone
from . import crud, responses, message_utils, schemas
from ..security import security_bearer
from ..database import get_db
from ..auth import auth_utils
from ..rooms import room_utils
from ..sio import external as sio


router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/message_info/{message_id}", response_model=responses.MessageInfo)
async def message_info(message_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    message = await message_utils.get_message_if_exits(db=db, message_id=message_id)
    room_id = message.room_id
    if not await room_utils.user_is_in_room(db=db, user_id=user_id, room_id=room_id):
        raise HTTPException(status_code=403, detail="You cannot access this message")
    return await message_utils.message_to_dict(message=message, include_room_id=True)


@router.get("/room_updates", response_model=responses.RoomUpdates)
async def room_updates(after: float, room_id: uuid.UUID,
                       credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    await room_utils.check_if_user_is_room_member(db=db, user_id=user_id, room_id=room_id)
    timestamp = datetime.fromtimestamp(after, timezone.utc)
    new_messages = [
        await message_utils.message_to_dict(message=message, include_message_id=True)
        for message in (
            await crud.get_messages_in_room_created_after_timestamp(db=db, room_id=room_id, timestamp=timestamp)
        )
    ]
    updated_messages = [
        await message_utils.message_to_dict(message=message, include_message_id=True)
        for message in (
            await crud.get_messages_in_room_updated_after_timestamp(db=db, room_id=room_id, timestamp=timestamp)
        )
    ]
    return {
        "new_messages": new_messages,
        "updated_messages": updated_messages
    }


@router.get("/old_messages", response_model=responses.OldMessages)
async def old_messages(room_id: uuid.UUID, number: int = Query(gt=10, default=100), before: float | None = None,
                       credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    await room_utils.check_if_user_is_room_member(db=db, user_id=user_id, room_id=room_id)
    messages = [
        await message_utils.message_to_dict(message=message, include_message_id=True)
        for message in (
            await crud.get_messages_in_room_before_timestamp(db=db, room_id=room_id,
                                                             timestamp=datetime.fromtimestamp(before, timezone.utc),
                                                             limit=number)
            if before is not None else
            await crud.get_latest_messages_in_room(db=db, room_id=room_id, limit=number)
        )
    ]
    return {"messages": messages}


@router.post("/send_message", response_model=responses.MessageCreated)
async def send_message(body: schemas.Message = Depends(),
                       credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db=db, token=credentials.credentials)
    session_id = auth_utils.extract_session_id_from_access_token(credentials.credentials)
    await room_utils.check_if_user_is_room_member(db=db, user_id=user.user_id, room_id=body.room_id)
    await message_utils.validate_message(db=db, room_id=body.room_id, text=body.text,
                                         reply_message_id=body.reply_message_id, attachments=bool(body.attachments))
    message = await crud.create_message(db=db, user_id=user.user_id, room_id=body.room_id, text=body.text,
                                        reply_message_id=body.reply_message_id)
    if body.attachments is not None:
        await message_utils.add_attachments_to_message_and_upload_to_s3(db=db, message=message,
                                                                        attachments=body.attachments)
    await sio.emit_message(user=user, message=message, skip_session=session_id)
    return {"status": "success", "message_id": message.message_id, "timestamp": message.timestamp.timestamp()}


@router.post("/send_voice_message", response_model=responses.MessageCreated)
async def send_voice_message(body: schemas.VoiceMessage = Depends(),
                             credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                             db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db=db, token=credentials.credentials)
    session_id = auth_utils.extract_session_id_from_access_token(credentials.credentials)
    await room_utils.check_if_user_is_room_member(db=db, user_id=user.user_id, room_id=body.room_id)
    if body.reply_message_id is not None:
        await message_utils.validate_message_reply(db=db, message_id=body.reply_message_id, room_id=body.room_id)
    message = await crud.create_message(db=db, user_id=user.user_id, room_id=body.room_id, text=None,
                                        reply_message_id=body.reply_message_id)
    await message_utils.add_attachments_to_message_and_upload_to_s3(db=db, message=message,
                                                                    attachments=[body.voice])
    await sio.emit_message(user=user, message=message, skip_session=session_id)
    return {"status": "success", "message_id": message.message_id, "timestamp": message.timestamp.timestamp()}


@router.patch("/edit_message/{message_id}", response_model=responses.GenericConfirmation)
async def edit_message(message_id: uuid.UUID, body: schemas.EditMessage,
                       credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id, session_id = auth_utils.extract_access_token_data(credentials.credentials)
    message = await message_utils.get_message_if_exits(db=db, message_id=message_id)
    await message_utils.check_if_user_can_edit_message(message=message, user_id=user_id)
    message_utils.validate_message_text(body.text)
    await crud.update_message(db=db, message_id=message_id, text=body.text)
    await sio.emit_message_update(room_id=message.room_id, message_id=message_id, text=body.text,
                                  skip_session=session_id)
    return {"status": "success"}


@router.delete("/delete_message/{message_id}", response_model=responses.GenericConfirmation)
async def delete_message(message_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                         db: AsyncSession = Depends(get_db)):
    user_id, session_id = auth_utils.extract_access_token_data(credentials.credentials)
    message = await message_utils.get_message_if_exits(db=db, message_id=message_id)
    await message_utils.check_if_user_can_delete_message(message=message, user_id=user_id)
    if message.text is not None:
        await crud.update_message(db=db, message_id=message_id, text=None)
    if await message.awaitable_attrs.attachments:
        await message_utils.delete_attachments(db=db, message=message)
    await sio.emit_message_update(room_id=message.room_id, message_id=message_id, text=None, skip_session=session_id)
    return {"status": "success"}


@router.get("/private_message_info/{message_id}", response_model=responses.PrivateMessageInfo)
async def private_message_info(message_id: uuid.UUID,
                               credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                               db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    message = await message_utils.get_private_message_if_exits(db=db, message_id=message_id)
    if not user_id in {message.sender_id, message.receiver_id}:
        raise HTTPException(status_code=403, detail="You cannot access this message")
    return await message_utils.private_message_to_dict(message=message)


@router.get("/private_conversations", response_model=responses.PrivateConversations)
async def private_conversations(credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                                db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    partner_ids = await crud.get_conversation_partners_by_user_id(db=db, user_id=user_id)
    return {"user_ids": partner_ids}


@router.get("/private_message_updates", response_model=responses.PrivateMessageUpdates)
async def private_message_updates(after: float, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                                  db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    timestamp = datetime.fromtimestamp(after, timezone.utc)
    new_messages = [
        await message_utils.private_message_to_dict(message=message, include_message_id=True)
        for message in (
            await crud.get_private_messages_of_user_created_after_timestamp(db=db, user_id=user_id, timestamp=timestamp)
        )
    ]
    updated_messages = [
        await message_utils.private_message_to_dict(message=message, include_message_id=True)
        for message in (
            await crud.get_private_messages_of_user_updated_after_timestamp(db=db, user_id=user_id, timestamp=timestamp)
        )
    ]
    read_messages = [
        message.message_id
        for message in (
            await crud.get_private_messages_of_user_created_before_and_read_after_timestamp(db=db, user_id=user_id,
                                                                                            timestamp=timestamp)
        )
    ]
    return {
        "new_messages": new_messages,
        "updated_messages": updated_messages,
        "read_messages": read_messages
    }


@router.get("/old_private_messages", response_model=responses.OldPrivateMessages)
async def old_private_messages(user_id: uuid.UUID, number: int = Query(gt=10, default=100), before: float | None = None,
                               credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                               db: AsyncSession = Depends(get_db)):
    request_user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    messages = [
        await message_utils.private_message_to_dict(message=message, include_message_id=True)
        for message in (
            await crud.get_private_messages_between_two_users_before_timestamp(db=db, user_id1=request_user_id,
                                                                               user_id2=user_id,
                                                                               timestamp=datetime.fromtimestamp(
                                                                                   before, timezone.utc
                                                                               ),
                                                                               limit=number)
            if before is not None else
            await crud.get_latest_private_messages_between_two_users(db=db, user_id1=request_user_id,
                                                                     user_id2=user_id, limit=number)
        )
    ]
    return {"messages": messages}


@router.post("/send_private_message", response_model=responses.MessageCreated)
async def send_private_message(body: schemas.PrivateMessage = Depends(),
                               credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                               db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db=db, token=credentials.credentials)
    session_id = auth_utils.extract_session_id_from_access_token(credentials.credentials)
    await message_utils.check_if_user_can_message_user(db=db, receiver_id=body.receiver_id, sender_id=user.user_id)
    await message_utils.validate_private_message(db=db, text=body.text, user_ids=(user.user_id, body.receiver_id),
                                                 reply_message_id=body.reply_message_id,
                                                 attachments=bool(body.attachments))
    message = await crud.create_private_message(db=db, sender_id=user.user_id, receiver_id=body.receiver_id,
                                                text=body.text, reply_message_id=body.reply_message_id)
    if body.attachments is not None:
        await message_utils.add_attachments_to_message_and_upload_to_s3(db=db, message=message,
                                                                        attachments=body.attachments)
    await sio.emit_private_message(message=message, skip_session=session_id)
    return {"status": "success", "message_id": message.message_id, "timestamp": message.timestamp.timestamp()}


@router.post("/send_private_voice_message", response_model=responses.MessageCreated)
async def send_private_voice_message(body: schemas.PrivateVoiceMessage = Depends(),
                                     credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                                     db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db=db, token=credentials.credentials)
    session_id = auth_utils.extract_session_id_from_access_token(credentials.credentials)
    await message_utils.check_if_user_can_message_user(db=db, receiver_id=body.receiver_id, sender_id=user.user_id)
    if body.reply_message_id is not None:
        await message_utils.validate_private_message_reply(db=db, message_id=body.reply_message_id,
                                                           user_ids=(user.user_id, body.receiver_id))
    message = await crud.create_private_message(db=db, sender_id=user.user_id, receiver_id=body.receiver_id,
                                                text=None, reply_message_id=body.reply_message_id)
    await message_utils.add_attachments_to_message_and_upload_to_s3(db=db, message=message,
                                                                    attachments=[body.voice])
    await sio.emit_private_message(message=message, skip_session=session_id)
    return {"status": "success", "message_id": message.message_id}


@router.patch("/edit_private_message/{message_id}", response_model=responses.GenericConfirmation)
async def edit_private_message(message_id: uuid.UUID, body: schemas.EditMessage,
                               credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                               db: AsyncSession = Depends(get_db)):
    user_id, session_id = auth_utils.extract_access_token_data(credentials.credentials)
    message = await message_utils.get_private_message_if_exits(db=db, message_id=message_id)
    await message_utils.check_if_user_can_edit_message(message=message, user_id=user_id)
    message_utils.validate_message_text(body.text)
    await crud.update_private_message(db=db, message_id=message_id, text=body.text)
    await sio.emit_private_message_update(message_id=message_id, sender_id=user_id, receiver_id=message.receiver_id,
                                          text=body.text, skip_session=session_id)
    return {"status": "success"}


@router.delete("/delete_private_message/{message_id}", response_model=responses.GenericConfirmation)
async def delete_private_message(message_id: uuid.UUID,
                                 credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                                 db: AsyncSession = Depends(get_db)):
    user_id, session_id = auth_utils.extract_access_token_data(credentials.credentials)
    message = await message_utils.get_private_message_if_exits(db=db, message_id=message_id)
    await message_utils.check_if_user_can_delete_message(message=message, user_id=user_id)
    if message.text is not None:
        await crud.update_private_message(db=db, message_id=message_id, text=None)
    if await message.awaitable_attrs.attachments:
        await message_utils.delete_attachments(db=db, message=message)
    await sio.emit_private_message_update(message_id=message_id, sender_id=user_id, receiver_id=message.receiver_id,
                                          text=None, skip_session=session_id)
    return {"status": "success"}


@router.post("/block_user", response_model=responses.GenericConfirmation)
async def block_user(body: schemas.BlockUser, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    if await crud.get_user_ban(db=db, banner_id=user_id, banned_id=body.user_id) is not None:
        raise HTTPException(status_code=409, detail="User is already blocked")
    await crud.create_user_ban(db=db, banner_id=user_id, banned_id=body.user_id)
    return {"status": "success"}


@router.post("/unblock_user", response_model=responses.GenericConfirmation)
async def unblock_user(body: schemas.BlockUser, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    if await crud.get_user_ban(db=db, banner_id=user_id, banned_id=body.user_id) is None:
        raise HTTPException(status_code=409, detail="User is already blocked")
    await crud.remove_user_ban(db=db, banner_id=user_id, banned_id=body.user_id)
    return {"status": "success"}


@router.get("/attachment/{attachment_id}", response_model=responses.Attachment)
async def get_attachment(attachment_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                         db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    attachment = await message_utils.get_attachment_if_exists(db=db, attachment_id=attachment_id)
    await message_utils.check_if_user_can_access_attachment(db=db, user_id=user_id, attachment=attachment)
    return await message_utils.attachment_to_dict(attachment=attachment,
                                                  message=(await attachment.awaitable_attrs.message))
