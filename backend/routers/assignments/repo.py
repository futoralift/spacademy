from datetime import datetime
from typing import List

from sqlalchemy import delete, func, select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Assignments, StudentAssignments, Lecture, Subject
from routers.assignments.models import AssignmentUpdateModel, StudentAssignmentUpdateModelByTeacher, \
    StudentAssignmentUpdateModelByStudent
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_assignment(assignment_id: str, db: AsyncSession) -> Assignments:
    try:
        result = await db.execute(
            select(Assignments).where(Assignments.id == assignment_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get assignment",
            extra={"assignment_id": assignment_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to get assignment {assignment_id}") from se

async def fetch_all_assignment_by_student(
    course_ids: List[str],
    limit: int,
    offset: int,
    db: AsyncSession,
) -> tuple[List[Assignments], int]:
    try:
        assignment_query = (
            select(Assignments)
            .join(Lecture, Lecture.id == Assignments.lectureId)
            .join(Subject, Subject.id == Lecture.subjectId)
            .where(Subject.courseId.in_(course_ids))
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(assignment_query)
        assignments = result.scalars().all()

        count_query = (
            select(func.count())
            .select_from(Assignments)
            .join(Lecture, Lecture.id == Assignments.lectureId)
            .join(Subject, Subject.id == Lecture.subjectId)
            .where(Subject.courseId.in_(course_ids))
        )
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return assignments, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch assignments",
            extra={"course_ids": course_ids},
            exc_info=True,
        )
        raise DatabaseError(message="failed to fetch assignments") from se

async def fetch_all_assignment(limit: int, offset: int, db: AsyncSession) -> tuple[List[Assignments], int]:
    try:
        assignment_query = select(Assignments).limit(limit).offset(offset)
        result = await db.execute(assignment_query)
        assignments = result.scalars().all()

        count_query = select(func.count()).select_from(Assignments)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        return assignments, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch assignments",
            exc_info=True,
        )
        raise DatabaseError(message="failed to fetch assignments") from se


async def insert_assignment(assignment: Assignments, db: AsyncSession) -> Assignments:
    try:
        db.add(assignment)
        await db.commit()
        await db.refresh(assignment)
        return assignment
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to insert assignment data",
            exc_info=True,
        )
        raise DatabaseError(message="failed to insert assignment data") from se


async def set_assignment(updated_assignment: AssignmentUpdateModel, db: AsyncSession) -> Assignments:
    try:
        result = await db.execute(
            update(Assignments)
            .where(Assignments.id == updated_assignment.id)
            .values(
                title=updated_assignment.title,
                description=updated_assignment.description,
                lectureId=updated_assignment.lectureId,
                deadline=updated_assignment.deadline,
                mark=updated_assignment.mark,
            )
            .returning(Assignments)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update assignment",
            extra={"assignment_id": updated_assignment.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update assignment {updated_assignment.id}") from se


async def remove_assignment(assignment_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(Assignments).where(Assignments.id == assignment_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete assignment",
            extra={"assignment_id": assignment_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete assignment {assignment_id}") from se


async def fetch_student_assignment(student_assignment_id: str, db: AsyncSession) -> StudentAssignments:
    try:
        result = await db.execute(
            select(StudentAssignments).where(StudentAssignments.id == student_assignment_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get student assignment",
            extra={"student_assignment_id": student_assignment_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to get student assignment {student_assignment_id}") from se



async def fetch_student_assignments_by_assignment_id(assignment_id: str, db: AsyncSession) -> List[StudentAssignments]:
    try:
        result = await db.execute(
            select(StudentAssignments).where(StudentAssignments.assignmentId == assignment_id)
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get assignment submissions",
            extra={"assignment_id": assignment_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to get submissions for assignment {assignment_id}") from se



async def fetch_student_assignment_by_student_id(student_id: str, db: AsyncSession) -> List[StudentAssignments]:
    try:
        result = await db.execute(
            select(StudentAssignments).where(StudentAssignments.studentId == student_id)
        )
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get student submissions",
            extra={"student_id": student_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to get submissions for student {student_id}") from se


async def fetch_all_student_assignment(limit: int, offset: int, db: AsyncSession) -> tuple[List[StudentAssignments], int]:
    try:
        student_assignment_query = select(StudentAssignments).limit(limit).offset(offset)
        result = await db.execute(student_assignment_query)
        student_assignments = result.scalars().all()

        count_query = select(func.count()).select_from(StudentAssignments)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        return student_assignments, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch student assignments",
            exc_info=True,
        )
        raise DatabaseError(message="failed to fetch student assignments") from se

async def insert_student_assignment(student_assignment: StudentAssignments, db: AsyncSession) -> StudentAssignments:
    try:
        db.add(student_assignment)
        await db.commit()
        await db.refresh(student_assignment)
        return student_assignment
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to insert student assignment data",
            exc_info=True,
        )
        raise DatabaseError(message="failed to insert student assignment data") from se


async def set_student_assignment(file_path: str, updated_student_assignment: StudentAssignmentUpdateModelByStudent, db: AsyncSession) -> StudentAssignments:
    try:
        result = await db.execute(
            update(StudentAssignments)
            .where(StudentAssignments.id == updated_student_assignment.id)
            .values(
                assignmentId=updated_student_assignment.assignmentId,
                studentId=updated_student_assignment.studentId,
                status=updated_student_assignment.status,
                filePath=file_path,
                uploadAt=datetime.now(),
            )
            .returning(StudentAssignments)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update student assignment",
            extra={"student_assignment_id": updated_student_assignment.id},
            exc_info=True,
        )
        raise DatabaseError(
            message=f"failed to update student assignment {updated_student_assignment.id}"
        ) from se

async def set_student_assignment_status(updated_status_req: StudentAssignmentUpdateModelByTeacher, db: AsyncSession) -> StudentAssignments:
    try:
        result = await db.execute(
            update(StudentAssignments)
            .where(StudentAssignments.id == updated_status_req.studentAssignmentId)
            .values(
                status=updated_status_req.status,
            )
            .returning(StudentAssignments)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update student assignment status",
            extra={"status to update": updated_status_req.status },
            exc_info=True,
        )
        raise DatabaseError(
            message=f"failed to update student assignment status {updated_status_req.status}",
        ) from se


async def remove_student_assignment(student_assignment_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(StudentAssignments).where(StudentAssignments.id == student_assignment_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete student assignment",
            extra={"student_assignment_id": student_assignment_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete student assignment {student_assignment_id}") from se
