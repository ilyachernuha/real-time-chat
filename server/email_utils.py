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
template_env = Environment(loader=FileSystemLoader("html_templates"))


def send_registration_confirmation(receiver: str, code: str, device_info: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Email confirmation"
        message["From"] = email_address
        message["To"] = receiver
        message_text = template_env.get_template("confirmation_email.html").render(code=code, device=device_info)
        message.attach(MIMEText(message_text, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(email_address, email_password)
            smtp.sendmail(email_address, receiver, message.as_string())

    except smtplib.SMTPException:
        raise HTTPException(status_code=500, detail="Could not send confirmation email")


def send_reset_password_email(receiver: str, application_id: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Reset password"
        message["From"] = email_address
        message["To"] = receiver

        reset_link = base_url + "/reset_password_page/" + application_id
        message_text = template_env.get_template("reset_password_email.html").render(reset_link=reset_link)
        message.attach(MIMEText(message_text, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(email_address, email_password)
            smtp.sendmail(email_address, receiver, message.as_string())

    except smtplib.SMTPException:
        raise HTTPException(status_code=500, detail="Could not send email")


def send_change_email_confirmation(receiver: str, code: str, username: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Email confirmation"
        message["From"] = email_address
        message["To"] = receiver
        message_text = template_env.get_template("reset_email_confirmation.html").render(code=code, username=username)
        message.attach(MIMEText(message_text, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(email_address, email_password)
            smtp.sendmail(email_address, receiver, message.as_string())

    except smtplib.SMTPException:
        raise HTTPException(status_code=500, detail="Could not send confirmation email")


def send_email_change_rollback(receiver: str, application_id: str, username: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Email change notification"
        message["From"] = email_address
        message["To"] = receiver

        rollback_link = base_url + "/rollback_email_change/" + application_id
        message_text = template_env.get_template("email_rollback.html").render(rollback_link=rollback_link,
                                                                               username=username)
        message.attach(MIMEText(message_text, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(email_address, email_password)
            smtp.sendmail(email_address, receiver, message.as_string())

    except smtplib.SMTPException:
        raise HTTPException(status_code=500, detail="Could not send confirmation email")
