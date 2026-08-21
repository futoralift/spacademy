from datetime import timedelta

from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from routers.auth.repo_user import set_user_password
from utils.security.hashing import get_password_hash
from utils.security.tokens import create_access_token, get_current_user


async def generate_recovery_token(email: EmailStr) -> dict:
    return {
        "recoveryToken": create_access_token(
            email=email,
            user_id="RECOVERY",
            role="recovery",
            delta_expires=timedelta(minutes=5),
        ),
        "tokenType": "bearer"
    }


async def change_user_password_by_token(token: str, new_password: str, db: AsyncSession):
    user = await get_current_user(token=token, db=db)
    await set_user_password(user.email, get_password_hash(new_password), db)
