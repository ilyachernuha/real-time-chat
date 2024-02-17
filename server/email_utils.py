import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from fastapi import HTTPException
import os
from dotenv import load_dotenv


load_dotenv()

email_address = os.getenv("EMAIL")
email_password = os.getenv("EMAIL_PASSWORD")
base_url = os.getenv("BASE_URL")
smtp_host = os.getenv("SMTP_HOST")
smtp_port = int(os.getenv("SMTP_PORT"))
template_env = Environment(loader=FileSystemLoader("html_templates"))


def send_email(receiver: str, subject: str, text: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = email_address
        message["To"] = receiver
        message_text = text
        message.attach(MIMEText(message_text, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as smtp:
            smtp.starttls()
            smtp.login(email_address, email_password)
            smtp.sendmail(email_address, receiver, message.as_string())

    except smtplib.SMTPException:
        raise HTTPException(status_code=500, detail="Could not send confirmation email")


def send_registration_confirmation(receiver: str, code: str, device_info: str):
    message_text = template_env.get_template("confirmation_email.html").render(code=code, device=device_info)
    send_email(receiver=receiver, subject="Email confirmation", text=message_text)


def send_reset_password_email(receiver: str, application_id: str):
    reset_link = base_url + "/reset_password_page/" + application_id
    message_text = template_env.get_template("reset_password_email.html").render(reset_link=reset_link)
    send_email(receiver=receiver, subject="Reset password", text=message_text)


def send_change_email_confirmation(receiver: str, code: str, username: str):
    message_text = template_env.get_template("reset_email_confirmation.html").render(code=code, username=username)
    send_email(receiver=receiver, subject="Email confirmation", text=message_text)


def send_email_change_rollback(receiver: str, application_id: str, username: str):
    rollback_link = base_url + "/rollback_email_change/" + application_id
    message_text = template_env.get_template("email_rollback.html").render(rollback_link=rollback_link,
                                                                           username=username)
    send_email(receiver=receiver, subject="Email change notification", text=message_text)
