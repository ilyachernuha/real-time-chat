from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import  HTTPAuthorizationCredentials
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
    return message_utils.message_to_dict(message=message, include_room_id=True)


@router.get("/room_updates", response_model=responses.RoomUpdates)
async def room_updates(after: float, room_id: uuid.UUID,
                       credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    await room_utils.check_if_user_is_room_member(db=db, user_id=user_id, room_id=room_id)
    timestamp = datetime.fromtimestamp(after, timezone.utc)
    new_messages = [
        message_utils.message_to_dict(message=message, include_message_id=True)
        for message in (
            await crud.get_messages_in_room_created_after_timestamp(db=db, room_id=room_id, timestamp=timestamp)
        )
    ]
    updated_messages = [
        message_utils.message_to_dict(message=message, include_message_id=True)
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
        message_utils.message_to_dict(message=message, include_message_id=True)
        for message in (
            await crud.get_messages_in_room_before_timestamp(db=db, room_id=room_id,
                                                             timestamp=datetime.fromtimestamp(before, timezone.utc),
                                                             limit=number)
                if before is not None else
            await crud.get_latest_messages_in_room(db=db, room_id=room_id, limit=number)
        )
    ]
    return {"messages": messages}


@router.patch("/edit_message/{message_id}", response_model=responses.GenericConfirmation)
async def edit_message(message_id: uuid.UUID, body: schemas.EditMessage,
                       credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    message = await message_utils.get_message_if_exits(db=db, message_id=message_id)
    message_utils.check_if_user_can_edit_message(message=message, user_id=user_id)
    message_utils.validate_message_text(body.text)
    await crud.update_message(db=db, message_id=message_id, text=body.text)
    await sio.emit_message_update(room_id=message.room_id, message_id=message_id, text=body.text)
    return {"status": "success"}


@router.delete("/delete_message/{message_id}", response_model=responses.GenericConfirmation)
async def delete_message(message_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                         db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    message = await message_utils.get_message_if_exits(db=db, message_id=message_id)
    message_utils.check_if_user_can_delete_message(message=message, user_id=user_id)
    await crud.update_message(db=db, message_id=message_id, text=None)
    await sio.emit_message_update(room_id=message.room_id, message_id=message_id, text=None)
    return {"status": "success"}
