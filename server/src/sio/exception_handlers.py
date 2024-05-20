import functools
from typing import Callable
from sqlalchemy.exc import SQLAlchemyError
from ..exceptions import FieldSubmitError


def handle_field_submission_error(func: Callable):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except FieldSubmitError as e:
            return "Error", {"detail": e.detail, "field": e.field}
    return wrapper


def handle_sqlalchemy_error(func: Callable):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except SQLAlchemyError:
            return "Error", {"detail": "Unexpected database error"}
    return wrapper
