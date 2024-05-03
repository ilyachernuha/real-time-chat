import re
import uuid
import asyncio
from ..exceptions import FieldSubmitError
from ..s3 import S3


def validate_name(name: str):
    if not (1 <= len(name) <= 16):
        raise FieldSubmitError(status_code=400, detail="Name must be 1 to 16 characters long", field="name")

    if name.isspace():
        raise FieldSubmitError(status_code=400, detail="Name cannot consist of whitespace only", field="name")

    if re.match(r"[\x00-\x1F\x7F]", name):
        raise FieldSubmitError(status_code=400, detail="Name cannot contain control or non-displayable characters",
                               field="name")


def validate_username(username: str):
    if not (2 <= len(username) <= 24):
        raise FieldSubmitError(status_code=400, detail="Username must be 2 to 24 characters long", field="username")

    if not re.match(r"^[a-zA-Z0-9]+$", username):
        raise FieldSubmitError(status_code=400, detail="Username can have only English letters and numbers",
                               field="username")


def validate_password(password: str):
    if not (8 <= len(password) <= 32):
        raise FieldSubmitError(status_code=400, detail="Password must be 8 to 32 characters long", field="password")

    if not re.match(r"^[!-~]+$", password):
        raise FieldSubmitError(status_code=400, detail="Password can have only ASCII symbols excluding whitespace",
                               field="password")


async def delete_profile_picture_from_s3(profile_picture_id: uuid.UUID):
    tasks = [asyncio.create_task(S3.delete_file(filename)) for filename in (
        f"profile-pictures/full-size/{profile_picture_id}.jpeg",
        f"profile-pictures/100p/{profile_picture_id}.jpeg"
    )]
    await asyncio.gather(*tasks)
