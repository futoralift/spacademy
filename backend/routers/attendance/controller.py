from fastapi import APIRouter, Request, Query
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from routers.attendance.models import PaginationAttendanceResponse, \
    AttendanceRequestModel, AttendanceResponseModel, StudentAttendanceInfo
from routers.attendance.service import retrieve_all_attendance, create_attendance, modify_attendance, \
    delete_attendance, retrieve_lecture_attendance_info, retrieve_student_attendance_history
from routers.students.repo import fetch_student_profile_by_user_id
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_staff, get_current_student


router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.get("/", response_model=PaginationAttendanceResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_attendances(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> PaginationAttendanceResponse:
    return await retrieve_all_attendance(limit, offset, db)

@router.post("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_attendance(request: Request, attendance_req: AttendanceRequestModel, _: UserModel = Depends(get_current_staff), db: AsyncSession = Depends(get_db)) -> AttendanceResponseModel:
    return await create_attendance(attendance_req=attendance_req, db=db)

@router.put("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_attendance(request: Request, updated_attendance: AttendanceResponseModel, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> AttendanceResponseModel:
    return await modify_attendance(updated_attendance=updated_attendance, db=db)

@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_attendance(request: Request, attendance_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> int:
    return await delete_attendance(attendance_id=attendance_id, db=db)

@router.get("/lecture/{lecture_id}/students", response_model=list[StudentAttendanceInfo])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_lecture_attendance_info(request: Request, lecture_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> list[StudentAttendanceInfo]:
    return await retrieve_lecture_attendance_info(lecture_id=lecture_id, db=db)

@router.get("/me", response_model=list[AttendanceResponseModel])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_my_attendance_history(request: Request, db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_student)) -> list[AttendanceResponseModel]:
    student_profile = await fetch_student_profile_by_user_id(student_user_id=user.id, db=db)
    if not student_profile:
        return []
    return await retrieve_student_attendance_history(student_id=str(student_profile.id), db=db)
