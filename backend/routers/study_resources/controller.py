import uuid
from typing import Optional

from fastapi import APIRouter, Request, Query, Depends, Form, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from data.schemas import MediaType
from routers.media_library.service import register_external_media_asset
from routers.study_resources.models import PaginationStudyResourceResponse, StudyResourceResponseModel, \
    StudyResourceRequestModel, StudyResourceUpdateModel
from routers.study_resources.service import create_study_resource, modify_study_resource, delete_study_resource, \
    retrieve_all_study_resource
from utils.const import RATE_LIMIT, StoragePath
from utils.files.file_handler import store_file
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_staff, get_current_user

router = APIRouter(prefix="/study_resource", tags=["study resource"])

@router.get("/", response_model=PaginationStudyResourceResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_study_resources(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_user)) -> PaginationStudyResourceResponse:
    return await retrieve_all_study_resource(limit, offset, db, user)

@router.post("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_study_resource(
    request: Request,
    title: str = Form(...),
    description: str = Form(...),
    subject_id: str = Form(...),
    file: UploadFile = File(...),
    lecture_id: Optional[str] = Form(None),
    user: UserModel = Depends(get_current_staff),
    db: AsyncSession = Depends(get_db)
) -> StudyResourceResponseModel:
    study_resource_req = StudyResourceRequestModel(
        title=title,
        description=description,
        lectureId=lecture_id,
        subjectId=subject_id,
    )
    sr_id = uuid.uuid4()
    file_path = await store_file(dir_path=StoragePath.SRES_DIR, uid=sr_id, file=file)
    study_resource = await create_study_resource(sr_id=sr_id, file_path=file_path, study_resource_req=study_resource_req, db=db, user=user)
    await register_external_media_asset(
        file_path=file_path,
        title=title,
        media_type=MediaType.STUDY_RESOURCE,
        original_filename=file.filename,
        content_type=file.content_type,
        db=db,
    )
    return study_resource

@router.put("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_study_resource(
    request: Request,
    sr_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    subject_id: str = Form(...),
    file: UploadFile = File(...),
    lecture_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_staff)
) -> StudyResourceResponseModel:
    updated_study_resource = StudyResourceUpdateModel(
        id=sr_id,
        title=title,
        description=description,
        lectureId=lecture_id,
        subjectId=subject_id,
    )
    return await modify_study_resource(file=file, updated_study_resource=updated_study_resource, db=db, user=user)

@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_study_resource(request: Request, study_resource_id: str, db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_staff)) -> int:
    return await delete_study_resource(study_resource_id=study_resource_id, db=db, user=user)
