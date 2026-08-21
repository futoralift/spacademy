import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from data.schemas import Testimonial
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def insert_testimonial(testimonial: Testimonial, db: AsyncSession) -> Testimonial:
    try:
        db.add(testimonial)
        await db.commit()
        await db.refresh(testimonial)
        return testimonial
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to insert testimonial", exc_info=True)
        raise DatabaseError(message="failed to insert testimonial") from se


async def fetch_testimonials(limit: int, offset: int, db: AsyncSession) -> Tuple[List[Testimonial], int]:
    try:
        query = select(Testimonial).limit(limit).offset(offset).order_by(Testimonial.createdAt.desc())
        result = await db.execute(query)
        testimonials = result.scalars().all()

        count_query = select(func.count()).select_from(Testimonial)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar() or 0
        
        return list(testimonials), total_record
    except SQLAlchemyError as se:
        sv_logger.error("failed to fetch testimonials", exc_info=True)
        raise DatabaseError(message="failed to fetch testimonials") from se


async def fetch_testimonial_by_id(testimonial_id: uuid.UUID, db: AsyncSession) -> Optional[Testimonial]:
    try:
        query = select(Testimonial).where(Testimonial.id == testimonial_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        sv_logger.error("failed to fetch testimonial by id", exc_info=True)
        raise DatabaseError(message="failed to fetch testimonial by id") from se


async def set_testimonial(testimonial: Testimonial, db: AsyncSession) -> Testimonial:
    try:
        await db.commit()
        await db.refresh(testimonial)
        return testimonial
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to update testimonial", exc_info=True)
        raise DatabaseError(message="failed to update testimonial") from se


async def remove_testimonial(testimonial_id: uuid.UUID, db: AsyncSession) -> int:
    try:
        query = delete(Testimonial).where(Testimonial.id == testimonial_id)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to delete testimonial", exc_info=True)
        raise DatabaseError(message="failed to delete testimonial") from se
