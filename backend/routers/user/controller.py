from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_200_OK

from data.core import get_db
from data.schemas import User
from routers.auth.repo_user import fetch_user_by_email
from utils.const import RATE_LIMIT
from routers.user.change_pass.controller import router as change_pass_router
from routers.user.delete_account.controller import router as delete_account_router
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_user

router = APIRouter(prefix="/user", tags=["user"])
router.include_router(change_pass_router)
router.include_router(delete_account_router)

@router.get("/email", status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_user_email(request: Request, user: User = Depends(get_current_user)):
    return {"email": user.email}


@router.get("/authProvider")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_auth_provider(request: Request, user: UserModel = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user = await fetch_user_by_email(user.email, db)
    return {
        "authProvider": user.authServiceProvider,
        "isPasswordSet": user.passwordHash is not None
    }
