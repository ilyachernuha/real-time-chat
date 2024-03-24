import time

from jinja2 import Environment, FileSystemLoader
import os
from dotenv import load_dotenv


load_dotenv()

template_env = Environment(loader=FileSystemLoader("html_templates"), enable_async=True)
base_url = os.getenv("BASE_URL")


def preload_templates():
    for template in template_env.list_templates():
        template_env.get_template(template)


async def generate_register_confirmation_email(code: str, device_info: str):
    return await template_env.get_template("register_confirmation_email.html").render_async(code=code,
                                                                                            device=device_info)


async def generate_reset_password_email(application_id: str):
    reset_link = base_url + "/reset_password_page/" + application_id
    return await template_env.get_template("reset_password_email.html").render_async(reset_link=reset_link)


async def generate_reset_password_page(application_id: str):
    url = base_url + "/finish_reset_password"
    return await template_env.get_template("reset_password_page.html").render_async(url=url,
                                                                                    application_id=application_id)


async def generate_change_email_confirmation(code: str, username: str):
    return await template_env.get_template("change_email_confirmation.html").render_async(code=code, username=username)


async def generate_change_email_rollback(application_id: str, username: str):
    rollback_link = base_url + "/rollback_email_change/" + application_id
    return await template_env.get_template("email_rollback.html").render_async(rollback_link=rollback_link,
                                                                               username=username)
