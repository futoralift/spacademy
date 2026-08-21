import math
import uuid
from datetime import datetime
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import UserRole, User, AuthServiceProvider, Subject
from routers.courses.models import CourseResponseModel, SubjectResponseModel
from routers.teacher.models import TeacherResponseModel, PaginationTeacherResponse, TeacherDashboardResponse, StudentMiniModel, LectureMiniModel
from utils.errors import ValidationError
from utils.models.common_models import UserModifyRequestModel, UserRequestModel
from routers.teacher.repo import fetch_all_teachers, fetch_teacher, remove_teacher, set_teacher, insert_teacher, fetch_teacher_dashboard_data, fetch_my_teachers
from utils.security.hashing import get_password_hash
from utils.validation import normalize_phone


def _map_teacher_response(teacher: User) -> TeacherResponseModel:
    teacher_courses = dict()

    teacher_subjects = teacher.subjectsTeaching if teacher.subjectsTeaching else []
    if isinstance(teacher_subjects, Subject):
        teacher_subjects = [teacher_subjects]

    for subj in teacher_subjects:
        if subj.course and subj.course.id not in teacher_courses:
            teacher_courses[subj.course.id] = subj.course

    mapped_courses = [
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
        for course in teacher_courses.values()
    ]

    mapped_subjects = [
        SubjectResponseModel(
            id=str(subject.id),
            name=subject.name,
            teacherId=str(subject.teacherId),
            courseId=str(subject.courseId),
        )
        for subject in teacher_subjects
    ]

    return TeacherResponseModel(
        id=str(teacher.id),
        firstName=teacher.firstName,
        lastName=teacher.lastName,
        email=teacher.email,
        avatar=teacher.avatar,
        phone=teacher.phone,
        authServiceProvider=teacher.authServiceProvider,
        createdAt=teacher.createdAt,
        deletedAt=teacher.deletedAt,
        lastLoginAt=teacher.lastLogIn,
        courses=mapped_courses,
        subjects=mapped_subjects,
    )


async def retrieve_all_teachers(limit: int, offset: int, db: AsyncSession) -> PaginationTeacherResponse:
    users, total_records = await fetch_all_teachers(limit=limit, offset=offset, db=db)
    data = [_map_teacher_response(user) for user in users]

    return PaginationTeacherResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit)
    )


async def create_teacher(teacher_req: UserRequestModel, db: AsyncSession) -> TeacherResponseModel:
    normalized_phone = normalize_phone(teacher_req.phone)
    if not normalized_phone:
        raise ValidationError(message="Invalid phone number format", details={"phone": teacher_req.phone})

    teacher = User(
        id=uuid.uuid4(),
        firstName=teacher_req.firstName.capitalize(),
        lastName=teacher_req.lastName.capitalize(),
        email=teacher_req.email,
        passwordHash=get_password_hash(teacher_req.password),
        phone=normalized_phone,
        createdAt=datetime.now(),
        authServiceProvider=AuthServiceProvider.ADMIN,
        avatar="",
        role=UserRole.TEACHER,
    )

    new_teacher = await insert_teacher(db, teacher)
    return _map_teacher_response(new_teacher)

async def modify_teacher(update_teacher: UserModifyRequestModel, db: AsyncSession) -> TeacherResponseModel:
    teacher = await fetch_teacher(update_teacher.id, db)

    if teacher.role != UserRole.TEACHER:
        raise ValidationError(
            message="You can only modify teacher.",
            details={
                "teacherId": teacher.id,
            }
        )

    modified_teacher = await set_teacher(updated_teacher=update_teacher, db=db)
    return _map_teacher_response(modified_teacher)

async def delete_teacher(teacher_id: str, db: AsyncSession) -> int:
    teacher = await fetch_teacher(teacher_id, db)
    if teacher.role != UserRole.TEACHER:
        raise ValidationError(
            message="You can only delete teacher.",
            details={
                "teacherId": teacher.id,
            }
        )
    return await remove_teacher(teacher_id, db)


async def retrieve_teacher_dashboard(teacher_id: str, db: AsyncSession) -> TeacherDashboardResponse:
    subjects = await fetch_teacher_dashboard_data(teacher_id, db)

    unique_students = {}
    all_lectures = []

    for subject in subjects:
        course = subject.course
        if course:
            for student in course.students:
                if str(student.id) not in unique_students:
                    unique_students[str(student.id)] = StudentMiniModel(
                        id=str(student.id),
                        firstName=student.user.firstName,
                        lastName=student.user.lastName,
                        rollNo=student.rollNo,
                        courseName=course.name,
                        avatar=student.user.avatar
                    )

        for lecture in subject.lectures:
            all_lectures.append(
                LectureMiniModel(
                    id=str(lecture.id),
                    lectureTitle=lecture.lectureTitle,
                    subjectName=subject.name,
                    courseName=course.name if course else "Unknown",
                    startDate=lecture.startDate,
                    endDate=lecture.endDate
                )
            )

    # Sort lectures by start date
    all_lectures.sort(key=lambda x: x.startDate)

    return TeacherDashboardResponse(
        students=list(unique_students.values()),
        lectures=all_lectures
    )

async def retrieve_my_teachers(user_id: uuid.UUID, db: AsyncSession) -> List[TeacherResponseModel]:
    teachers = await fetch_my_teachers(user_id, db)
    return [_map_teacher_response(teacher) for teacher in teachers]
