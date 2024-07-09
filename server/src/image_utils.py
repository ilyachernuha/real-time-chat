from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException
from io import BytesIO


def validate_image_is_square(image: BytesIO):
    try:
        with Image.open(image) as img:
            if img.width != img.height:
                raise HTTPException(status_code=422, detail="Image is not square")
    except UnidentifiedImageError:
        raise HTTPException(status_code=422, detail="Image can't be processed")


def compress_square_image(original: BytesIO, size: int):
    with Image.open(original) as img:
        output = BytesIO()
        img.resize((size, size)).convert("RGB").save(fp=output, format="jpeg")
        return output


def validate_image(image: BytesIO):
    try:
        with Image.open(image) as img:
            pass
    except UnidentifiedImageError:
        raise HTTPException(status_code=422, detail="Image can't be processed")
