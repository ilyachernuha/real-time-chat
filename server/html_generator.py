from jinja2 import Environment, FileSystemLoader
import os
from dotenv import load_dotenv


load_dotenv()

template_env = Environment(loader=FileSystemLoader("html_templates"))
base_url = os.getenv("BASE_URL")


def generate_email_confirmation(code: str, device_info: str):
    return template_env.get_template("confirmation_email.html").render(code=code, device=device_info)


def generate_reset_password_email(application_id: str):
    reset_link = base_url + "/reset_password_page/" + application_id
    return template_env.get_template("reset_password_email.html").render(reset_link=reset_link)


def generate_reset_password_page(application_id: str):
    url = base_url + "/finish_reset_password"
    template_env.get_template("reset_password_page.html").render(url=url, application_id=application_id)


def generate_change_email_confirmation(code: str, username: str):
    return template_env.get_template("reset_email_confirmation.html").render(code=code, username=username)


def generate_change_email_rollback(application_id: str, username: str):
    rollback_link = base_url + "/rollback_email_change/" + application_id
    return template_env.get_template("email_rollback.html").render(rollback_link=rollback_link, username=username)
