from fastapi import HTTPException
from sqlalchemy.orm import Session
from exceptions import FieldSubmitError
import uuid
import crud
import db_models
from room_themes import RoomTheme
from room_languages import RoomLanguage
import re
from schemas import RoomUpdate, UserToAdd


def check_if_room_exists(room: db_models.Room):
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")


def check_if_creator_not_guest(user: db_models.User):
    if user.is_guest:
        raise HTTPException(status_code=403, detail="Guest users can't create rooms")


def validate_title(title: str):
    if not (1 <= len(title) <= 16):
        raise FieldSubmitError(status_code=400, detail="Title must be 1 to 16 characters long", field="title")

    if title.isspace():
        raise FieldSubmitError(status_code=400, detail="Title cannot consist of whitespace only", field="title")

    if re.match(r"[\x00-\x1F\x7F]", title):
        raise FieldSubmitError(status_code=400, detail="Title cannot contain control or non-displayable characters",
                               field="title")


def validate_description(description: str | None):
    if description is not None and len(description) > 200:
        raise FieldSubmitError(status_code=400, detail="Description cannot be more than 200 characters long",
                               field="description")


def validate_tag_name(tag_str: str):
    if not (1 <= len(tag_str) <= 16):
        raise FieldSubmitError(status_code=400, detail="Tag must be 1 to 16 characters long", field="tags")

    if not tag_str.isalnum():
        raise FieldSubmitError(status_code=400, detail="Tags can only contain alphanumeric characters", field="tags")


def validate_tag_names(tag_str_set: set[str]):
    for tag_str in tag_str_set:
        validate_tag_name(tag_str)


def get_theme_from_string(theme_str: str):
    try:
        return RoomTheme(theme_str)
    except ValueError:
        raise FieldSubmitError(status_code=400, detail="Invalid theme", field="theme")


def get_language_from_code(language_code: str):
    try:
        return RoomLanguage(language_code)
    except ValueError:
        raise FieldSubmitError(status_code=400, detail=f"Invalid language code: {language_code}", field="languages")


def get_language_list_from_codes(language_codes: set[str]):
    return [get_language_from_code(code) for code in language_codes]


def get_or_create_tags_from_string_set(db: Session, tag_str_set: set[str]):
    return [crud.get_or_create_tag(db, tag_str) for tag_str in tag_str_set]


def validate_room_update_data(update: RoomUpdate):
    if update.title is not None:
        validate_title(update.title)
    if update.description is not None:
        validate_description(update.description)
    if update.theme is not None:
        get_theme_from_string(update.theme)
    if update.languages is not None:
        get_language_list_from_codes(update.languages)
    if update.tags_to_add is not None:
        validate_tag_names(update.tags_to_add)
    if update.tags_to_remove is not None:
        validate_tag_names(update.tags_to_remove)


def patch_room(db: Session, room: db_models.Room, update: RoomUpdate):
    if update.title is not None:
        crud.update_room_title(db, room.room_id, update.title)
    if update.description is not None:
        description = update.description if update.description != "" else None
        crud.update_room_description(db, room.room_id, description)
    if update.theme is not None:
        crud.update_room_theme(db, room.room_id, get_theme_from_string(update.theme))
    if update.languages is not None:
        crud.update_room_languages(db, room.room_id, get_language_list_from_codes(update.languages))
    if update.tags_to_add is not None:
        crud.add_tags_to_room(db, room.room_id, get_or_create_tags_from_string_set(db, update.tags_to_add))
    if update.tags_to_remove is not None:
        crud.remove_tags_from_room(db, room.room_id, list(update.tags_to_remove))


def convert_room_languages_to_str_list(languages: list[RoomLanguage]):
    return [language.value for language in languages]


def convert_room_tags_to_str_list(tags: list[db_models.Tag]):
    return [tag.tag.tag for tag in tags]


def check_if_user_is_owner(user_id: uuid.UUID, room: db_models.Room):
    if room.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only owner allowed to perform this action")


def check_if_user_is_admin(db: Session, user_id: uuid.UUID, room: db_models.Room):
    user_room_association = crud.get_user_room_association(db=db, room_id=room.room_id, user_id=user_id)
    if user_room_association is None or not user_room_association.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can perform this action")


def check_if_user_can_join_room(db: Session, user_id: uuid.UUID, room: db_models.Room):
    if crud.get_user_room_association(db, room_id=room.room_id, user_id=user_id):
        raise HTTPException(status_code=409, detail="You already joined this room")
    # implement closed room logic
    # implement user banned logic


def check_if_user_can_leave_room(db: Session, user_id: uuid.UUID, room: db_models.Room):
    if room.owner_id == user_id:
        raise HTTPException(status_code=403, detail="Owner cannot leave the room")
    if crud.get_user_room_association(db, room_id=room.room_id, user_id=user_id) is None:
        raise HTTPException(status_code=409, detail="You are not a member of this room")


def check_if_user_can_add_users_to_room(db: Session, user_id: uuid.UUID, room: db_models.Room, add_admins: bool):
    if add_admins:
        check_if_user_is_owner(user_id, room)
    else:
        check_if_user_is_admin(db, user_id, room)


def get_and_validate_list_of_users_to_add(db: Session, room: db_models.Room, add_list: list[UserToAdd]):
    add_data = []
    for user_data in add_list:
        user_id = user_data.user_id
        user = crud.get_user_by_id(db, user_id)
        if user is None:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        if user_data.make_admin and user.is_guest:
            raise HTTPException(status_code=403, detail="Guest users cannot be admins")
        if crud.get_user_room_association(db, room_id=room.room_id, user_id=user_id):
            raise HTTPException(status_code=409, detail=f"User {user_id} already in room")
        add_data.append((user, user_data.make_admin))
    return add_data
