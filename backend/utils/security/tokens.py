import os
from datetime import timedelta, datetime

import jwt
from fastapi import Depends, HTTPException, Cookie
from fastapi.security import OAuth2PasswordBearer
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_401_UNAUTHORIZED

from data.core import get_db
from data.schemas import UserRole
from routers.auth.repo_user import fetch_user_by_email, fetch_user_by_refresh_token_and_user_id
from utils.const import REFRESH_TOKEN_EXPIRATION_DAYS
from utils.errors import NotFoundError, ValidationError
from utils.models.pydantic_cm import UserModel
from utils.models.sql_pydantic_parser import user_2_p

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(email: EmailStr, user_id: str, role: str, delta_expires: timedelta):
    payload = {
        "email": email,
        "userId": user_id,
        "role": role,
        "exp": datetime.now() + delta_expires,
    }

    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

def create_refresh_token(user_id: str, role: str):
    payload = {
        "userId": user_id,
        "role": role,
        "exp": datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRATION_DAYS),
    }

    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

async def get_current_user(token: str = Depends(oauth2_bearer), db: AsyncSession = Depends(get_db)) -> UserModel:
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        email: str = payload.get("email")
        user_id: str = payload.get("userId")
        role: str | None = payload.get("role")

        if email is None or user_id is None or role is None:
            raise ValidationError("Invalid Credentials", details={"WWW-Authenticate": "Bearer"})

        user = await fetch_user_by_email(email, db)
        if not user:
            raise NotFoundError("User not found", details={"userId": user_id})

        if user_id != "RECOVERY" and user.role.value != role:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Token role is outdated", headers={"WWW-Authenticate": "Bearer"})

        return user_2_p(user)

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Token has expired", headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=f"Could not validate credentials.")


def require_roles(*allowed_roles: UserRole):
    allowed_role_values = {role.value for role in allowed_roles}

    async def role_dependency(user: UserModel = Depends(get_current_user)) -> UserModel:
        if user.role.value not in allowed_role_values:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return role_dependency


async def get_current_student(user: UserModel = Depends(require_roles(UserRole.STUDENT))) -> UserModel:
    return user


async def get_current_staff(user: UserModel = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN))) -> UserModel:
    return user


async def get_current_teacher(user: UserModel = Depends(require_roles(UserRole.TEACHER))) -> UserModel:
    return user


async def get_current_admin(user: UserModel = Depends(require_roles(UserRole.ADMIN))) -> UserModel:
    return user


async def get_current_user_refresh_token(refresh_token: str = Cookie(None), db: AsyncSession = Depends(get_db)) -> UserModel:
    if not refresh_token:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = jwt.decode(refresh_token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        user_id = payload.get("userId")

        if not user_id:
            raise ValidationError("Invalid Refresh token", details={"userId": user_id})

        user = await fetch_user_by_refresh_token_and_user_id(user_id, refresh_token, db)
        if not user:
            raise NotFoundError("User not found", details={"userId": user_id})

        return user_2_p(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid session")
