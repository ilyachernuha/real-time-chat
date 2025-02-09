from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool
import asyncio
from io import BytesIO
import uuid
from . import crud, schemas, room_utils, responses
from ..database import get_db
from ..auth import auth_utils
from .. import file_utils, image_utils
from ..s3 import S3
from ..security import security_bearer
from ..sio import external as sio


router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("/create_room", response_model=responses.RoomCreated)
async def create_room(body: schemas.RoomCreation, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    creator = await auth_utils.get_user_by_access_token(db, credentials.credentials)
    session_id = auth_utils.extract_session_id_from_access_token(credentials.credentials)
    room_utils.check_if_creator_not_guest(creator)
    room_utils.validate_title(body.title)
    room_utils.validate_description(body.description)
    theme = room_utils.get_theme_from_string(body.theme)
    languages = room_utils.get_language_list_from_codes(body.languages)
    room_utils.validate_tag_names(body.tags)
    tags = await room_utils.get_or_create_tags_from_string_set(db, body.tags)
    room = await crud.create_room(db=db, owner=creator, title=body.title, description=body.description, theme=theme,
                                  languages=languages, tags=tags, public=body.make_public)
    await crud.add_user_to_room(db=db, room_id=room.room_id, user=creator, make_admin=True)
    if body.users_to_add is not None:
        add_data = await room_utils.get_and_validate_list_of_users_to_add(db=db, room=room, add_list=body.users_to_add)
        for user, make_admin in add_data:
            await crud.add_user_to_room(db=db, room_id=room.room_id, user=user, make_admin=make_admin)
            await sio.add_user_to_room(user_id=user.user_id, room_id=room.room_id)
    await sio.add_user_to_room(user_id=creator.user_id, room_id=room.room_id, skip_session=session_id)
    return {"status": "success", "room_id": room.room_id}


@router.patch("/update_room/{room_id}", response_model=responses.GenericConfirmation)
async def update_room(room_id: uuid.UUID, body: schemas.RoomUpdate,
                      credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=room_id)
    await room_utils.check_if_user_is_admin(db=db, user_id=user_id, room=room)
    room_utils.validate_room_update_data(body)
    await room_utils.patch_room(db=db, room=room, update=body)
    return {"status": "success"}


@router.put("/set_room_picture/{room_id}", response_model=responses.RoomPictureUpdate)
async def set_room_picture(room_id: uuid.UUID,
                           image: BytesIO = Depends(file_utils.verify_profile_or_room_picture_size),
                           credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                           db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=room_id)
    await room_utils.check_if_user_is_admin(db=db, user_id=user_id, room=room)
    old_room_picture_id = room.room_picture_id
    await run_in_threadpool(lambda: image_utils.validate_image_is_square(image))
    image_100p = await run_in_threadpool(lambda: image_utils.compress_square_image(original=image, size=100))
    new_room_picture_id = uuid.uuid4()
    tasks = [
        asyncio.create_task(S3.upload_file(file=_["file"], filename=_["name"])) for _ in (
            {"file": image, "name": f"room-pictures/full-size/{new_room_picture_id}.jpeg"},
            {"file": image_100p, "name": f"room-pictures/100p/{new_room_picture_id}.jpeg"}
        )
    ]
    await asyncio.gather(*tasks)
    await crud.update_room_picture_id(db=db, room_id=room_id, new_room_picture_id=new_room_picture_id)
    if old_room_picture_id is not None:
        await room_utils.delete_room_picture_from_s3(old_room_picture_id)
    return {"status": "success", "room_picture_id": new_room_picture_id}


@router.delete("/delete_room_picture/{room_id}", response_model=responses.GenericConfirmation)
async def delete_room_picture(room_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                              db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=room_id)
    await room_utils.check_if_user_is_admin(db=db, user_id=user_id, room=room)
    room_picture_id = room.room_picture_id
    if room_picture_id is None:
        raise HTTPException(status_code=409, detail="This room doesn't have a picture")
    await room_utils.delete_room_picture_from_s3(room_picture_id)
    await crud.update_room_picture_id(db=db, room_id=room_id, new_room_picture_id=None)
    return {"status": "success"}


@router.get("/room_info/{room_id}", response_model=responses.RoomInfo)
async def get_room_info(room_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                        db: AsyncSession = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=room_id)
    return {
        "title": room.title,
        "description": room.description,
        "theme": room.theme.value,
        "languages": room_utils.convert_room_languages_to_str_list(room.languages),
        "tags": await room_utils.convert_room_tags_to_str_list(list(await room.awaitable_attrs.tags)),
        "room_picture_id": room.room_picture_id,
        "is_public": room.is_public
    }


@router.delete("/delete_room/{room_id}", response_model=responses.GenericConfirmation)
async def delete_room(room_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=room_id)
    room_utils.check_if_user_is_owner(user_id, room)
    member_ids = [user.user_id for user in await room.awaitable_attrs.users]
    if room.room_picture_id is not None:
        await room_utils.delete_room_picture_from_s3(room.room_picture_id)
    await crud.delete_room(db, room_id)
    await sio.close_room(room_id=room_id, member_ids=member_ids)
    return {"status": "success"}


@router.post("/join_room", response_model=responses.GenericConfirmation)
async def join_room(body: schemas.JoinRoom, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                    db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db, credentials.credentials)
    session_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=body.room_id)
    await room_utils.check_if_user_can_join_room(db, user.user_id, room)
    await crud.add_user_to_room(db=db, room_id=room.room_id, user=user)
    await sio.add_user_to_room(user_id=user.user_id, room_id=room.room_id, skip_session=session_id)
    return {"status": "success"}


@router.post("/leave_room", response_model=responses.GenericConfirmation)
async def leave_room(body: schemas.LeaveRoom, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    session_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=body.room_id)
    await room_utils.check_if_user_can_leave_room(db, user_id, room)
    await crud.remove_user_from_room(db=db, room_id=room.room_id, user_id=user_id)
    await sio.remove_user_from_room(user_id=user_id, room_id=room.room_id, skip_session=session_id)
    return {"status": "success"}


@router.post("/add_users_to_room", response_model=responses.GenericConfirmation)
async def add_users_to_room(body: schemas.AddUsers,
                            credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                            db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=body.room_id)
    add_admins = any(user.make_admin for user in body.users)
    await room_utils.check_if_user_can_add_users_to_room(db=db, user_id=user_id, room=room, add_admins=add_admins)
    add_data = await room_utils.get_and_validate_list_of_users_to_add(db=db, room=room, add_list=body.users)
    for user, make_admin in add_data:
        await crud.add_user_to_room(db=db, room_id=room.room_id, user=user, make_admin=make_admin)
        await sio.add_user_to_room(user_id=user.user_id, room_id=room.room_id)
    return {"status": "success"}


@router.post("/ban_users", response_model=responses.GenericConfirmation)
async def ban_user(body: schemas.BanUsers,
                   credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                   db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=body.room_id)
    await room_utils.check_if_user_is_admin(db=db, user_id=user_id, room=room)
    users = await room_utils.get_and_validate_list_of_users_to_ban(db=db, room=room, ban_list=body.users)
    for user in users:
        if await room_utils.user_is_banned(db=db, room_id= body.room_id, user_id=user.user_id):
            continue
        await crud.remove_user_from_room(db=db, room_id=body.room_id, user_id=user.user_id)
        await sio.remove_user_from_room(user_id=user.user_id, room_id=body.room_id)
        await crud.add_user_to_banned_in_room(db=db, room_id=body.room_id, user=user)
    return {"status": "success"}


@router.post("/unban_users", response_model=responses.GenericConfirmation)
async def unban_user(body: schemas.BanUsers,
                     credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=body.room_id)
    await room_utils.check_if_user_is_admin(db=db, user_id=user_id, room=room)
    for user_id in body.users:
        user = await crud.get_user_by_id(db=db, user_id=user_id)
        if user is None:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        await crud.remove_user_from_banned_in_room(db=db, room_id=body.room_id, user_id=user_id)
    return {"status": "success"}


@router.get("/find_rooms", response_model=responses.RoomList)
async def find_rooms(search: str | None = None, themes: list[str] = Query(default=None),
                     tags: list[str] = Query(default=None), languages: list[str] = Query(default=None),
                     public: bool | None = None, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: AsyncSession = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    if search is None and themes is None and tags is None and languages is None:
        raise HTTPException(status_code=400, detail="Empty search and filters not allowed")
    if search is not None:
        room_utils.validate_title(search)
    if tags is not None:
        room_utils.validate_tag_names(set(tags))
    rooms = await crud.filter_rooms(db=db, title=search,
                                    themes=([room_utils.get_theme_from_string(theme) for theme in themes]
                                            if themes else None),
                                    languages=(room_utils.get_language_list_from_codes(set(languages))
                                               if languages else None),
                                    tags=tags, public=public)
    rooms_data = [
        {
            "room_id": room.room_id,
            "title": room.title,
            "room_picture_id": room.room_picture_id
        }
        for room in rooms
    ]
    return {"rooms": rooms_data}


@router.get("/my_rooms", response_model=responses.RoomList)
async def my_rooms(credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                   db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db, credentials.credentials)
    rooms = [
        {
            "room_id": room.room_id,
            "title": (await room.awaitable_attrs.room).title,
            "room_picture_id": (await room.awaitable_attrs.room).room_picture_id
        }
        for room in await user.awaitable_attrs.rooms
    ]
    return {"rooms": rooms}


@router.get("/find_tags", response_model=responses.TagList)
async def find_tags(search: str, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                    db: AsyncSession = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    room_utils.validate_tag_name(search)
    tags = [tag.tag for tag in await crud.search_tag(db=db, tag_name=search, limit=None)]
    return {"tags": tags}


@router.get("/room_members/{room_id}", response_model=responses.RoomMemberList)
async def room_members(room_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                       db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await room_utils.get_room_if_exists(db=db, room_id=room_id)
    await room_utils.check_if_user_is_room_member(db=db, user_id=user_id, room_id=room_id)
    members_data = []
    for user_association in await room.awaitable_attrs.users:
        user = await user_association.awaitable_attrs.user
        members_data.append(
            {
                "user_id": user_association.user_id,
                "username": (await user.awaitable_attrs.account_data).username if not user.is_guest else None,
                "name": user.name,
                "profile_picture_id": user.profile_picture_id,
                "guest": user.is_guest,
                "admin": user_association.is_admin
            }
        )
    return {"members": members_data}
