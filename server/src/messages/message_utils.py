import uuid
from .. import db_models


def message_to_dict(message: db_models.Message, include_message_id: bool = False, include_room_id: bool = False):
    message_dict = {
        "user_id": message.user_id,
        "reply_to": message.reply_message_id,
        "text": message.text,
        "created_at": message.timestamp.timestamp(),
        "updated_at": message.update_time.timestamp() if message.update_time is not None else None
    }
    if include_message_id:
        message_dict["message_id"] = message.message_id
    if include_room_id:
        message_dict["room_id"] = message.room_id
    return message_dict
