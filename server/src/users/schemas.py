from pydantic import BaseModel, UUID4


class UpdateName(BaseModel):
    new_name: str
