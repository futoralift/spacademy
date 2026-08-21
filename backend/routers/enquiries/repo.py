import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from data.schemas import Enquiry
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def insert_enquiry(enquiry: Enquiry, db: AsyncSession) -> Enquiry:
    try:
        db.add(enquiry)
        await db.commit()
        await db.refresh(enquiry)
        return enquiry
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to insert enquiry", exc_info=True)
        raise DatabaseError(message="failed to insert enquiry") from se


async def fetch_enquiries(limit: int, offset: int, db: AsyncSession) -> Tuple[List[Enquiry], int]:
    try:
        query = select(Enquiry).limit(limit).offset(offset).order_by(Enquiry.createdAt.desc())
        result = await db.execute(query)
        enquiries = result.scalars().all()

        count_query = select(func.count()).select_from(Enquiry)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar() or 0
        
        return list(enquiries), total_record
    except SQLAlchemyError as se:
        sv_logger.error("failed to fetch enquiries", exc_info=True)
        raise DatabaseError(message="failed to fetch enquiries") from se


async def fetch_enquiry_by_id(enquiry_id: uuid.UUID, db: AsyncSession) -> Optional[Enquiry]:
    try:
        query = select(Enquiry).where(Enquiry.id == enquiry_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        sv_logger.error("failed to fetch enquiry by id", exc_info=True)
        raise DatabaseError(message="failed to fetch enquiry by id") from se


async def set_enquiry_status(enquiry: Enquiry, db: AsyncSession) -> Enquiry:
    try:
        await db.commit()
        await db.refresh(enquiry)
        return enquiry
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to update enquiry status", exc_info=True)
        raise DatabaseError(message="failed to update enquiry status") from se


async def remove_enquiry(enquiry_id: uuid.UUID, db: AsyncSession) -> int:
    try:
        query = delete(Enquiry).where(Enquiry.id == enquiry_id)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to delete enquiry", exc_info=True)
        raise DatabaseError(message="failed to delete enquiry") from se
