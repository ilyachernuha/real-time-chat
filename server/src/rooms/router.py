from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from . import crud
from . import schemas
from ..database import get_db
from ..auth import auth_utils
from . import room_utils


router = APIRouter(prefix="/rooms", tags=["rooms"])
security_bearer = HTTPBearer()


@router.post("/create_room", response_model=schemas.RoomCreated)
async def create_room(body: schemas.RoomCreation, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db, credentials.credentials)
    room_utils.check_if_creator_not_guest(user)
    room_utils.validate_title(body.title)
    room_utils.validate_description(body.description)
    theme = room_utils.get_theme_from_string(body.theme)
    languages = room_utils.get_language_list_from_codes(body.languages)
    room_utils.validate_tag_names(body.tags)
    tags = await room_utils.get_or_create_tags_from_string_set(db, body.tags)
    room = await crud.create_room(db=db, owner=user, title=body.title, description=body.description, theme=theme,
                                  languages=languages, tags=tags)
    await crud.add_user_to_room(db=db, room_id=room.room_id, user=user, make_admin=True)
    if body.users_to_add is not None:
        add_data = await room_utils.get_and_validate_list_of_users_to_add(db=db, room=room, add_list=body.users_to_add)
        for user, make_admin in add_data:
            await crud.add_user_to_room(db=db, room_id=room.room_id, user=user, make_admin=make_admin)
    return {"status": "success", "room_id": room.room_id}


@router.patch("/update_room/{room_id}", response_model=schemas.GenericConfirmation)
async def update_room(room_id: uuid.UUID, body: schemas.RoomUpdate,
                      credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await crud.get_room_by_id(db, room_id)
    room_utils.check_if_room_exists(room)
    await room_utils.check_if_user_is_admin(db=db, user_id=user_id, room=room)
    room_utils.validate_room_update_data(body)
    await room_utils.patch_room(db=db, room=room, update=body)
    return {"status": "success"}


@router.get("/room_info/{room_id}", response_model=schemas.RoomInfo)
async def get_room_info(room_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                        db: AsyncSession = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    room = await crud.get_room_by_id(db, room_id)
    room_utils.check_if_room_exists(room)
    return {
        "title": room.title,
        "description": room.description,
        "theme": room.theme.value,
        "languages": room_utils.convert_room_languages_to_str_list(room.languages),
        "tags": await room_utils.convert_room_tags_to_str_list(list(await room.awaitable_attrs.tags))
    }


@router.delete("/delete_room/{room_id}", response_model=schemas.GenericConfirmation)
async def delete_room(room_id: uuid.UUID, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await crud.get_room_by_id(db, room_id)
    room_utils.check_if_room_exists(room)
    room_utils.check_if_user_is_owner(user_id, room)
    await crud.delete_room(db, room_id)
    return {"status": "success"}


@router.post("/join_room", response_model=schemas.GenericConfirmation)
async def join_room(body: schemas.JoinRoom, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                    db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db, credentials.credentials)
    room = await crud.get_room_by_id(db, body.room_id)
    room_utils.check_if_room_exists(room)
    await room_utils.check_if_user_can_join_room(db, user.user_id, room)
    await crud.add_user_to_room(db=db, room_id=room.room_id, user=user)
    return {"status": "success"}


@router.post("/leave_room", response_model=schemas.GenericConfirmation)
async def leave_room(body: schemas.LeaveRoom, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await crud.get_room_by_id(db, body.room_id)
    room_utils.check_if_room_exists(room)
    await room_utils.check_if_user_can_leave_room(db, user_id, room)
    await crud.remove_user_from_room(db=db, room_id=room.room_id, user_id=user_id)
    return {"status": "success"}


@router.post("/add_users_to_room", response_model=schemas.GenericConfirmation)
async def add_users_to_room(body: schemas.AddUsers,
                            credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                            db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    room = await crud.get_room_by_id(db, body.room_id)
    room_utils.check_if_room_exists(room)
    add_admins = any(user.make_admin for user in body.users)
    await room_utils.check_if_user_can_add_users_to_room(db=db, user_id=user_id, room=room, add_admins=add_admins)
    add_data = await room_utils.get_and_validate_list_of_users_to_add(db=db, room=room, add_list=body.users)
    for user, make_admin in add_data:
        await crud.add_user_to_room(db=db, room_id=room.room_id, user=user, make_admin=make_admin)
    return {"status": "success"}


@router.get("/find_rooms", response_model=schemas.RoomList)
async def find_rooms(search: str | None = None, themes: list[str] = Query(default=None),
                     tags: list[str] = Query(default=None), languages: list[str] = Query(default=None),
                     credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
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
                                    tags=tags)
    rooms_data = [{"room_id": room.room_id, "title": room.title} for room in rooms]
    return {"rooms": rooms_data}


@router.get("/my_rooms", response_model=schemas.RoomList)
async def my_rooms(credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                   db: AsyncSession = Depends(get_db)):
    user = await auth_utils.get_user_by_access_token(db, credentials.credentials)
    rooms = [
        {
            "room_id": room.room_id,
            "title": (await room.awaitable_attrs.room).title
        }
        for room in await user.awaitable_attrs.rooms
    ]
    return {"rooms": rooms}


@router.get("/find_tags", response_model=schemas.TagList)
async def find_tags(search: str, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                    db: AsyncSession = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    room_utils.validate_tag_name(search)
    tags = [tag.tag for tag in await crud.search_tag(db=db, tag_name=search, limit=None)]
    return {"tags": tags}
