import uuid
from typing import List

from sqlalchemy import delete, desc, func, select, or_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import LearningHubVideo, Subject
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_learning_hub_videos(limit: int, offset: int, db: AsyncSession, teacher_id: str = None, subject_id: str = None) -> tuple[List[LearningHubVideo], int]:
    try:
        video_query = (
            select(LearningHubVideo)
            .order_by(desc(LearningHubVideo.publishDate), desc(LearningHubVideo.createdAt))
            .limit(limit)
            .offset(offset)
        )
        count_query = select(func.count()).select_from(LearningHubVideo)

        if teacher_id:
            video_query = video_query.outerjoin(Subject, LearningHubVideo.subjectId == Subject.id).where(
                or_(
                    Subject.teacherId == teacher_id,
                    LearningHubVideo.subjectId == None
                )
            )
            count_query = count_query.outerjoin(Subject, LearningHubVideo.subjectId == Subject.id).where(
                or_(
                    Subject.teacherId == teacher_id,
                    LearningHubVideo.subjectId == None
                )
            )
        elif subject_id:
            video_query = video_query.where(LearningHubVideo.subjectId == subject_id)
            count_query = count_query.where(LearningHubVideo.subjectId == subject_id)

        result = await db.execute(video_query)
        videos = result.scalars().all()

        count_result = await db.execute(count_query)
        total_record = count_result.scalar() or 0
        return videos, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to fetch learning hub videos", exc_info=True)
        raise DatabaseError(message="failed to fetch learning hub videos") from se


async def fetch_published_learning_hub_videos(limit: int, offset: int, published_until, db: AsyncSession, subject_id: str = None) -> tuple[List[LearningHubVideo], int]:
    try:
        video_query = (
            select(LearningHubVideo)
            .where(LearningHubVideo.publishDate <= published_until)
            .order_by(desc(LearningHubVideo.publishDate), desc(LearningHubVideo.createdAt))
            .limit(limit)
            .offset(offset)
        )
        count_query = (
            select(func.count())
            .select_from(LearningHubVideo)
            .where(LearningHubVideo.publishDate <= published_until)
        )

        if subject_id:
            video_query = video_query.where(LearningHubVideo.subjectId == subject_id)
            count_query = count_query.where(LearningHubVideo.subjectId == subject_id)

        result = await db.execute(video_query)
        videos = result.scalars().all()

        count_result = await db.execute(count_query)
        total_record = count_result.scalar() or 0
        return videos, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to fetch published learning hub videos", exc_info=True)
        raise DatabaseError(message="failed to fetch published learning hub videos") from se


async def fetch_learning_hub_video_by_id(video_id: str | uuid.UUID, db: AsyncSession) -> LearningHubVideo | None:
    try:
        result = await db.execute(select(LearningHubVideo).where(LearningHubVideo.id == video_id))
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch learning hub video by id",
            extra={"video_id": str(video_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch learning hub video {video_id}") from se


async def insert_learning_hub_video(video: LearningHubVideo, db: AsyncSession) -> LearningHubVideo:
    try:
        db.add(video)
        await db.commit()
        await db.refresh(video)
        return video
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to insert learning hub video", exc_info=True)
        raise DatabaseError(message="failed to insert learning hub video") from se


async def set_learning_hub_video(video: LearningHubVideo, db: AsyncSession) -> LearningHubVideo:
    try:
        await db.commit()
        await db.refresh(video)
        return video
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update learning hub video",
            extra={"video_id": str(video.id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update learning hub video {video.id}") from se


async def remove_learning_hub_video(video_id: str | uuid.UUID, db: AsyncSession) -> int:
    try:
        result = await db.execute(delete(LearningHubVideo).where(LearningHubVideo.id == video_id))
        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete learning hub video",
            extra={"video_id": str(video_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete learning hub video {video_id}") from se
