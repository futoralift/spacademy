from typing import List

from sqlalchemy import select, func, update, delete
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import StudyResource
from routers.study_resources.models import StudyResourceUpdateModel
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_study_resource(study_resource_id: str, db: AsyncSession) -> StudyResource:
    try:
        result = await db.execute(
            select(StudyResource).where(StudyResource.id == study_resource_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get study_resource",
            extra={"study_resource_id": study_resource_id},
            exc_info=True
        )
        raise DatabaseError(message=f"failed to get study_resource {study_resource_id}") from se


async def fetch_all_study_resource(limit: int, offset: int, db: AsyncSession, teacher_id: str = None) -> tuple[List[StudyResource], int]:
    try:
        from data.schemas import Subject
        study_resource_query = select(StudyResource).limit(limit).offset(offset)
        count_query = select(func.count()).select_from(StudyResource)

        if teacher_id:
            from sqlalchemy import or_
            study_resource_query = study_resource_query.outerjoin(Subject, StudyResource.subjectId == Subject.id).where(
                or_(
                    Subject.teacherId == teacher_id,
                    StudyResource.subjectId == None
                )
            )
            count_query = count_query.outerjoin(Subject, StudyResource.subjectId == Subject.id).where(
                or_(
                    Subject.teacherId == teacher_id,
                    StudyResource.subjectId == None
                )
            )

        result = await db.execute(study_resource_query)
        study_resource = result.scalars().all()

        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        return study_resource, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch study_resource",
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch study_resource") from se

async def insert_study_resource(study_resource: StudyResource, db: AsyncSession) -> StudyResource:
    try:
        db.add(study_resource)
        await db.commit()
        await db.refresh(study_resource)
        return study_resource
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert study_resource data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert study_resource data") from se


async def set_study_resource(file_path: str, updated_study_resource: StudyResourceUpdateModel, db: AsyncSession) -> StudyResource:
    try:
        result = await db.execute(
            update(StudyResource).where(StudyResource.id == updated_study_resource.id).
            values(
                title=updated_study_resource.title,
                description=updated_study_resource.description,
                lectureId=updated_study_resource.lectureId,
                subjectId=updated_study_resource.subjectId,
                filePath=file_path,
            ).returning(StudyResource)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update study_resource",
            extra={"study_resource_id": updated_study_resource.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update study_resource {updated_study_resource.id}") from se

async def remove_study_resource(study_resource_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(StudyResource).where(StudyResource.id == study_resource_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete study_resource",
            extra={"study_resource_id": study_resource_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete study_resource {study_resource_id}") from se
