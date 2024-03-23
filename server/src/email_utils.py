import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from fastapi import HTTPException
import os
from dotenv import load_dotenv
import html_generator


load_dotenv()

email_address = os.getenv("EMAIL")
email_password = os.getenv("EMAIL_PASSWORD")
base_url = os.getenv("BASE_URL")
smtp_host = os.getenv("SMTP_HOST")
smtp_port = int(os.getenv("SMTP_PORT"))
template_env = Environment(loader=FileSystemLoader("html_templates"))


async def send_email(receiver: str, subject: str, text: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = email_address
        message["To"] = receiver
        message_text = text
        message.attach(MIMEText(message_text, "html"))

        await aiosmtplib.send(message,
                              hostname=smtp_host,
                              port=smtp_port,
                              username=email_address,
                              password=email_password,
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
