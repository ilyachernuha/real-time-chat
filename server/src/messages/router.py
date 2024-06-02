from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import  HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime, timezone
from . import crud, responses, message_utils
from ..security import security_bearer
from ..database import get_db
from ..auth import auth_utils
from ..rooms import room_utils


router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/message_info/{message_id}", response_model=responses.MessageInfo)
async def message_info(message_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    message = await crud.get_message_by_id(db=db, message_id=message_id)
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    room_id = message.room_id
    if not await room_utils.user_is_in_room(db=db, user_id=user_id, room_id=room_id):
        raise HTTPException(status_code=403, detail="You cannot access this message")
    return message_utils.message_to_dict(message=message, include_room_id=True)


@router.get("/room_updates", response_model=responses.RoomUpdates)
async def room_updates(after: float, room_id: uuid.UUID,
                       credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    if not await room_utils.user_is_in_room(db=db, user_id=user_id, room_id=room_id):
        raise HTTPException(status_code=403, detail="You are not member of this room")
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
    if not await room_utils.user_is_in_room(db=db, user_id=user_id, room_id=room_id):
        raise HTTPException(status_code=403, detail="You are not member of this room")
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
