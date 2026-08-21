from typing import cast

from sqlalchemy import delete, exists, or_, select
from sqlalchemy.engine import CursorResult
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import PendingUser
from utils.errors import DatabaseError, NotFoundError
from utils.sv_logger import sv_logger

async def insert_pend_user(pend_user: PendingUser, db: AsyncSession):
    try:
        db.add(pend_user)
        await db.commit()
        await db.refresh(pend_user)
    except SQLAlchemyError as pe:
        await db.rollback()
        sv_logger.error(
            f"Failed to insert pending user: {pe}",
            extra={"email": pend_user.email},
        )
        raise DatabaseError(details={"email": pend_user.email}) from pe


async def pend_user_exists(email: str, db: AsyncSession) -> bool:
    try:
        result = await db.execute(
            select(exists().where(PendingUser.email == email))
        )
        return bool(result.scalar())
    except SQLAlchemyError as pe:
        sv_logger.error(
            "Failed to check pending user existence",
            extra={"operation": "exists", "entity": "pending_users", "identifier": email},
        )
        raise DatabaseError(details={"email": email}) from pe


async def pend_user_exists_by_email_or_phone(email: str, phone: str, db: AsyncSession) -> bool:
    try:
        result = await db.execute(
            select(
                exists().where(
                    or_(PendingUser.email == email, PendingUser.phone == phone)
                )
            )
        )
        return bool(result.scalar())
    except SQLAlchemyError as pe:
        sv_logger.error(
            "Failed to check pending user existence by email or phone",
            extra={
                "operation": "exists",
                "entity": "pending_users",
                "email": email,
                "phone": phone,
            },
        )
        raise DatabaseError(details={"email": email, "phone": phone}) from pe

async def delete_pend_user(email: str, db: AsyncSession):
    try:
        result = cast(
            CursorResult,
            await db.execute(delete(PendingUser).where(PendingUser.email == email)),
        )

        if result.rowcount == 0:
            await db.rollback()
            sv_logger.warning(
                "Delete skipped; user isn't in pending users",
                extra={"operation": "delete", "entity": "users", "identifier": email},
            )
            raise NotFoundError("User not found", details={"email": email})
        await db.commit()
    except SQLAlchemyError as pe:
        sv_logger.error(
            "Failed to remove pending user",
            extra={"email": email},
        )
        raise DatabaseError(details={"email": email}) from pe


async def delete_pend_user_if_exists(email: str, db: AsyncSession) -> bool:
    if not await pend_user_exists(email, db):
        return False
    await delete_pend_user(email, db)
    return True


async def delete_pend_user_by_email_or_phone_if_exists(email: str, phone: str, db: AsyncSession) -> bool:
    try:
        result = cast(
            CursorResult,
            await db.execute(
                delete(PendingUser).where(
                    or_(PendingUser.email == email, PendingUser.phone == phone)
                )
            ),
        )
        await db.commit()
        return bool(result.rowcount)
    except SQLAlchemyError as pe:
        await db.rollback()
        sv_logger.error(
            "Failed to remove pending user by email or phone",
            extra={"email": email, "phone": phone},
        )
        raise DatabaseError(details={"email": email, "phone": phone}) from pe

async def fetch_pend_user(email: str, db: AsyncSession) -> PendingUser:
    try:
        result = await db.execute(select(PendingUser).where(PendingUser.email == email))
        pending_user = result.scalar_one_or_none()
    except SQLAlchemyError as se:
        sv_logger.error(
            "Failed to fetch user by email",
            extra={"operation": "fetch", "entity": "users", "identifier": email},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "users"}) from se
    if not pending_user:
        sv_logger.warning(
            "Pending User not found by email",
            extra={"operation": "fetch", "entity": "users", "identifier": email},
        )
        raise NotFoundError("Pending User not found", details={"email": email})
    sv_logger.info(
        "Pending User fetched by email",
        extra={"operation": "fetch", "entity": "users", "identifier": email},
    )
    return pending_user
