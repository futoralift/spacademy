import math
import uuid
from typing import List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Subject, Course, Lecture
from routers.courses.models import SubjectResponseModel, SubjectRequestModel, CourseResponseModel, CourseRequestModel, \
    PaginationLectureResponse, LectureResponseModel, LectureRequestModel, BatchLectureRequestModel
from routers.courses.repo import fetch_subjects, insert_subject, set_subject, remove_subject, fetch_courses, \
    insert_course, set_course, remove_course, fetch_lectures, insert_lecture, set_lecture, remove_lecture, \
    fetch_teacher_lectures, fetch_student_lectures, fetch_student_subjects, fetch_teacher_subjects, fetch_course_by_id
from routers.students.repo import fetch_student_profile_by_user_id
from utils.models.common_models import UserModifyRequestModel


async def retrieve_all_subject(db: AsyncSession) -> List[SubjectResponseModel]:
    subjects_list = await fetch_subjects(db=db)
    return [
        SubjectResponseModel(
            id=str(subject.id),
            name=subject.name,
            teacherId=str(subject.teacherId),
            courseId=str(subject.courseId),
        )
        for subject in subjects_list
    ]

async def create_subject(subject_req: SubjectRequestModel, db: AsyncSession) -> SubjectResponseModel:
    subject = Subject(
        id=uuid.uuid4(),
        name=subject_req.name,
        courseId=subject_req.courseId,
        teacherId=subject_req.teacherId
    )

    new_subject = await insert_subject(subject, db)
    return SubjectResponseModel(
        id=str(new_subject.id),
        name=new_subject.name,
        courseId=str(new_subject.courseId),
        teacherId=str(new_subject.teacherId)
    )

async def modify_subject(updated_subject: UserModifyRequestModel, db: AsyncSession) -> SubjectResponseModel:
    modified_subject = await set_subject(updated_subject=updated_subject, db=db)
    return SubjectResponseModel(
        id=str(modified_subject.id),
        name=modified_subject.name,
        courseId=str(modified_subject.courseId),
        teacherId=str(modified_subject.teacherId)
    )

async def delete_subject(subject_id: str, db: AsyncSession) -> int:
    return await remove_subject(subject_id, db)

def sanitize_list(value: any) -> List[str]:
    if not value:
        return []
    if isinstance(value, list):
        # Even if it's a list, check if it's a list of single characters (corruption)
        # and if it has more than 10 single chars, it's likely a split string
        if len(value) > 1 and all(isinstance(x, str) and len(x) == 1 for x in value):
            return ["".join(value)]
        return [str(x) for x in value if x]
    if isinstance(value, str):
        # Handle Postgres array literal format {"item1", "item2"}
        if value.startswith("{") and value.endswith("}"):
            inner = value[1:-1]
            # Simple comma split (doesn't handle commas in quotes perfectly but better than character split)
            return [s.strip().strip('"') for s in inner.split(",") if s.strip()]
        return [value]
    return []

async def retrieve_all_courses(db: AsyncSession) -> List[CourseResponseModel]:
    courses_list = await fetch_courses(db=db)
    return [
        CourseResponseModel(
            id=str(course.id),
            name=course.name,
            isPaid=course.isPaid,
            highlights=sanitize_list(course.highlights),
            isActive=course.isActive,
            image=course.image,
            description=course.description,
            standards=sanitize_list(course.standards),
            mode=course.mode,
            amount=course.amount,
            currency=course.currency
    )
        for course in courses_list
    ]

async def create_course(course_uuid: UUID, course_req: CourseRequestModel, db: AsyncSession) -> CourseResponseModel:
    course = Course(
        id=course_uuid,
        name=course_req.name,
        description=course_req.description,
        standards=course_req.standards,
        image=course_req.image,
        highlights=course_req.highlights,
        isActive=course_req.isActive,
        isPaid=course_req.isPaid,
        mode=course_req.mode,
        amount=course_req.amount,
        currency=course_req.currency
    )

    new_course = await insert_course(course, db)

    return CourseResponseModel(
        id=str(new_course.id),
        name=new_course.name,
        isPaid=new_course.isPaid,
        highlights=sanitize_list(new_course.highlights),
        isActive=new_course.isActive,
        image=new_course.image,
        description=new_course.description,
        standards=sanitize_list(new_course.standards),
        mode=new_course.mode,
        amount=new_course.amount,
        currency=new_course.currency
    )

async def modify_course(updated_course: CourseResponseModel, db: AsyncSession) -> CourseResponseModel:
    modified_course = await set_course(updated_course=updated_course, db=db)
    return CourseResponseModel(
        id=str(modified_course.id),
        name=modified_course.name,
        isPaid=modified_course.isPaid,
        highlights=sanitize_list(modified_course.highlights),
        isActive=modified_course.isActive,
        image=modified_course.image,
        description=modified_course.description,
        standards=sanitize_list(modified_course.standards),
        mode=modified_course.mode,
        amount=modified_course.amount,
        currency=modified_course.currency
    )

async def delete_course(course_id: str, db: AsyncSession) -> int:
    return await remove_course(course_id, db)

async def retrieve_course_by_id(course_id: str, db: AsyncSession) -> CourseResponseModel:
    course = await fetch_course_by_id(course_id=course_id, db=db)
    if not course:
        return None
    return CourseResponseModel(
        id=str(course.id),
        name=course.name,
        isPaid=course.isPaid,
        highlights=sanitize_list(course.highlights),
        isActive=course.isActive,
        image=course.image,
        description=course.description,
        standards=sanitize_list(course.standards),
        mode=course.mode,
        amount=course.amount,
        currency=course.currency
    )


async def retrieve_all_lecture(limit: int, offset: int, db: AsyncSession) -> PaginationLectureResponse:
    lecture_list, total_records = await fetch_lectures(limit=limit, offset=offset, db=db)
    data =  [
        LectureResponseModel(
            id=str(lecture.id),
            lectureTitle=lecture.lectureTitle,
            startDate=lecture.startDate,
            endDate=lecture.endDate,
            subjectId=str(lecture.subjectId)
        )
        for lecture in lecture_list
    ]

    return PaginationLectureResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit),
    )

async def create_lecture(lecture_req: LectureRequestModel, db: AsyncSession) -> LectureResponseModel:
    lecture = Lecture(
        id=uuid.uuid4(),
        lectureTitle=lecture_req.lectureTitle,
        startDate=lecture_req.startDate,
        endDate=lecture_req.endDate,
        subjectId=lecture_req.subjectId
    )

    new_lecture = await insert_lecture(lecture, db)

    return LectureResponseModel(
        id=str(new_lecture.id),
        lectureTitle=new_lecture.lectureTitle,
        startDate=new_lecture.startDate,
        endDate=new_lecture.endDate,
        subjectId=str(new_lecture.subjectId),
    )


async def create_batch_lectures(batch_req: BatchLectureRequestModel, db: AsyncSession) -> List[LectureResponseModel]:
    results = []
    try:
        for lecture_req in batch_req.lectures:
            lecture = Lecture(
                id=uuid.uuid4(),
                lectureTitle=lecture_req.lectureTitle,
                startDate=lecture_req.startDate,
                endDate=lecture_req.endDate,
                subjectId=lecture_req.subjectId
            )
            db.add(lecture)
            results.append(lecture)
        
        await db.commit()
        
        return [
            LectureResponseModel(
                id=str(lecture.id),
                lectureTitle=lecture.lectureTitle,
                startDate=lecture.startDate,
                endDate=lecture.endDate,
                subjectId=str(lecture.subjectId),
            )
            for lecture in results
        ]
    except Exception as e:
        await db.rollback()
        raise e

async def modify_lecture(updated_lecture: LectureResponseModel, db: AsyncSession) -> LectureResponseModel:
    modified_lecture = await set_lecture(updated_lecture=updated_lecture, db=db)
    return LectureResponseModel(
        id=str(modified_lecture.id),
        lectureTitle=modified_lecture.lectureTitle,
        startDate=modified_lecture.startDate,
        endDate=modified_lecture.endDate,
        subjectId=str(modified_lecture.subjectId),
    )

async def delete_lecture(lecture_id: str, db: AsyncSession) -> int:
    return await remove_lecture(lecture_id, db)


async def retrieve_teacher_lectures(teacher_id: str, db: AsyncSession) -> List[LectureResponseModel]:
    lecture_list = await fetch_teacher_lectures(teacher_id, db=db)
    return [
        LectureResponseModel(
            id=str(lecture.id),
            lectureTitle=lecture.lectureTitle,
            startDate=lecture.startDate,
            endDate=lecture.endDate,
            subjectId=str(lecture.subjectId)
        )
        for lecture in lecture_list
    ]

async def retrieve_student_lectures(student_user_id: str, db: AsyncSession) -> List[LectureResponseModel]:
    student = await fetch_student_profile_by_user_id(student_user_id=student_user_id, db=db)

    lecture_list = await fetch_student_lectures(course_ids=[str(course.id) for course in student.courses], db=db)
    return [
        LectureResponseModel(
            id=str(lecture.id),
            lectureTitle=lecture.lectureTitle,
            subjectId=str(lecture.subjectId),
            startDate=lecture.startDate,
            endDate=lecture.endDate,
        )
        for lecture in lecture_list
    ]

async def retrieve_student_subjects(student_user_id: str, db: AsyncSession) -> List[SubjectResponseModel]:
    student = await fetch_student_profile_by_user_id(student_user_id=student_user_id, db=db)
    course_ids = [str(course.id) for course in student.courses]
    subject_list = await fetch_student_subjects(course_ids=course_ids, db=db)
    return [
        SubjectResponseModel(
            id=str(subject.id),
            name=subject.name,
            courseId=str(subject.courseId),
            teacherId=str(subject.teacherId)
        )
        for subject in subject_list
    ]

async def retrieve_teacher_subjects(teacher_id: str, db: AsyncSession) -> List[SubjectResponseModel]:
    subject_list = await fetch_teacher_subjects(teacher_id, db=db)
    return [
        SubjectResponseModel(
            id=str(subject.id),
            name=subject.name,
            courseId=str(subject.courseId),
            teacherId=str(subject.teacherId)
        )
        for subject in subject_list
    ]
