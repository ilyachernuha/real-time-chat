from fastapi import HTTPException
from sqlalchemy.orm import Session
from exceptions import FieldSubmitError
import crud
import db_models
from room_themes import RoomTheme
from room_languages import RoomLanguage


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


def get_language_list_from_codes(language_codes: list[str]):
    return [get_language_from_code(code) for code in language_codes]


def check_if_creator_not_guest(user: db_models.User):
    if user.is_guest:
        raise HTTPException(status_code=403, detail="Guest users can't create rooms")


def get_or_create_tags_from_string_list(db: Session, tags_str_list: list[str]):
    tags = []
    for tag_str in tags_str_list:
        tag = crud.get_or_create_tag(db, tag_str)
        tags.append(tag)
    return tags
