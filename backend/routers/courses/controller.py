import uuid
from typing import List

from fastapi import APIRouter, Depends, Request, Query, Form, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from data.schemas import UserRole, CourseMode, MediaType
from routers.courses.models import LectureResponseModel, CourseResponseModel, CourseRequestModel, SubjectRequestModel, \
    SubjectResponseModel, PaginationLectureResponse, LectureRequestModel, BatchLectureRequestModel
from routers.courses.service import retrieve_teacher_lectures, retrieve_all_courses, create_course, modify_course, \
    delete_course, retrieve_all_subject, create_subject, modify_subject, delete_subject, retrieve_all_lecture, \
    create_lecture, modify_lecture, delete_lecture, retrieve_student_lectures, retrieve_student_subjects, \
    retrieve_teacher_subjects, create_batch_lectures, retrieve_course_by_id
from utils.const import RATE_LIMIT, StoragePath
from utils.files.store_n_register import store_n_register_media
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin, get_current_user

router = APIRouter(prefix="/courses", tags=["courses"])

# Subject Routes (Static paths must come before dynamic course_id)
@router.get("/subject")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_subject(request: Request, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> List[SubjectResponseModel]:
    return await retrieve_all_subject(db=db)

@router.post("/subject")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_subject(request: Request, subject_req: SubjectRequestModel, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> SubjectResponseModel:
    return await create_subject(subject_req=subject_req, db=db)

@router.put("/subject")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_subject(request: Request, updated_subject: SubjectResponseModel, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> SubjectResponseModel:
    return await modify_subject(updated_subject=updated_subject, db=db)

@router.delete("/subject")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_subject(request: Request, subject_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> int:
    return await delete_subject(subject_id=subject_id, db=db)

@router.get("/subjects/me")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_my_subjects(request: Request, user: UserModel = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> List[SubjectResponseModel]:
    if user.role == UserRole.STUDENT:
        return await retrieve_student_subjects(student_user_id=user.id, db=db)
    return await retrieve_teacher_subjects(user.id, db=db)

# Lecture Routes
@router.get("/lecture", response_model=PaginationLectureResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_lectures(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> PaginationLectureResponse:
    return await retrieve_all_lecture(limit, offset, db)

@router.post("/lecture")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_lecture(request: Request, lecture_req: LectureRequestModel, _: UserModel = Depends(get_current_admin), db: AsyncSession = Depends(get_db)) -> LectureResponseModel:
    return await create_lecture(lecture_req=lecture_req, db=db)

@router.post("/lecture/batch")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_batch_lecture(request: Request, batch_req: BatchLectureRequestModel, _: UserModel = Depends(get_current_admin), db: AsyncSession = Depends(get_db)) -> List[LectureResponseModel]:
    return await create_batch_lectures(batch_req=batch_req, db=db)

@router.put("/lecture")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_lecture(request: Request, updated_lecture: LectureResponseModel, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> LectureResponseModel:
    return await modify_lecture(updated_lecture=updated_lecture, db=db)

@router.delete("/lecture")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_lecture(request: Request, lecture_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> int:
    return await delete_lecture(lecture_id=lecture_id, db=db)

@router.get("/lecture/me")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_my_lectures(request: Request, user: UserModel = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> List[LectureResponseModel]:
    if user.role == UserRole.STUDENT:
        return await retrieve_student_lectures(student_user_id=user.id, db=db)
    return await retrieve_teacher_lectures(user.id, db=db)

# Course Routes
@router.get("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_course(request: Request, db: AsyncSession = Depends(get_db)) -> List[CourseResponseModel]:
    return await retrieve_all_courses(db=db)

@router.post("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_course(
        request: Request,
        name: str = Form(...),
        description: str = Form(...),
        mode: CourseMode = Form(...),
        image: UploadFile = File(),
        amount: float = Form(...),
        currency: str = Form(...),
        standards: List[str] = Form(...),
        highlights: List[str] = Form(...),
        is_paid: bool = Form(...),
        is_active: bool = Form(...),
        db: AsyncSession = Depends(get_db),
        _: UserModel = Depends(get_current_admin)
) -> CourseResponseModel:
    course_uuid = uuid.uuid4()
    image_path = await store_n_register_media(uid=str(course_uuid), dir_path=StoragePath.COURSE_DIR, media_type=MediaType.COURSE, db=db, file=image)
    course_req = CourseRequestModel(
        name=name,
        description=description,
        mode=mode,
        image=image_path,
        amount=amount,
        currency=currency,
        standards=standards,
        highlights=highlights,
        isPaid=is_paid,
        isActive=is_active
    )
    return await create_course(course_uuid=course_uuid, course_req=course_req, db=db)

@router.put("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_course(
    request: Request,
    id: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    mode: CourseMode = Form(...),
    image: UploadFile = File(None),
    amount: float = Form(...),
    currency: str = Form(...),
    standards: List[str] = Form(...),
    highlights: List[str] = Form(...),
    is_paid: bool = Form(...),
    is_active: bool = Form(...),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin)
) -> CourseResponseModel:
    image_path = None
    if image and image.filename:
        image_path = await store_n_register_media(uid=id, dir_path=StoragePath.COURSE_DIR, media_type=MediaType.COURSE, db=db, file=image)
    
    updated_course = CourseResponseModel(
        id=id,
        name=name,
        description=description,
        mode=mode,
        image=image_path if image_path else "",
        amount=amount,
        currency=currency,
        standards=standards,
        highlights=highlights,
        isPaid=is_paid,
        isActive=is_active
    )
    return await modify_course(updated_course=updated_course, db=db)

@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_course(request: Request, course_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> int:
    return await delete_course(course_id=course_id, db=db)

# Dynamic ID routes must remain at the bottom
@router.get("/{course_id}")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_course_by_id(request: Request, course_id: str, db: AsyncSession = Depends(get_db)) -> CourseResponseModel:
    return await retrieve_course_by_id(course_id=course_id, db=db)
