from fastapi import HTTPException
from sqlalchemy.orm import Session
from exceptions import FieldSubmitError
import crud
import db_models
from room_themes import RoomTheme
from room_languages import RoomLanguage
import re


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
    validate_tag_names(tag_str_set)
    tags = []
    for tag_str in tag_str_set:
        tag = crud.get_or_create_tag(db, tag_str)
        tags.append(tag)
    return tags
