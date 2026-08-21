from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from routers.auth.repo_user import delete_user


async def remove_user(email: EmailStr, db: AsyncSession):
    response = await delete_user(email, db)
    return response
