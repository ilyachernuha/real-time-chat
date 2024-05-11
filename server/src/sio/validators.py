import functools
from pydantic import ValidationError


def validate_json(func):
    @functools.wraps(func)
    async def wrapper(sid, data, *args, **kwargs):
        if not isinstance(data, dict):
            return "Error", {"detail": "Data must be in JSON"}
        return await func(sid, data, *args, **kwargs)
    return wrapper


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
