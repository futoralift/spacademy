from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from routers.settings.models import SiteSettingsOut, SiteSettingsUpdate
from routers.settings.service import modify_site_settings, retrieve_site_settings
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=SiteSettingsOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_site_settings(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> SiteSettingsOut:
    return await retrieve_site_settings(db=db)


@router.put("/", response_model=SiteSettingsOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_site_settings(
    request: Request,
    updated_settings: SiteSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> SiteSettingsOut:
    return await modify_site_settings(updated_settings=updated_settings, db=db)
