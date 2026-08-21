from typing import List
from fastapi import APIRouter, Request, Query
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from routers.teacher.models import TeacherResponseModel, PaginationTeacherResponse, TeacherDashboardResponse
from routers.teacher.service import retrieve_all_teachers, create_teacher, modify_teacher, delete_teacher, retrieve_teacher_dashboard, retrieve_my_teachers
from utils.models.common_models import UserRequestModel, UserModifyRequestModel
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_staff, get_current_admin, get_current_student

router = APIRouter(prefix="/teacher", tags=["teacher"])


@router.get("/", response_model=PaginationTeacherResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_all_teachers(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), _: UserModel = Depends(get_current_staff), db: AsyncSession = Depends(get_db)) -> PaginationTeacherResponse:
    return await retrieve_all_teachers(limit=limit, offset=offset, db=db)


@router.post("/", response_model=TeacherResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_teacher(request: Request, teacher_req: UserRequestModel, _: UserModel = Depends(get_current_admin), db: AsyncSession = Depends(get_db)) -> TeacherResponseModel:
    return await create_teacher(teacher_req=teacher_req, db=db)


@router.put("/", response_model=TeacherResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_teacher(request: Request, updated_teacher: UserModifyRequestModel, _: UserModel = Depends(get_current_admin), db: AsyncSession = Depends(get_db)) -> TeacherResponseModel:
    return await modify_teacher(update_teacher=updated_teacher, db=db)


@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_teacher(request: Request, teacher_id: str, _: UserModel = Depends(get_current_admin), db: AsyncSession = Depends(get_db)) -> int:
    return await delete_teacher(teacher_id=teacher_id, db=db)


@router.get("/me", response_model=List[TeacherResponseModel])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_my_teachers(request: Request, user: UserModel = Depends(get_current_student), db: AsyncSession = Depends(get_db)) -> List[TeacherResponseModel]:
    return await retrieve_my_teachers(user_id=user.id, db=db)


@router.get("/dashboard", response_model=TeacherDashboardResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_teacher_dashboard(request: Request, user: UserModel = Depends(get_current_staff), db: AsyncSession = Depends(get_db)) -> TeacherDashboardResponse:
    return await retrieve_teacher_dashboard(teacher_id=str(user.id), db=db)
