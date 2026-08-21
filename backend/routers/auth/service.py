import uuid
import os
from datetime import timedelta
from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from routers.auth.repo_pend_user import (
    delete_pend_user,
    delete_pend_user_by_email_or_phone_if_exists,
    fetch_pend_user,
    insert_pend_user,
)
from data.schemas import PendingUser, AuthServiceProvider, User, UserRole, Student
from routers.auth.repo_user import insert_user, fetch_user_by_email, set_refresh_token
from routers.auth.models import UserCredentials, SignUpModel, Token
from routers.students.repo import insert_student
from utils.const import ACCESS_TOKEN_EXPIRE_MINUTES
from utils.errors import ValidationError, NotFoundError
from utils.models.pydantic_cm import UserModel
from utils.security.hashing import get_password_hash, verify_password
from utils.security.tokens import create_access_token, create_refresh_token
from utils.validation import normalize_phone


async def login_verification(email, db: AsyncSession):
    pend_user = await fetch_pend_user(email, db)
    if pend_user is None:
        raise NotFoundError("User is not in registered (Not in Pending list)", details={"email": email})

    user = await insert_user(pend_user, db)

    student = Student(
        id=uuid.uuid4(),
        rollNo=None,
        standard=None,
        schoolName=None,
        board=None,
        parentName=None,
        parentMobileNumber=None,
        userId=user.id,
    )

    await insert_student(db=db, student=student)

    await delete_pend_user(email, db)
    return create_access_token(email, "temp_id", pend_user.role.value, timedelta(minutes=5))

async def google_finalize_verification(email: str, phone: str, avatar: str, db: AsyncSession):
    pend_user = await fetch_pend_user(email, db)
    if pend_user is None:
        raise NotFoundError("User is not in registered (Not in Pending list)", details={"email": email})

    pend_user.phone = phone
    await insert_user(pend_user, db, avatar=avatar)
    await delete_pend_user(email, db)
    return {
        "access_token": create_access_token(email, "temp_id", pend_user.role.value, timedelta(minutes=5)),
        "token_type": "bearer"
    }


async def store_pend_user(signup_data: SignUpModel, auth_s_p: AuthServiceProvider, db: AsyncSession):
    await delete_pend_user_by_email_or_phone_if_exists(signup_data.email, signup_data.phone, db)

    normalized_phone = normalize_phone(signup_data.phone) if signup_data.phone else None
    if signup_data.phone and not normalized_phone:
        raise ValidationError(message="Invalid phone number format", details={"phone": signup_data.phone})

    pend_schema = PendingUser(
        id=uuid.uuid4(),
        firstName=signup_data.firstName,
        lastName=signup_data.lastName,
        email=signup_data.email,
        phone=normalized_phone,
        passwordHash=get_password_hash(signup_data.password) if signup_data.password else None,
        authServiceProvider=auth_s_p,
        role=UserRole.STUDENT,
    )

    await insert_pend_user(pend_schema, db=db)


async def authenticate_user(credentials: UserCredentials, db: AsyncSession) -> User:
    user = await fetch_user_by_email(email=credentials.email, db=db)

    if user is None:
        raise NotFoundError("User not found", details={"email": credentials.email})

    if user.passwordHash is None and credentials.password == "" and user.authServiceProvider == AuthServiceProvider.GOOGLE:
        return user

    if not verify_password(credentials.password, user.passwordHash):
        raise ValidationError("Invalid email or password")
    return user


async def tokens_generator(response: Response, user: UserModel, db: AsyncSession) -> Token:
    user_id = str(user.id)
    refresh_token = create_refresh_token(user_id=user_id, role=user.role.value)
    access_token = create_access_token(
        email=user.email,
        user_id=user_id,
        role=user.role.value,
        delta_expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    await set_refresh_token(email=user.email, new_refresh_token=refresh_token, db=db)
    cookie_samesite = os.getenv("COOKIE_SAMESITE", "lax").lower()
    # In production (cross-site), SameSite=none requires Secure=True
    cookie_secure = os.getenv("COOKIE_SECURE", "false").lower() == "true" or cookie_samesite == "none"

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        max_age=7 * 24 * 60 * 60
    )

    return Token(
        access_token= access_token,
        token_type= "bearer",
    )
