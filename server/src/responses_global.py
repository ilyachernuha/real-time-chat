from pydantic import BaseModel


class GenericConfirmation(BaseModel):
    status: str
