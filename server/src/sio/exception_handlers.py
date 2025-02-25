from socketio.exceptions import ConnectionRefusedError
import functools
from typing import Callable
from sqlalchemy.exc import SQLAlchemyError
from ..exceptions import (AccessTokenValidationError, BearerTokenExtractionError, MessageValidationError,
                          FieldSubmitError, PrivateMessageDeliveryError)


def handle_exceptions(func: Callable):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except SQLAlchemyError:
            return "Error", {"detail": "Unexpected database error"}
        except FieldSubmitError as e:
            return "Error", {"detail": e.detail, "field": e.field}
        except MessageValidationError as e:
            return "Error", {"detail": str(e)}
        except (AccessTokenValidationError, BearerTokenExtractionError) as e:
            raise ConnectionRefusedError(str(e))
        except PrivateMessageDeliveryError:
            return "Error", {"detail": "Recipient not found or unable to deliver message"}
    return wrapper
