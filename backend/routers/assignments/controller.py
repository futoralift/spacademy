import uuid
from typing import Optional, Union

from fastapi import APIRouter, File, Form, Query, Request, UploadFile
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from data.schemas import AssignmentStatus, UserRole
from data.schemas import MediaType
from routers.media_library.service import register_external_media_asset
from routers.assignments.models import (
    AssignmentRequestModel,
    AssignmentResponseModel,
    AssignmentUpdateModel,
    PaginationAssignmentResponse,
    PaginationStudentAssignmentResponse,
    StudentAssignmentRequestModel,
    StudentAssignmentResponseModel,
    StudentAssignmentUpdateModelByStudent, StudentAssignmentUpdateModelByTeacher,
)
from routers.assignments.service import (
    create_assignment,
    create_student_assignment,
    delete_assignment,
    delete_student_assignment,
    modify_assignment,
    modify_student_assignment,
    retrieve_all_assignment,
    retrieve_all_student_assignment, retrieve_student_assignment, modify_student_assignment_status,
    retrieve_all_assignment_by_student, retrieve_assignment_submissions
)
from routers.students.repo import fetch_student_profile_by_user_id
from utils.const import RATE_LIMIT, StoragePath
from utils.files.file_handler import store_file
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_staff, get_current_user, get_current_student

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/", response_model=PaginationAssignmentResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_assignments(
    request: Request,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user),
) -> PaginationAssignmentResponse:
    if user.role == UserRole.STUDENT:
        return await retrieve_all_assignment_by_student(user_id=user.id, limit=limit, offset=offset, db=db)
    else:
        return await retrieve_all_assignment(limit=limit, offset=offset, db=db)


@router.post("/", response_model=AssignmentResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_assignment(
    request: Request,
    assignment_req: AssignmentRequestModel,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_staff),
) -> AssignmentResponseModel:
    return await create_assignment(assignment_req=assignment_req, db=db)


@router.put("/", response_model=AssignmentResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_assignment(
    request: Request,
    updated_assignment_req: AssignmentUpdateModel,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_staff),
) -> AssignmentResponseModel:
    return await modify_assignment(updated_assignment=updated_assignment_req, db=db)


@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_assignment(
    request: Request,
    assignment_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_staff),
) -> int:
    return await delete_assignment(assignment_id=assignment_id, db=db)


@router.get("/submissions", response_model=Union[PaginationStudentAssignmentResponse, list[StudentAssignmentResponseModel]])
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_student_assignments(
    request: Request,
    student_id: Optional[str] = None,
    assignment_id: Optional[str] = None,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user),
) -> Union[PaginationStudentAssignmentResponse, StudentAssignmentResponseModel]:
    if user.role == UserRole.STUDENT:
        student = await fetch_student_profile_by_user_id(student_user_id=user.id, db=db)
        return await retrieve_student_assignment(student_id=student.id, db=db)
    else:
        if student_id:
            return await retrieve_student_assignment(student_id=student_id, db=db)
        if assignment_id:
            return await retrieve_assignment_submissions(assignment_id=assignment_id, db=db)
        return await retrieve_all_student_assignment(limit=limit, offset=offset, db=db)


@router.post("/submissions", response_model=StudentAssignmentResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_student_assignment(
    request: Request,
    assignment_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    student_user: UserModel = Depends(get_current_student),
) -> StudentAssignmentResponseModel:
    student = await fetch_student_profile_by_user_id(student_user_id=student_user.id, db=db)

    student_assignment_req = StudentAssignmentRequestModel(
        assignmentId=assignment_id,
        studentId=str(student.id),
        status=AssignmentStatus.PENDING,
    )
    submission_id = uuid.uuid4()
    file_path = await store_file(dir_path=StoragePath.ASSIGNMENT_DIR, uid=submission_id, file=file)
    submission = await create_student_assignment(
        submission_id=submission_id,
        file_path=file_path,
        student_assignment_req=student_assignment_req,
        db=db,
    )
    await register_external_media_asset(
        file_path=file_path,
        title=f"Assignment Submission {assignment_id}",
        media_type=MediaType.ASSIGNMENT,
        original_filename=file.filename,
        content_type=file.content_type,
        db=db,
    )
    return submission


@router.put("/submissions", response_model=StudentAssignmentResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_student_assignment(
    request: Request,
    submission_id: str = Form(...),
    assignment_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    student_user: UserModel = Depends(get_current_student),
) -> StudentAssignmentResponseModel:
    student = await fetch_student_profile_by_user_id(student_user_id=student_user.id, db=db)
    updated_student_assignment = StudentAssignmentUpdateModelByStudent(
        id=submission_id,
        assignmentId=assignment_id,
        studentId=str(student.id),
        status=AssignmentStatus.PENDING,
    )
    return await modify_student_assignment(updated_student_assignment=updated_student_assignment, file=file, db=db)


@router.put("/submissions/status", response_model=StudentAssignmentResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_student_assignment(
    request: Request,
    updated_status_req: StudentAssignmentUpdateModelByTeacher,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_staff),
) -> StudentAssignmentResponseModel:
    return await modify_student_assignment_status(updated_status_req=updated_status_req, db=db)


@router.delete("/submissions")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_student_assignment(
    request: Request,
    submission_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_user),
) -> int:
    return await delete_student_assignment(student_assignment_id=submission_id, db=db)
