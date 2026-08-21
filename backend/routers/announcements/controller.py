from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, Query, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from data.schemas import AnnouncementStatus, AnnouncementType
from routers.announcements.models import (
    AnnouncementCreate,
    AnnouncementOut,
    AnnouncementUpdate,
    PaginationAnnouncementResponse,
)
from routers.announcements.service import (
    create_announcement,
    delete_announcement,
    modify_announcement,
    retrieve_active_announcements,
    retrieve_all_announcements,
)
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("/public", response_model=PaginationAnnouncementResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_public_announcements(
    request: Request,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> PaginationAnnouncementResponse:
    return await retrieve_active_announcements(limit=limit, offset=offset, db=db)


@router.get("/", response_model=PaginationAnnouncementResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_announcements(
    request: Request,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> PaginationAnnouncementResponse:
    return await retrieve_all_announcements(limit=limit, offset=offset, db=db)


@router.post("/", response_model=AnnouncementOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_announcement(
    request: Request,
    title: str = Form(...),
    description: str | None = Form(None),
    start_date: datetime = Form(...),
    end_date: datetime = Form(...),
    status: AnnouncementStatus = Form(...),
    type: AnnouncementType = Form(AnnouncementType.PUBLIC),
    banner_image: UploadFile = File(...),
    _: UserModel = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AnnouncementOut:
    announcement_req = AnnouncementCreate(
        title=title,
        description=description,
        startDate=start_date,
        endDate=end_date,
        status=status,
        type=type,
    )
    return await create_announcement(announcement_req=announcement_req, banner_image=banner_image, db=db)


@router.put("/", response_model=AnnouncementOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_announcement(
    request: Request,
    announcement_id: str = Form(...),
    title: str = Form(...),
    description: str | None = Form(None),
    start_date: datetime = Form(...),
    end_date: datetime = Form(...),
    status: AnnouncementStatus = Form(...),
    type: AnnouncementType = Form(AnnouncementType.PUBLIC),
    banner_image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> AnnouncementOut:
    updated_announcement = AnnouncementUpdate(
        id=announcement_id,
        title=title,
        description=description,
        startDate=start_date,
        endDate=end_date,
        status=status,
        type=type,
    )
    return await modify_announcement(updated_announcement=updated_announcement, banner_image=banner_image, db=db)


@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_announcement(
    request: Request,
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> int:
    return await delete_announcement(announcement_id=announcement_id, db=db)
