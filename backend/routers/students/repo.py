import uuid
from typing import List

from sqlalchemy import select, func, update, delete, distinct
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from data.schemas import User, UserRole, Student, Course, LectureAttendance, AttendanceStatus, \
    Lecture, student_courses, Subject
from routers.courses.models import CourseResponseModel
from routers.students.models import EntireStudentsInsightModel, StudentUpdateModel, StudentResponseModel
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_all_students(limit: int, offset: int, db: AsyncSession) -> tuple[List[User], int]:
    try:
        query = (
            select(User)
            .join(Student, Student.userId == User.id)
            .options(
                selectinload(User.student).selectinload(Student.courses)
            )
            .where(User.role == UserRole.STUDENT)
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(query)
        users = result.scalars().all()

        count_query = (
            select(func.count())
            .select_from(User)
            .join(Student, Student.userId == User.id)
            .where(User.role == UserRole.STUDENT)
        )
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        return users, total_record
    except SQLAlchemyError as se:
        sv_logger.error(
            f"failed to fetch all {UserRole.STUDENT.value} data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to fetch all {UserRole.STUDENT.value} data") from se

async def fetch_all_students_of_teacher(teacher_id: str, limit: int, offset: int, db: AsyncSession) -> tuple[List[User], int]:
    try:
        # Convert teacher_id to UUID if it's a string
        t_id = uuid.UUID(teacher_id) if isinstance(teacher_id, str) else teacher_id

        # Subquery to find courses taught by the teacher via their subjects
        courses_subquery = (
            select(Subject.courseId)
            .where(Subject.teacherId == t_id)
        ).scalar_subquery()

        # Query students enrolled in those courses
        query = (
            select(User)
            .distinct()
            .join(Student, Student.userId == User.id)
            .join(student_courses, Student.id == student_courses.c.student_id)
            .options(
                selectinload(User.student).selectinload(Student.courses)
            )
            .where(User.role == UserRole.STUDENT)
            .where(student_courses.c.course_id.in_(courses_subquery))
            .limit(limit)
            .offset(offset)
        )
        
        result = await db.execute(query)
        users = result.scalars().all()

        count_query = (
            select(func.count(distinct(User.id)))
            .join(Student, Student.userId == User.id)
            .join(student_courses, Student.id == student_courses.c.student_id)
            .where(User.role == UserRole.STUDENT)
            .where(student_courses.c.course_id.in_(courses_subquery))
        )
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        
        return users, total_record
        
    except SQLAlchemyError as se:
        sv_logger.error(
            f"failed to fetch students for teacher {teacher_id}",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to fetch students for teacher {teacher_id}") from se

async def is_student_associated_with_teacher(student_user_id: str, teacher_id: str, db: AsyncSession) -> bool:
    try:
        # Convert IDs to UUID if they are strings
        st_user_id = uuid.UUID(student_user_id) if isinstance(student_user_id, str) else student_user_id
        t_id = uuid.UUID(teacher_id) if isinstance(teacher_id, str) else teacher_id

        query = (
            select(student_courses.c.student_id)
            .join(Student, Student.id == student_courses.c.student_id)
            .join(Subject, Subject.courseId == student_courses.c.course_id)
            .where(Student.userId == st_user_id)
            .where(Subject.teacherId == t_id)
        )
        result = await db.execute(query)
        return result.first() is not None
    except (SQLAlchemyError, ValueError) as _:
        sv_logger.error(
            f"failed to check student association",
            extra={"student_user_id": student_user_id, "teacher_id": teacher_id},
            exc_info=True
        )
        return False

async def fetch_teacher_student_insights(teacher_id: str, db: AsyncSession) -> EntireStudentsInsightModel:
    try:
        # Convert teacher_id to UUID if it's a string
        t_id = uuid.UUID(teacher_id) if isinstance(teacher_id, str) else teacher_id

        courses_subquery = (
            select(Subject.courseId)
            .where(Subject.teacherId == t_id)
        ).scalar_subquery()

        total_students = await db.execute(
            select(func.count(distinct(Student.id)))
            .join(student_courses, student_courses.c.student_id == Student.id)
            .where(student_courses.c.course_id.in_(courses_subquery))
        )
        
        pro_students = await db.execute(
            select(func.count(distinct(Student.id)))
            .join(student_courses, student_courses.c.student_id == Student.id)
            .join(Course, Course.id == student_courses.c.course_id)
            .where(student_courses.c.course_id.in_(courses_subquery))
            .where(Course.isPaid == True)
        )
        
        return EntireStudentsInsightModel(
            totalStudents = total_students.scalar_one_or_none() or 0,
            proStudents = pro_students.scalar_one_or_none() or 0,
        )
    except SQLAlchemyError as se:
        sv_logger.error(
            f"failed to fetch teacher student insights",
            extra={"teacher_id": teacher_id},
            exc_info=True
        )
        raise DatabaseError(message="failed to fetch teacher student insights") from se

async def insert_student_user(db: AsyncSession, student: User) -> User:
    try:
        db.add(student)
        await db.commit()
        await db.refresh(student)
        return student
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert student user data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert student user data") from se

async def insert_student(db: AsyncSession, student: Student) -> Student:
    try:
        db.add(student)
        await db.commit()
        await db.refresh(student)
        return student
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert student data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert student data") from se

async def set_student(updated_student: StudentUpdateModel, db: AsyncSession) -> StudentResponseModel:
    try:
        student_obj = (await db.execute(
            select(Student)
            .options(selectinload(Student.courses))
            .where(Student.userId == updated_student.id)
        )).scalar_one_or_none()

        if student_obj:
            student_obj.rollNo = updated_student.rollNo
            student_obj.standard = updated_student.standard
            student_obj.schoolName = updated_student.schoolName
            student_obj.parentName = updated_student.parentName
            student_obj.parentMobileNumber = updated_student.parentMobileNumber
            student_obj.board = updated_student.board
            
            # Update M2M courses
            courses_result = await db.execute(select(Course).where(Course.id.in_(updated_student.courseIds)))
            student_obj.courses = courses_result.scalars().all()

            result = await db.execute(
                update(User).where(User.id == student_obj.userId).
                values(
                    firstName = updated_student.firstName,
                    lastName = updated_student.lastName,
                    phone = updated_student.phone,
                    email = updated_student.email,
                    avatar = updated_student.avatar,
                ).returning(User)
            )

            await db.commit()
            student_user: User = result.scalar_one_or_none()
            
            return StudentResponseModel(
                id=str(student_obj.id),
                rollNo=student_obj.rollNo,
                parentName=student_obj.parentName,
                parentNumber=student_obj.parentMobileNumber,
                board=student_obj.board,
                standard=student_obj.standard,
                schoolName=student_obj.schoolName,

                firstName=student_user.firstName,
                lastLoginAt=student_user.lastLogIn,
                lastName=student_user.lastName,
                email=student_user.email,
                studentNumber=student_user.phone,
                avatar=student_user.avatar,
                createdAt=student_user.createdAt,
                deletedAt=student_user.deletedAt,
                authServiceProvider=student_user.authServiceProvider,
                courses=[
                    CourseResponseModel(
                        id=str(course.id),
                        name=course.name,
                        description=course.description,
                        standards=course.standards,
                        image=course.image,
                        highlights=course.highlights,
                        isActive=course.isActive,
                        isPaid=course.isPaid,
                        mode=course.mode,
                        amount=course.amount,
                        currency=course.currency
                    )
                    for course in student_obj.courses
                ]
            )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update student",
            extra={"student_id": updated_student.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update student {updated_student.id}") from se

async def remove_student(student_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(User).where(User.id == student_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete student",
            extra={"student_id": student_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete student {student_id}") from se


async def fetch_student(student_user_id: str, db: AsyncSession) -> User:
    try:
        result = await db.execute(
            select(User)
            .options(
                selectinload(User.student)
                .selectinload(Student.courses)
                .selectinload(Course.subjects)
            )
            .where(User.id == student_user_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get student",
            extra={"student_user_id": student_user_id},
            exc_info=True
        )
        raise DatabaseError(message=f"failed to get student {student_user_id}") from se

async def fetch_student_profile_by_user_id(student_user_id: str, db: AsyncSession) -> Student:
    try:
        result = await db.execute(
            select(Student).options(selectinload(Student.courses).selectinload(Course.subjects)).where(Student.userId == student_user_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get student profile",
            extra={"student_user_id": student_user_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to get student profile {student_user_id}") from se

async def fetch_entire_student_insights(db: AsyncSession) -> EntireStudentsInsightModel:
    try:
        total_student = await db.execute(select(func.count(Student.id)))
        pro_students = await db.execute(
            select(func.count(distinct(Student.id)))
            .join(student_courses, student_courses.c.student_id == Student.id)
            .join(Course, Course.id == student_courses.c.course_id)
            .where(Course.isPaid == True)
        )

        return EntireStudentsInsightModel(
            totalStudents = total_student.scalar_one_or_none(),
            proStudents = pro_students.scalar_one_or_none(),
        )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get student insights",
            exc_info=True,
        )
        raise DatabaseError(
            message="failed to get student insights"
        ) from se

async def fetch_student_by_id(student_id: str, db: AsyncSession) -> Student:
    try:
        result = await db.execute(
            select(Student).options(selectinload(Student.courses).selectinload(Course.subjects)).where(Student.id == student_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get student profile by id",
            extra={"student_id": student_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to get student profile by id {student_id}") from se

async def fetch_student_attendance_insights(student_data: tuple[str, list[Course] | Course], db: AsyncSession) -> dict:
    try:
        student_id = student_data[0]
        student_courses_list = student_data[1]
        if isinstance(student_courses_list, Course):
            student_courses_list = [student_courses_list]
        
        course_ids = [str(c.id) for c in student_courses_list]

        # 1. Get total sessions (lectures) held for these courses
        total_lectures = (await db.execute(
            select(func.count(Lecture.id))
            .join(Subject, Lecture.subjectId == Subject.id)
            .where(Subject.courseId.in_(course_ids))
        )).scalar_one_or_none() or 0

        # 2. Get counts for Present, Late, Excused across all lectures
        total_present = (await db.execute(
            select(func.count(LectureAttendance.id))
            .where(LectureAttendance.studentId == student_id)
            .where(LectureAttendance.status == AttendanceStatus.PRESENT)
        )).scalar_one_or_none() or 0

        total_late = (await db.execute(
            select(func.count(LectureAttendance.id))
            .where(LectureAttendance.studentId == student_id)
            .where(LectureAttendance.status == AttendanceStatus.LATE)
        )).scalar_one_or_none() or 0

        total_excused = (await db.execute(
            select(func.count(LectureAttendance.id))
            .where(LectureAttendance.studentId == student_id)
            .where(LectureAttendance.status == AttendanceStatus.EXCUSED)
        )).scalar_one_or_none() or 0

        # Calculate total absent using the user's formula: total - (P + L + E)
        total_absent = max(0, total_lectures - (total_present + total_late + total_excused))

        course_attendance = dict()

        for course in student_courses_list:
            subject_attendance = dict()
            for subject in course.subjects:
                # Total sessions held for this specific subject
                total_subject_lectures = (await db.execute(
                    select(func.count(Lecture.id))
                    .where(Lecture.subjectId == subject.id)
                )).scalar_one_or_none() or 0

                # Attendance recorded for this subject
                sub_present = (await db.execute(
                    select(func.count(LectureAttendance.id))
                    .join(Lecture, LectureAttendance.lectureId == Lecture.id)
                    .where(Lecture.subjectId == subject.id)
                    .where(LectureAttendance.studentId == student_id)
                    .where(LectureAttendance.status == AttendanceStatus.PRESENT)
                )).scalar_one_or_none() or 0

                sub_late = (await db.execute(
                    select(func.count(LectureAttendance.id))
                    .join(Lecture, LectureAttendance.lectureId == Lecture.id)
                    .where(Lecture.subjectId == subject.id)
                    .where(LectureAttendance.studentId == student_id)
                    .where(LectureAttendance.status == AttendanceStatus.LATE)
                )).scalar_one_or_none() or 0

                sub_excused = (await db.execute(
                    select(func.count(LectureAttendance.id))
                    .join(Lecture, LectureAttendance.lectureId == Lecture.id)
                    .where(Lecture.subjectId == subject.id)
                    .where(LectureAttendance.studentId == student_id)
                    .where(LectureAttendance.status == AttendanceStatus.EXCUSED)
                )).scalar_one_or_none() or 0

                # Calculate subject-wise absent
                sub_absent = max(0, total_subject_lectures - (sub_present + sub_late + sub_excused))

                attendance = {
                    "id": str(subject.id),
                    "present": sub_present,
                    "late": sub_late,
                    "excused": sub_excused,
                    "absent": sub_absent
                }

                subject_attendance[subject.name] = (total_subject_lectures, attendance)

            course_attendance[course.name] = subject_attendance

        return {
            "lectureAttendance": {
                "totalLectures": total_lectures,
                "present": total_present,
                "late": total_late,
                "excused": total_excused,
                "absent": total_absent
            },
            "courseWiseAttendance": course_attendance
        }

    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to get student attendance insights",
            exc_info=True
        )
        raise DatabaseError(
            message="failed to get student attendance insights"
        ) from se
