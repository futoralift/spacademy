from typing import List

from sqlalchemy import select, update, delete, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import LectureAttendance
from routers.attendance.models import AttendanceResponseModel
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_attendance(limit: int, offset: int, db: AsyncSession) -> tuple[List[LectureAttendance], int]:
    try:
        attendance_query = select(LectureAttendance).limit(limit).offset(offset)
        result = await db.execute(attendance_query)
        attendance = result.scalars().all()

        count_query = select(func.count()).select_from(LectureAttendance)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        return attendance, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch attendance",
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch attendance") from se

async def insert_attendance(attendance: LectureAttendance, db: AsyncSession) -> LectureAttendance:
    try:
        db.add(attendance)
        await db.commit()
        await db.refresh(attendance)
        return attendance
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert attendance data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert attendance data") from se

async def set_attendance(updated_attendance: AttendanceResponseModel, db: AsyncSession) -> LectureAttendance:
    try:
        result = await db.execute(
            update(LectureAttendance).where(LectureAttendance.id == updated_attendance.id).
            values(
                status=updated_attendance.status,
                studentId=updated_attendance.studentId,
                lectureId=updated_attendance.lectureId,
            ).returning(LectureAttendance)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update attendance",
            extra={"attendance_id": updated_attendance.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update attendance {updated_attendance.id}") from se

async def remove_attendance(attendance_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(LectureAttendance).where(LectureAttendance.id == attendance_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete lecture",
            extra={"lecture_id": attendance_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete lecture {attendance_id}") from se

async def fetch_attendance_for_lecture(lecture_id: str, db: AsyncSession) -> List[LectureAttendance]:
    try:
        result = await db.execute(
            select(LectureAttendance).where(LectureAttendance.lectureId == lecture_id)
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch attendance for lecture",
            extra={"lecture_id": lecture_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch attendance for lecture {lecture_id}") from se

async def fetch_attendance_for_student(student_id: str, db: AsyncSession) -> List[LectureAttendance]:
    try:
        result = await db.execute(
            select(LectureAttendance).where(LectureAttendance.studentId == student_id)
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch attendance for student",
            extra={"student_id": student_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch attendance for student {student_id}") from se
