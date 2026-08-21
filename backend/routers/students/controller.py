from typing import Optional

from fastapi import APIRouter, Request, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from routers.students.models import StudentRequestModel, StudentUpdateModel, PaginationStudentResponse, \
    StudentResponseModel, StudentInsightModel
from routers.students.service import create_student, modify_student, delete_student, retrieve_all_student_users, \
    retrieve_student_insight, retrieve_entire_student_insights, retrieve_all_student_of_teacher, \
    retrieve_student_insight_for_teacher, retrieve_teacher_entire_student_insights, retrieve_student_insight_for_student
from utils.const import RATE_LIMIT
from utils.models.common_models import UserResponseModel
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_staff, get_current_admin, get_current_teacher, get_current_student

router = APIRouter(prefix="/student", tags=["student"])

@router.get("/", response_model=PaginationStudentResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_all_students(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), _: UserModel = Depends(get_current_staff), db: AsyncSession = Depends(get_db)) -> PaginationStudentResponse:
    return await retrieve_all_student_users(limit=limit, offset=offset, db=db)

@router.get("/teacher", response_model=PaginationStudentResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_all_students_of_a_teacher(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), user: UserModel = Depends(get_current_teacher), db: AsyncSession = Depends(get_db)) -> PaginationStudentResponse:
    return await retrieve_all_student_of_teacher(teacher_id=str(user.id), limit=limit, offset=offset, db=db)

@router.post("/", response_model=StudentResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_student(request: Request, student_req: StudentRequestModel, requester: UserModel = Depends(get_current_staff), db: AsyncSession = Depends(get_db)) -> StudentResponseModel:
    return await create_student(requester=requester.role, student_req=student_req, db=db)

@router.put("/", response_model=UserResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_student(request: Request, updated_student: StudentUpdateModel, _: UserModel = Depends(get_current_staff), db: AsyncSession = Depends(get_db)) -> UserResponseModel:
    return await modify_student(updated_student=updated_student, db=db)

@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_student(request: Request, student_user_id: str, _: UserModel = Depends(get_current_staff), db: AsyncSession = Depends(get_db)) -> int:
    return await delete_student(student_user_id=student_user_id, db=db)


@router.get("/insights")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_insights(request: Request, student_user_id: Optional[str] = None, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)):
    if student_user_id:
        return await retrieve_student_insight(student_user_id=student_user_id, db=db)
    else:
        return await retrieve_entire_student_insights(db=db)

@router.get("/insights/teacher")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_teacher_insights(request: Request, student_user_id: Optional[str] = None, db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_teacher)):
    if student_user_id:
        return await retrieve_student_insight_for_teacher(student_user_id=student_user_id, teacher_id=str(user.id), db=db)
    else:
        return await retrieve_teacher_entire_student_insights(teacher_id=str(user.id), db=db)

@router.get("/insights/me", response_model=StudentInsightModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_student_insight(request: Request, db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_student)) -> StudentInsightModel:
    return await retrieve_student_insight_for_student(student_user_id=user.id, db=db)
