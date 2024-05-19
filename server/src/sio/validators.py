import functools
import uuid
from pydantic import ValidationError
from .sio import sio


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


def validate_user_in_room(func):
    @functools.wraps(func)
    async def wrapper(sid, data, *args, **kwargs):
        if uuid.UUID(data["room_id"]) not in sio.rooms(sid):
            return "Error", {"detail": "You're not member of this room"}
        return await func(sid, data, *args, **kwargs)
    return wrapper
