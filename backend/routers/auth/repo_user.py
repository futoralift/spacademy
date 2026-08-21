import uuid
from datetime import datetime
from typing import cast

from sqlalchemy import and_, delete, select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import User, PendingUser, UserRole
from utils.const import PLACEHOLDER_PROFILE_PATH
from utils.errors import DatabaseError, NotFoundError, ValidationError
from utils.sv_logger import sv_logger
from utils.validation import normalize_phone


async def insert_user(pending_user: PendingUser, db: AsyncSession, avatar: str = PLACEHOLDER_PROFILE_PATH)-> User:
    email = pending_user.email
    try:
        user = User(
            id=uuid.uuid4(),
            firstName=pending_user.firstName,
            lastName=pending_user.lastName,
            email=email,
            avatar=avatar,
            passwordHash=pending_user.passwordHash,
            refreshToken=None,
            phone=pending_user.phone,
            role=pending_user.role,
            createdAt=datetime.now(),
            deletedAt=None,
            lastLogIn=None,
            authServiceProvider=pending_user.authServiceProvider
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)
        sv_logger.info(
            "User inserted successfully",
            extra={"operation": "insert", "entity": "users", "identifier": email},
        )
        return user
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to insert user",
            extra={"operation": "insert", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users", "email": email}) from se


async def fetch_user_by_email(email: str, db: AsyncSession) -> User:
    try:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
    except SQLAlchemyError as se:
        sv_logger.error(
            "Failed to fetch user by email",
            extra={"operation": "fetch", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users"}) from se
    if not user:
        sv_logger.warning(
            "User not found by email",
            extra={"operation": "fetch", "entity": "users", "identifier": email},
        )
        raise NotFoundError("User not found", details={"email": email})
    sv_logger.info(
        "User fetched by email",
        extra={"operation": "fetch", "entity": "users", "identifier": email},
    )
    return user


async def delete_user(email: str, db: AsyncSession):
    try:
        result = cast(
            CursorResult,
            await db.execute(delete(User).where(User.email == email)),
        )
        if result.rowcount == 0:
            await db.rollback()
            sv_logger.warning(
                "Delete skipped; user not found",
                extra={"operation": "delete", "entity": "users", "identifier": email},
            )
            raise NotFoundError("User not found", details={"email": email})
        await db.commit()
        sv_logger.info(
            "User deleted successfully",
            extra={"operation": "delete", "entity": "users", "identifier": email},
        )
    except SQLAlchemyError as e:
        await db.rollback()
        sv_logger.error(
            "Failed to delete user",
            extra={"operation": "delete", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users"}) from e


async def set_user_password(email: str, new_hashed_password: str, db: AsyncSession):
    try:
        result = cast(
            CursorResult,
            await db.execute(
                update(User).where(User.email == email).values(passwordHash=new_hashed_password)
            ),
        )
        if result.rowcount == 0:
            await db.rollback()
            sv_logger.warning(
                "Password update skipped; user not found",
                extra={"operation": "update", "entity": "users", "identifier": email},
            )
            raise NotFoundError("User not found", details={"email": email})
        await db.commit()
        sv_logger.info(
            "User password updated successfully",
            extra={"operation": "update", "entity": "users", "identifier": email},
        )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to update user password",
            extra={"operation": "update", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users", "email": email}) from se


async def set_user_timestamp(email: str, date_time_field: str, new_date_time: datetime, db: AsyncSession):
    try:
        result = cast(
            CursorResult,
            await db.execute(
                update(User).where(User.email == email).values(**{date_time_field: new_date_time})
            ),
        )
        if result.rowcount == 0:
            await db.rollback()
            sv_logger.warning(
                "Timestamp update skipped; user not found",
                extra={"operation": "update", "entity": "users", "identifier": email},
            )
            raise NotFoundError("User not found", details={"email": email})
        await db.commit()
        sv_logger.info(
            "User timestamp updated successfully",
            extra={"operation": "update", "entity": "users", "identifier": email},
        )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to update user records",
            extra={"operation": "update", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users", "email": email}) from se


async def set_refresh_token(email: str, new_refresh_token: str, db: AsyncSession):
    try:
        result = cast(
            CursorResult,
            await db.execute(
                update(User).where(User.email == email).values(refreshToken=new_refresh_token)
            ),
        )
        if result.rowcount == 0:
            await db.rollback()
            sv_logger.warning(
                "Refresh token update skipped; user not found",
                extra={"operation": "update", "entity": "users", "identifier": email},
            )
            raise NotFoundError("User not found", details={"email": email})
        await db.commit()
        sv_logger.info(
            "Refresh token updated successfully",
            extra={"operation": "update", "entity": "users", "identifier": email},
        )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to update refresh token",
            extra={"operation": "update", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users", "email": email}) from se


async def set_user_role(email: str, role: UserRole, db: AsyncSession):
    try:
        result = cast(
            CursorResult,
            await db.execute(
                update(User).where(User.email == email).values(role=role)
            ),
        )
        if result.rowcount == 0:
            await db.rollback()
            sv_logger.warning(
                "Role update skipped; user not found",
                extra={"operation": "update", "entity": "users", "identifier": email},
            )
            raise NotFoundError("User not found", details={"email": email})
        await db.commit()
        sv_logger.info(
            "User role updated successfully",
            extra={"operation": "update", "entity": "users", "identifier": email, "role": role.value},
        )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to update user role",
            extra={"operation": "update", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users", "email": email, "role": role.value}) from se


async def fetch_user_by_refresh_token(refresh_token: str, db: AsyncSession) -> User:
    try:
        result = await db.execute(select(User).where(User.refreshToken == refresh_token))
        user = result.scalar_one_or_none()
    except SQLAlchemyError as se:
        sv_logger.error(
            "Failed to fetch user by refresh token",
            extra={"operation": "fetch", "entity": "users", "identifier": "refresh_token"},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users"}) from se
    if user:
        sv_logger.info(
            "User fetched by refresh token",
            extra={"operation": "fetch", "entity": "users", "identifier": "refresh_token"},
        )
        return user
    sv_logger.warning(
        "User not found by refresh token",
        extra={"operation": "fetch", "entity": "users", "identifier": "refresh_token"},
    )
    raise NotFoundError("User not found")


async def fetch_user_by_refresh_token_and_user_id(user_id: str, refresh_token: str, db: AsyncSession) -> User:
    try:
        result = await db.execute(
            select(User).where(and_(User.refreshToken == refresh_token, User.id == user_id))
        )
        user = result.scalar_one_or_none()
    except SQLAlchemyError as se:
        sv_logger.error(
            "Failed to fetch user by refresh token and user id",
            extra={"operation": "fetch", "entity": "users", "identifier": user_id},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users", "user_id": user_id}) from se
    if user:
        sv_logger.info(
            "User fetched by refresh token and user id",
            extra={"operation": "fetch", "entity": "users", "identifier": user_id},
        )
        return user
    sv_logger.warning(
        "User not found by refresh token and user id",
        extra={"operation": "fetch", "entity": "users", "identifier": user_id},
    )
    raise NotFoundError("User not found", details={"userId": user_id})


async def update_user_profile(email: str, first_name: str, last_name: str, new_email: str, phone: str, avatar: str, db: AsyncSession):
    try:
        normalized_phone = normalize_phone(phone)
        if not normalized_phone:
            raise ValidationError(message="Invalid phone number format", details={"phone": phone})

        update_values = {
            "firstName": first_name,
            "lastName": last_name,
            "email": new_email,
            "phone": normalized_phone,
        }
        
        if avatar is not None:
            update_values["avatar"] = avatar

        result = cast(
            CursorResult,
            await db.execute(
                update(User).where(User.email == email).values(**update_values)
            ),
        )
        if result.rowcount == 0:
            await db.rollback()
            sv_logger.warning(
                "Profile update skipped; user not found",
                extra={"operation": "update", "entity": "users", "identifier": email},
            )
            raise NotFoundError("User not found", details={"email": email})
        await db.commit()
        sv_logger.info(
            "User profile updated successfully",
            extra={"operation": "update", "entity": "users", "identifier": email},
        )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to update user profile",
            extra={"operation": "update", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users", "email": email}) from se
