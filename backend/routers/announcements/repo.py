import uuid
from typing import List

from sqlalchemy import and_, asc, delete, desc, func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Announcement, AnnouncementStatus, AnnouncementType
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_announcements(limit: int, offset: int, db: AsyncSession) -> tuple[List[Announcement], int]:
    try:
        query = (
            select(Announcement)
            .order_by(desc(Announcement.createdAt))
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(query)
        announcements = result.scalars().all()

        count_result = await db.execute(select(func.count()).select_from(Announcement))
        total_record = count_result.scalar() or 0
        return announcements, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to fetch announcements", exc_info=True)
        raise DatabaseError(message="failed to fetch announcements") from se


async def fetch_active_announcements(limit: int, offset: int, active_at, db: AsyncSession) -> tuple[List[Announcement], int]:
    try:
        condition = and_(
            Announcement.status == AnnouncementStatus.ACTIVE,
            Announcement.type == AnnouncementType.PUBLIC,
            Announcement.startDate <= active_at,
            Announcement.endDate >= active_at,
        )
        query = (
            select(Announcement)
            .where(condition)
            .order_by(asc(Announcement.startDate), desc(Announcement.createdAt))
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(query)
        announcements = result.scalars().all()

        count_result = await db.execute(select(func.count()).select_from(Announcement).where(condition))
        total_record = count_result.scalar() or 0
        return announcements, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to fetch active announcements", exc_info=True)
        raise DatabaseError(message="failed to fetch active announcements") from se


async def fetch_announcement_by_id(announcement_id: str | uuid.UUID, db: AsyncSession) -> Announcement | None:
    try:
        result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch announcement by id",
            extra={"announcement_id": str(announcement_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch announcement {announcement_id}") from se


async def insert_announcement(announcement: Announcement, db: AsyncSession) -> Announcement:
    try:
        db.add(announcement)
        await db.commit()
        await db.refresh(announcement)
        return announcement
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to insert announcement", exc_info=True)
        raise DatabaseError(message="failed to insert announcement") from se


async def set_announcement(announcement: Announcement, db: AsyncSession) -> Announcement:
    try:
        await db.commit()
        await db.refresh(announcement)
        return announcement
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update announcement",
            extra={"announcement_id": str(announcement.id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update announcement {announcement.id}") from se


async def remove_announcement(announcement_id: str | uuid.UUID, db: AsyncSession) -> int:
    try:
        result = await db.execute(delete(Announcement).where(Announcement.id == announcement_id))
        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete announcement",
            extra={"announcement_id": str(announcement_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete announcement {announcement_id}") from se
