from typing import List

from sqlalchemy import select, update, delete, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from data.schemas import Lecture, Subject, Course, Student, student_courses
from routers.courses.models import LectureResponseModel, CourseResponseModel, SubjectResponseModel
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def insert_subject(subject: Subject, db: AsyncSession) -> Subject:
    try:
        db.add(subject)
        await db.commit()
        await db.refresh(subject)
        return subject
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert subject data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert subject data", details={"subjectId": subject.id}) from se

async def fetch_subjects(db: AsyncSession) -> List[Subject]:
    try:
        result = await db.execute(select(Subject))
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch subject",
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch subjects") from se

async def set_subject(updated_subject: SubjectResponseModel, db: AsyncSession) -> Subject:
    try:
        result = await db.execute(
            update(Subject).where(Subject.id == updated_subject.id).
            values(
                name=updated_subject.name,
                courseId=updated_subject.courseId,
                teacherId=updated_subject.teacherId,
            ).returning(Subject)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update subject",
            extra={"subject_id": updated_subject.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update subject {updated_subject.id}") from se

async def remove_subject(subject_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(Subject).where(Subject.id == subject_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete subject",
            extra={"subject_id": subject_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete subject {subject_id}") from se

async def fetch_courses(db: AsyncSession) -> List[Course]:
    try:
        result = await db.execute(select(Course))
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch course",
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch courses") from se

async def fetch_course_by_id(course_id: str, db: AsyncSession) -> Course | None:
    try:
        result = await db.execute(
            select(Course)
            .options(selectinload(Course.subjects))
            .where(Course.id == course_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch course by id",
            extra={"course_id": course_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch course {course_id}") from se

async def insert_course(course: Course, db: AsyncSession) -> Course:
    try:
        db.add(course)
        await db.commit()
        await db.refresh(course)
        return course
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert course data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert course data", details={"courseId": course.id}) from se

async def set_course(updated_course: CourseResponseModel, db: AsyncSession) -> Course:
    try:
        update_values = {
            "name": updated_course.name,
            "description": updated_course.description,
            "isPaid": updated_course.isPaid,
            "isActive": updated_course.isActive,
            "highlights": updated_course.highlights,
            "standards": updated_course.standards,
            "mode": updated_course.mode,
            "amount": updated_course.amount,
            "currency": updated_course.currency,
        }
        
        if updated_course.image:
            update_values["image"] = updated_course.image
            
        result = await db.execute(
            update(Course).where(Course.id == updated_course.id).
            values(**update_values).returning(Course)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update course",
            extra={"course_id": updated_course.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update course {updated_course.id}") from se

async def remove_course(course_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(Course).where(Course.id == course_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete course",
            extra={"course_id": course_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete course {course_id}") from se


async def fetch_lectures(limit: int, offset: int, db: AsyncSession) -> tuple[List[Lecture], int]:
    try:
        lecture_query = select(Lecture).limit(limit).offset(offset)
        result = await db.execute(lecture_query)
        lectures = result.scalars().all()

        count_query = select(func.count()).select_from(Lecture)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        return lectures, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch courses",
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch courses") from se


async def fetch_teacher_lectures(teacher_id: str, db: AsyncSession) -> List[Lecture]:
    try:
        result = await db.execute(
            select(Lecture)
            .join(Lecture.subject)
            .options(selectinload(Lecture.subject))
            .where(Subject.teacherId == teacher_id)
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get courses",
            extra={"teacher_id": teacher_id},
            exc_info=True,
        )
        raise DatabaseError(
            message=f"failed to get courses {teacher_id}",
            details={"teacher_id": str(teacher_id)},
        ) from se


async def fetch_student_lectures(course_ids: List[str], db: AsyncSession) -> List[Lecture]:
    try:
        result = await db.execute(
            select(Lecture)
            .join(Subject, Lecture.subjectId == Subject.id)
            .join(Course, Course.id == Subject.courseId)
            .where(Course.id.in_(course_ids))
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get student lectures",
            exc_info=True,
        )
        raise DatabaseError(
            message=f"failed to get student lectures",
        ) from se

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

async def fetch_student_subjects(course_ids: List[str], db: AsyncSession) -> List[Subject]:
    try:
        result = await db.execute(
            select(Subject)
            .options(selectinload(Subject.course))
            .where(Subject.courseId.in_(course_ids))
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get subject",
            exc_info=True,
        )
        raise DatabaseError(
            message=f"failed to get subject",
        ) from se

async def insert_lecture(lecture: Lecture, db: AsyncSession) -> Lecture:
    try:
        db.add(lecture)
        await db.commit()
        await db.refresh(lecture)
        return lecture
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert lecture data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert lecture data") from se

async def set_lecture(updated_lecture: LectureResponseModel, db: AsyncSession) -> Lecture:
    try:
        result = await db.execute(
            update(Lecture).where(Lecture.id == updated_lecture.id).
            values(
                lectureTitle=updated_lecture.lectureTitle,
                startDate=updated_lecture.startDate,
                endDate=updated_lecture.endDate,
                subjectId=updated_lecture.subjectId,
            ).returning(Lecture)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update lecture",
            extra={"lecture_id": updated_lecture.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update lecture {updated_lecture.id}") from se

async def remove_lecture(lecture_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(Lecture).where(Lecture.id == lecture_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete lecture",
            extra={"lecture_id": lecture_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete lecture {lecture_id}") from se

async def fetch_lecture_students(lecture_id: str, db: AsyncSession) -> List[Student]:
    try:
        result = await db.execute(
            select(Student)
            .join(student_courses, Student.id == student_courses.c.student_id)
            .join(Course, Course.id == student_courses.c.course_id)
            .join(Subject, Subject.courseId == Course.id)
            .join(Lecture, Lecture.subjectId == Subject.id)
            .options(selectinload(Student.user))
            .where(Lecture.id == lecture_id)
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch students for lecture",
            extra={"lecture_id": lecture_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch students for lecture {lecture_id}") from se