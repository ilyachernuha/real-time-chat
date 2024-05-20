import functools
from pydantic import ValidationError, BaseModel
from typing import Type, Callable
from .sio import sio


def validate_model(model: Type[BaseModel]):
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(sid: str, data: dict, *args, **kwargs):
            if not isinstance(data, dict):
                return "Error", {"detail": "Data must be in JSON"}
            try:
                validated_data = model(**data)
                return await func(sid, validated_data, *args, **kwargs)
            except ValidationError:
                return "Error", {"detail": "Validation failed"}
        return wrapper
    return decorator


def validate_user_in_room(func: Callable):
    @functools.wraps(func)
    async def wrapper(sid: str, data: Type[BaseModel], *args, **kwargs):
        if data.room_id not in sio.rooms(sid):
            return "Error", {"detail": "You're not member of this room"}
        return await func(sid, data, *args, **kwargs)
    return wrapper
