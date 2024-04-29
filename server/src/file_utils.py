from fastapi import UploadFile, File, Form, HTTPException
from io import BytesIO


async def verify_profile_or_room_picture_size(form: str = Form, image: UploadFile = File(...)):
    if not image.filename.endswith(".jpeg"):
        raise HTTPException(status_code=422, detail="File must be jpeg")
    if image.size > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
    return BytesIO(await image.read())
