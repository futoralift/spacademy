import uuid
from typing import List

from sqlalchemy import select, func, delete, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from data.schemas import User, UserRole, Subject, Course, Student, Lecture, student_courses
from utils.errors import DatabaseError
from utils.models.common_models import UserModifyRequestModel
from utils.sv_logger import sv_logger


async def fetch_all_teachers(limit: int, offset: int, db: AsyncSession) -> tuple[List[User], int]:
    try:
        query = (
            select(User)
            .options(
                selectinload(User.subjectsTeaching)
                .selectinload(Subject.course),
            )
            .where(User.role == UserRole.TEACHER)
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(query)
        users = result.scalars().all()

        count_query = select(func.count()).select_from(User).where(User.role == UserRole.TEACHER)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        return users, total_record
    except SQLAlchemyError as se:
        sv_logger.error(
            f"failed to fetch all {UserRole.TEACHER.value} data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to fetch all {UserRole.TEACHER.value} data") from se

async def fetch_teacher_subjects(teacher_id: str, db: AsyncSession) -> List[Subject]:
    try:
        result = await db.execute(
            select(Subject)
            .options(selectinload(Subject.course))
            .where(Subject.teacherId == teacher_id)
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get subject",
            extra={"teacher_id": teacher_id},
            exc_info=True,
        )
        raise DatabaseError(
            message=f"failed to get subject {teacher_id}",
            details={"teacher_id": str(teacher_id)},
        ) from se


async def fetch_teacher(teacher_id: str, db: AsyncSession) -> User:
    try:
        result = await db.execute(
            select(User)
            .options(
                selectinload(User.subjectsTeaching)
                .selectinload(Subject.course),
            )
            .where(User.id == teacher_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch teacher",
            extra={"teacher_id": teacher_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch teacher {teacher_id}") from se

async def insert_teacher(db: AsyncSession, teacher: User) -> User:
    try:
        db.add(teacher)
        await db.commit()
        return await fetch_teacher(str(teacher.id), db)
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert teacher data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert teacher data") from se

async def set_teacher(updated_teacher: UserModifyRequestModel, db: AsyncSession) -> User:
    try:
        await db.execute(
            update(User).where(User.id == updated_teacher.id).
            values(
                firstName = updated_teacher.firstName,
                lastName = updated_teacher.lastName,
                phone = updated_teacher.phone,
                email = updated_teacher.email,
                role = updated_teacher.role,
                avatar = updated_teacher.avatar,
            )
        )

        await db.commit()
        return await fetch_teacher(str(updated_teacher.id), db)
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update teacher",
            extra={"teacher_id": updated_teacher.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update teacher {updated_teacher.id}") from se

async def remove_teacher(teacher_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(User).where(User.id == teacher_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete teacher",
            extra={"teacher_id": teacher_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete teacher {teacher_id}") from se

async def fetch_teacher_dashboard_data(teacher_id: str, db: AsyncSession) -> List[Subject]:
    try:
        query = (
            select(Subject)
            .options(
                selectinload(Subject.course).selectinload(Course.students).selectinload(Student.user),
                selectinload(Subject.lectures)
            )
            .where(Subject.teacherId == teacher_id)
        )
        result = await db.execute(query)
        subjects = result.scalars().all()
        return subjects
    except SQLAlchemyError as se:
        sv_logger.error(
            "failed to fetch teacher dashboard data",
            extra={"teacher_id": teacher_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch teacher dashboard data {teacher_id}") from se

async def fetch_my_teachers(user_id: uuid.UUID, db: AsyncSession) -> List[User]:
    try:
        query = (
            select(User)
            .distinct()
            .join(Subject, User.id == Subject.teacherId)
            .join(Course, Subject.courseId == Course.id)
            .join(student_courses, Course.id == student_courses.c.course_id)
            .join(Student, student_courses.c.student_id == Student.id)
            .where(
                Student.userId == user_id,
                User.role == UserRole.TEACHER,
                User.deletedAt == None
            )
            .options(
                selectinload(User.subjectsTeaching)
                .selectinload(Subject.course),
            )
        )
        result = await db.execute(query)
        return result.scalars().all()
    except SQLAlchemyError as se:
        sv_logger.error(
            "failed to fetch my teachers",
            extra={"user_id": str(user_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch my teachers for user {user_id}") from se
