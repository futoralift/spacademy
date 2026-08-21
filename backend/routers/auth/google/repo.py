from typing import Optional

from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import User

async def fetch_user_by_email(email: EmailStr, db: AsyncSession) -> Optional[User]:
    try:
        user = await db.execute(select(User).where(User.email == email))
    except SQLAlchemyError:
        return None
    if user:
        return user.scalar_one_or_none()
    return None
