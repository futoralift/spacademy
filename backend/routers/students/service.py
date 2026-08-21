import math
import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import AuthServiceProvider, UserRole, User, Student, Course
from routers.auth.repo_user import fetch_user_by_email
from routers.courses.models import CourseResponseModel
from routers.students.models import EntireStudentsInsightModel, StudentInsightModel, StudentResponseModel, \
    StudentRequestModel, StudentUpdateModel, PaginationStudentResponse
from routers.students.repo import fetch_all_students, fetch_all_students_of_teacher, insert_student_user, insert_student, fetch_student, set_student, \
    remove_student, fetch_entire_student_insights, fetch_student_attendance_insights, is_student_associated_with_teacher, fetch_teacher_student_insights
from utils.errors import ValidationError
from utils.models.common_models import UserResponseModel
from utils.security.hashing import get_password_hash
from utils.validation import normalize_phone


async def retrieve_all_student_users(limit: int, offset: int, db: AsyncSession) -> PaginationStudentResponse:
    users, total_records = await fetch_all_students(limit=limit, offset=offset, db=db)
    data = []
    for user in users:
        if user.student is None:
            continue
        student_courses = user.student.courses if user.student.courses else []
        
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
            for course in student_courses
        ]

        data.append(
            StudentResponseModel(
                id=str(user.id),
                firstName=user.firstName,
                lastName=user.lastName,
                email=user.email,
                avatar=user.avatar,
                studentNumber=user.phone,
                authServiceProvider=user.authServiceProvider,
                rollNo=user.student.rollNo,
                standard=user.student.standard,
                parentName=user.student.parentName,
                parentNumber=user.student.parentMobileNumber,
                board=user.student.board,
                schoolName=user.student.schoolName,
                createdAt=user.createdAt,
                deletedAt=user.deletedAt,
                lastLoginAt=user.lastLogIn,
                courses=mapped_courses
            )
        )
    

    return PaginationStudentResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0
    )

async def retrieve_all_student_of_teacher(teacher_id: str, limit: int, offset: int, db: AsyncSession) -> PaginationStudentResponse:
    users, total_records = await fetch_all_students_of_teacher(teacher_id=teacher_id, limit=limit, offset=offset, db=db)
    data = []
    for user in users:
        if user.student is None:
            continue
        student_courses = user.student.courses if user.student.courses else []
        
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
            for course in student_courses
        ]

        data.append(
            StudentResponseModel(
                id=str(user.id),
                firstName=user.firstName,
                lastName=user.lastName,
                email=user.email,
                avatar=user.avatar,
                studentNumber=user.phone,
                authServiceProvider=user.authServiceProvider,
                rollNo=user.student.rollNo,
                standard=user.student.standard,
                parentName=user.student.parentName,
                parentNumber=user.student.parentMobileNumber,
                board=user.student.board,
                schoolName=user.student.schoolName,
                createdAt=user.createdAt,
                deletedAt=user.deletedAt,
                lastLoginAt=user.lastLogIn,
                courses=mapped_courses
            )
        )

    return PaginationStudentResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0
    )

async def create_student(requester: UserRole, student_req: StudentRequestModel, db: AsyncSession) -> StudentResponseModel:
    auth_provider = AuthServiceProvider.ADMIN if requester == UserRole.ADMIN else AuthServiceProvider.TEACHER

    normalized_phone = normalize_phone(student_req.phone)
    if not normalized_phone:
        raise ValidationError(message="Invalid phone number format", details={"phone": student_req.phone})

    student_user = User(
        id=uuid.uuid4(),
        firstName=student_req.firstName.capitalize(),
        lastName=student_req.lastName.capitalize(),
        email=student_req.email,
        passwordHash=get_password_hash(student_req.password),
        phone=normalized_phone,
        createdAt=datetime.now(),
        authServiceProvider=auth_provider,
        avatar=student_req.avatar,
        role=UserRole.STUDENT,
    )

    new_student_user = await insert_student_user(db, student_user)

    courses_result = await db.execute(select(Course).where(Course.id.in_(student_req.courseIds)))
    courses = courses_result.scalars().all()

    normalized_parent_phone = normalize_phone(student_req.parentMobileNumber) if student_req.parentMobileNumber else None
    
    student = Student(
        id=uuid.uuid4(),
        rollNo=student_req.rollNo,
        standard=student_req.standard,
        schoolName=student_req.schoolName,
        board=student_req.board,
        parentName=student_req.parentName,
        parentMobileNumber=normalized_parent_phone,
        userId=new_student_user.id,
        courses=courses
    )

    await insert_student(db=db, student=student)

    return StudentResponseModel(
        id=str(new_student_user.id),
        firstName=new_student_user.firstName,
        lastName=new_student_user.lastName,
        email=new_student_user.email,
        studentNumber=new_student_user.phone,
        rollNo=student.rollNo,
        avatar=new_student_user.avatar,
        authServiceProvider=new_student_user.authServiceProvider,

        standard=student.standard,
        parentName=student.parentName,
        parentNumber=student.parentMobileNumber,
        board=student.board,
        schoolName=student.schoolName,
        createdAt=new_student_user.createdAt,
        deletedAt=new_student_user.deletedAt,
        lastLoginAt=new_student_user.lastLogIn,
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
            for course in courses
        ]
    )

async def modify_student(updated_student: StudentUpdateModel, db: AsyncSession) -> UserResponseModel:
    student = await fetch_student(updated_student.id, db=db)

    if student.role != UserRole.STUDENT:
        raise ValidationError(message=f"You don't have permission to modify {student.role}")

    modified_student = await set_student(updated_student=updated_student, db=db)

    return UserResponseModel(
        id=str(modified_student.id),
        firstName=modified_student.firstName,
        lastName=modified_student.lastName,
        email=modified_student.email,
        phone=modified_student.studentNumber, # studentNumber in response model is phone in User table
        avatar=modified_student.avatar,
        authServiceProvider=modified_student.authServiceProvider,
        role=UserRole.STUDENT,
    )

async def delete_student(student_user_id: str, db: AsyncSession) -> UserResponseModel:
    student = await fetch_student(student_user_id, db=db)
    if student.role != UserRole.STUDENT:
        raise ValidationError(message=f"You don't have permission to modify {student.role}", details={"user_id": student_user_id})
    return await remove_student(student_user_id, db)


async def retrieve_student_insight(student_user_id: str, db: AsyncSession) -> StudentInsightModel:
    student_user = await fetch_student(student_user_id, db=db)
    student = student_user.student
    student_courses = student.courses if student and student.courses else []

    attendance_record = await fetch_student_attendance_insights(student_data=(student.id, student_courses), db=db)

    return StudentInsightModel(
        firstName=student_user.firstName,
        lastName=student_user.lastName,
        email=student_user.email,
        studentNumber=student_user.phone,
        avatar=student_user.avatar,
        authServiceProvider=student_user.authServiceProvider,
        createdAt=student_user.createdAt,
        lastLoginAt=student_user.lastLogIn,
        deletedAt=student_user.deletedAt,

        parentName=student.parentName,
        parentNumber=student.parentMobileNumber,
        rollNo=student.rollNo,
        standard=student.standard,
        schoolName=student.schoolName,
        board=student.board,
        courses=[(str(course.id), course.name) for course in student_courses],

        attendance=attendance_record
    )

async def retrieve_entire_student_insights(db: AsyncSession) -> EntireStudentsInsightModel:
    return await fetch_entire_student_insights(db=db)

async def retrieve_student_insight_for_teacher(student_user_id: str, teacher_id: str, db: AsyncSession) -> StudentInsightModel:
    is_associated = await is_student_associated_with_teacher(student_user_id=student_user_id, teacher_id=teacher_id, db=db)
    if not is_associated:
        raise ValidationError(
            message="Unauthorized access to student insights",
            details={
                "student_user_id": student_user_id,
            }
        )
    return await retrieve_student_insight(student_user_id=student_user_id, db=db)

async def retrieve_student_insight_for_student(student_user_id: str, db: AsyncSession) -> StudentInsightModel:
    return await retrieve_student_insight(student_user_id=student_user_id, db=db)

async def retrieve_teacher_entire_student_insights(teacher_id: str, db: AsyncSession) -> EntireStudentsInsightModel:
    return await fetch_teacher_student_insights(teacher_id=teacher_id, db=db)
