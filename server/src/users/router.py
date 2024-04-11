from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from . import crud
from . import schemas
from ..database import get_db
from ..auth import auth_utils
from . import user_utils


router = APIRouter(prefix="/users", tags=["users"])
security_bearer = HTTPBearer()


@router.get("/find_users", response_model=schemas.UserList)
async def find_users(search: str, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                     db: AsyncSession = Depends(get_db)):
    auth_utils.validate_access_token(credentials.credentials)
    user_utils.validate_username(search)
    users = await crud.search_users(db=db, username=search, limit=None)
    users_data = [
        {
            "user_id": user.user_id,
            "username": (await user.awaitable_attrs.account_data).username,
            "name": user.name
        }
        for user in users
    ]
    return {"users": users_data}


@router.put("/change_name", response_model=schemas.NameUpdate)
async def change_name(body: schemas.UpdateName, credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
                      db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.extract_user_id_from_access_token(credentials.credentials)
    user_utils.validate_name(body.new_name)
    user = await crud.update_user_name(db, user_id, body.new_name)
    return {"status": "success", "new_name": user.name}
