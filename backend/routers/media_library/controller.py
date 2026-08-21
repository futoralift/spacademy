from fastapi import APIRouter, Depends, File, Form, Query, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from data.schemas import MediaType
from routers.media_library.models import MediaAssetCreate, MediaAssetOut, MediaAssetUpdate, PaginationMediaAssetResponse
from routers.media_library.service import create_media_asset, delete_media_asset, modify_media_asset, retrieve_media_assets, sync_storage_media_assets
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin

router = APIRouter(prefix="/media_library", tags=["media library"])


@router.get("/", response_model=PaginationMediaAssetResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_media_assets(
    request: Request,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    media_type: MediaType | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> PaginationMediaAssetResponse:
    return await retrieve_media_assets(limit=limit, offset=offset, media_type=media_type, db=db)


@router.post("/", response_model=MediaAssetOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_media_asset(
    request: Request,
    title: str = Form(...),
    media_type: MediaType = Form(...),
    file: UploadFile = File(...),
    _: UserModel = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> MediaAssetOut:
    media_asset_req = MediaAssetCreate(title=title, mediaType=media_type)
    return await create_media_asset(media_asset_req=media_asset_req, file=file, db=db)


@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_media_asset(
    request: Request,
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> int:
    return await delete_media_asset(asset_id=asset_id, db=db)


@router.put("/", response_model=MediaAssetOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_media_asset(
    request: Request,
    asset_id: str = Form(...),
    title: str = Form(...),
    media_type: MediaType = Form(...),
    file: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> MediaAssetOut:
    updated_asset = MediaAssetUpdate(id=asset_id, title=title, mediaType=media_type)
    return await modify_media_asset(updated_asset=updated_asset, file=file, db=db)


@router.post("/sync")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def sync_media_assets(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> int:
    return await sync_storage_media_assets(db=db)
