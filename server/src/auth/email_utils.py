import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import HTTPException
from .. import html_generator, env


async def send_email(receiver: str, subject: str, text: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = env.EMAIL_ADDRESS
        message["To"] = receiver
        message_text = text
        message.attach(MIMEText(message_text, "html"))

        await aiosmtplib.send(message,
                              hostname=env.SMTP_HOST,
                              port=env.SMTP_PORT,
                              username=env.EMAIL_ADDRESS,
                              password=env.EMAIL_PASSWORD,
                              start_tls=True)

    except aiosmtplib.SMTPException:
        raise HTTPException(status_code=500, detail="Could not send confirmation email")


async def send_registration_confirmation(receiver: str, code: str, device_info: str):
    message_text = await html_generator.generate_register_confirmation_email(code=code, device_info=device_info)
    await send_email(receiver=receiver, subject="Email confirmation", text=message_text)


async def send_reset_password_email(receiver: str, application_id: str):
    message_text = await html_generator.generate_reset_password_email(application_id)
    await send_email(receiver=receiver, subject="Reset password", text=message_text)


async def send_change_email_confirmation(receiver: str, code: str, username: str):
    message_text = await html_generator.generate_change_email_confirmation(code=code, username=username)
    await send_email(receiver=receiver, subject="Email confirmation", text=message_text)


async def send_email_change_rollback(receiver: str, application_id: str, username: str):
    message_text = await html_generator.generate_change_email_rollback(application_id=application_id, username=username)
    await send_email(receiver=receiver, subject="Email change notification", text=message_text)
