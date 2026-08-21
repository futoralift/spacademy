from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, Query, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from routers.learning_hub.models import (
    LearningHubVideoCreate,
    LearningHubVideoOut,
    LearningHubVideoUpdate,
    PaginationLearningHubVideoResponse,
)
from routers.learning_hub.service import (
    create_learning_hub_video,
    delete_learning_hub_video,
    modify_learning_hub_video,
    retrieve_all_learning_hub_videos,
    retrieve_published_learning_hub_videos,
)
from data.schemas import LearningHubVideoType
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin, get_current_staff, get_current_user

router = APIRouter(prefix="/learning_hub/videos", tags=["learning hub"])


@router.get("/public", response_model=PaginationLearningHubVideoResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_public_learning_hub_videos(
    request: Request,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    subject_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> PaginationLearningHubVideoResponse:
    return await retrieve_published_learning_hub_videos(limit=limit, offset=offset, db=db, subject_id=subject_id)


@router.get("/", response_model=PaginationLearningHubVideoResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_learning_hub_videos(
    request: Request,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    subject_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user),
) -> PaginationLearningHubVideoResponse:
    return await retrieve_all_learning_hub_videos(limit=limit, offset=offset, db=db, user=user, subject_id=subject_id)


@router.post("/", response_model=LearningHubVideoOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_learning_hub_video(
    request: Request,
    title: str = Form(...),
    youtube_link: str = Form(...),
    video_type: LearningHubVideoType = Form(...),
    publish_date: datetime = Form(...),
    subject_id: str | None = Form(None),
    thumbnail: UploadFile | None = File(None),
    user: UserModel = Depends(get_current_staff),
    db: AsyncSession = Depends(get_db),
) -> LearningHubVideoOut:
    video_req = LearningHubVideoCreate(
        title=title,
        youtubeLink=youtube_link,
        videoType=video_type,
        publishDate=publish_date,
        subjectId=subject_id,
    )
    return await create_learning_hub_video(video_req=video_req, thumbnail=thumbnail, db=db, user=user)


@router.put("/", response_model=LearningHubVideoOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_learning_hub_video(
    request: Request,
    video_id: str = Form(...),
    title: str = Form(...),
    youtube_link: str = Form(...),
    video_type: LearningHubVideoType = Form(...),
    publish_date: datetime = Form(...),
    subject_id: str | None = Form(None),
    thumbnail: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_staff),
) -> LearningHubVideoOut:
    updated_video = LearningHubVideoUpdate(
        id=video_id,
        title=title,
        youtubeLink=youtube_link,
        videoType=video_type,
        publishDate=publish_date,
        subjectId=subject_id,
    )
    return await modify_learning_hub_video(updated_video=updated_video, thumbnail=thumbnail, db=db, user=user)


@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_learning_hub_video(
    request: Request,
    video_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_staff),
) -> int:
    return await delete_learning_hub_video(video_id=video_id, db=db, user=user)
