from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import SiteSettings
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_site_settings(db: AsyncSession) -> SiteSettings | None:
    try:
        result = await db.execute(select(SiteSettings).limit(1))
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to fetch site settings", exc_info=True)
        raise DatabaseError(message="failed to fetch site settings") from se


async def insert_site_settings(settings: SiteSettings, db: AsyncSession) -> SiteSettings:
    try:
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        return settings
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to insert site settings", exc_info=True)
        raise DatabaseError(message="failed to insert site settings") from se


async def set_site_settings(settings: SiteSettings, db: AsyncSession) -> SiteSettings:
    try:
        await db.commit()
        await db.refresh(settings)
        return settings
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to update site settings", exc_info=True)
        raise DatabaseError(message="failed to update site settings") from se
