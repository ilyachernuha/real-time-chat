from fastapi import UploadFile, File, Form, HTTPException
from io import BytesIO
from .attachment import AttachmentType, Attachment
from . import image_utils
from starlette.concurrency import run_in_threadpool
import filetype


async def verify_profile_or_room_picture_size(form = Form, image: UploadFile = File(...)):
    if not image.filename.endswith(".jpeg"):
        raise HTTPException(status_code=422, detail="File must be jpeg")
    if image.size > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
    return BytesIO(await image.read())


async def verify_file(file: UploadFile):
    if file.size > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
    return Attachment(type=AttachmentType.file, file=BytesIO(await file.read()), filename=file.filename)


async def verify_image(image: UploadFile):
    if not image.filename.endswith(".jpeg"):
        raise HTTPException(status_code=422, detail="Image must be jpeg")
    if image.size > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
    image_bytes = BytesIO(await image.read())
    await run_in_threadpool(image_utils.validate_image(image_bytes))
    return Attachment(type=AttachmentType.image, file=image_bytes)


async def verify_video(video: UploadFile):
    if not video.filename.endswith(".mp4"):
        raise HTTPException(status_code=422, detail="Video must be mp4")
    if video.size > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
    video_bytes = BytesIO(await video.read())
    if not filetype.is_video(video_bytes):
        raise HTTPException(status_code=422, detail="Video can't be processed")
    return Attachment(type=AttachmentType.video, file=video_bytes)


async def verify_audio(audio: UploadFile, voice_message: bool = False):
    if not audio.filename.endswith(".mp3"):
        raise HTTPException(status_code=422, detail="Audio must be mp3")
    if audio.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
    audio_bytes = BytesIO(await audio.read())
    if not filetype.is_audio(audio_bytes):
        raise HTTPException(status_code=422, detail="Audio can't be processed")
    return Attachment(type=(AttachmentType.voice_message if voice_message else AttachmentType.audio), file=audio_bytes)


async def process_and_verify_attachment_based_on_type(attachment: UploadFile):
    return await {
        "image/jpeg": verify_image,
        "video/mp4": verify_video,
        "audio/mpeg": verify_audio
    }.get(attachment.content_type, verify_file)(attachment)


async def get_attachments(attachments: list[UploadFile] = File(default=None, max_length=10)):
    return [
        await process_and_verify_attachment_based_on_type(attachment) for attachment in attachments
    ] if attachments else None


async def get_voice(voice: UploadFile = File(default=None)):
    return await verify_audio(audio=voice, voice_message=True) if voice else None
