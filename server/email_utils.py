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
template_env = Environment(loader=FileSystemLoader("email_templates"))


def send_email_confirmation(receiver: str, code: str, device_info: str):
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Email confirmation"
        message["From"] = email_address
        message["To"] = receiver
        message_text = template_env.get_template("confirmation.html").render(code=code, device=device_info)
        message.attach(MIMEText(message_text, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(email_address, email_password)
            smtp.sendmail(email_address, receiver, message.as_string())

    except smtplib.SMTPException:
        raise HTTPException(status_code=500, detail="Could not send confirmation email")
