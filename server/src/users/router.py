from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool
import asyncio
import uuid
from io import BytesIO
from . import crud, schemas, user_utils, responses
from ..database import get_db
from ..auth import auth_utils
from .. import image_utils, file_utils
from ..s3 import S3
from ..security import security_bearer
from ..sio import external as sio, search


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/find_users", response_model=responses.UserList)
async def find_users(search: str, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: AsyncSession = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    user_utils.validate_username(search)
    users = await crud.search_users(db=db, username=search, limit=None)
    users_data = [
        {
            "user_id": user.user_id,
            "username": (await user.awaitable_attrs.account_data).username,
            "name": user.name,
            "profile_picture_id": user.profile_picture_id
        }
        for user in users
    ]
    return {"users": users_data}


@router.get("/profile/{user_id}", response_model=responses.UserProfile)
async def get_profile(user_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    user = await user_utils.get_user_if_exists(db=db, user_id=user_id)
    return {
        "name": user.name,
        "guest": user.is_guest,
        "username": (await user.awaitable_attrs.account_data).username if not user.is_guest else None,
        "profile_picture_id": user.profile_picture_id
    }


@router.get("/me", response_model=responses.OwnProfile)
async def get_own_profile(credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                          db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db=db, token=credentials.credentials)
    return {
        "name": user.name,
        "guest": user.is_guest,
        "username": (await user.awaitable_attrs.account_data).username if not user.is_guest else None,
        "email": (await user.awaitable_attrs.account_data).email if not user.is_guest else None,
        "profile_picture_id": user.profile_picture_id
    }


@router.put("/change_name", response_model=responses.NameUpdate)
async def change_name(body: schemas.UpdateName, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    user_utils.validate_name(body.new_name)
    user = await crud.update_user_name(db, user_id, body.new_name)
    await sio.update_user_name(user_id, user.name)
    if (not user.is_guest):
        search.UserTrie.update_user_name(username=(await user.awaitable_attrs.account_data).username, name=user.name)
    return {"status": "success", "new_name": user.name}


@router.put("/set_profile_picture", response_model=responses.ProfilePictureUpdate)
async def set_profile_picture(image: BytesIO = Depends(file_utils.verify_profile_or_room_picture_size),
                              credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                              db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db=db, token=credentials.credentials)
    old_profile_picture_id = user.profile_picture_id
    await run_in_threadpool(lambda: image_utils.validate_image_is_square(image))
    image_100p = await run_in_threadpool(lambda: image_utils.compress_square_image(original=image, size=100))
    new_profile_picture_id = uuid.uuid4()
    tasks = [
        asyncio.create_task(S3.upload_file(file=_["file"], filename=_["name"])) for _ in (
            {"file": image, "name": f"profile-pictures/full-size/{new_profile_picture_id}.jpeg"},
            {"file": image_100p, "name": f"profile-pictures/100p/{new_profile_picture_id}.jpeg"}
        )
    ]
    await asyncio.gather(*tasks)
    await crud.update_profile_picture_id(db=db, user_id=user.user_id, new_profile_picture_id=new_profile_picture_id)
    if old_profile_picture_id is not None:
        await user_utils.delete_profile_picture_from_s3(old_profile_picture_id)
    await sio.update_user_profile_picture(user_id=user.user_id, new_picture_id=new_profile_picture_id)
    if (not user.is_guest):
        search.UserTrie.update_user_profile_picture(username=(await user.awaitable_attrs.account_data).username,
                                                 profile_picture_id=new_profile_picture_id)
    return {"status": "success", "profile_picture_id": new_profile_picture_id}


@router.delete("/delete_profile_picture", response_model=responses.GenericConfirmation)
async def delete_profile_picture(credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                                 db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db=db, token=credentials.credentials)
    profile_picture_id = user.profile_picture_id
    if profile_picture_id is None:
        raise HTTPException(status_code=409, detail="You don't have profile picture")
    await user_utils.delete_profile_picture_from_s3(profile_picture_id)
    await crud.update_profile_picture_id(db=db, user_id=user.user_id, new_profile_picture_id=None)
    await sio.update_user_profile_picture(user_id=user.user_id, new_picture_id=None)
    if (not user.is_guest):
        search.UserTrie.update_user_profile_picture(username=(await user.awaitable_attrs.account_data).username,
                                                 profile_picture_id=None)
    return {"status": "success"}
