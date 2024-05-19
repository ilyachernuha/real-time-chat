import functools
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from ..exceptions import FieldSubmitError


def validate_model(model):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(sid, data, *args, **kwargs):
            if not isinstance(data, dict):
                return "Error", {"detail": "Data must be in JSON"}
            try:
                validated_data = model(**data)
                return await func(sid, validated_data, *args, **kwargs)
            except ValidationError:
                return "Error", {"detail": "Validation failed"}
        return wrapper
    return decorator


def handle_field_submission_error(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except FieldSubmitError as e:
            return "Error", {"detail": e.detail, "field": e.field}
    return wrapper


def handle_sqlalchemy_error(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except SQLAlchemyError:
            return "Error", {"detail": "Unexpected database error"}
    return wrapper
