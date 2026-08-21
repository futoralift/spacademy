from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from routers.blog_taxonomy.models import (
    BlogTaxonomyResponseModel,
    CategoryCreateModel,
    CategoryResponseModel,
    TagCreateModel,
    TagResponseModel,
)
from routers.blog_taxonomy.service import create_category, create_tag, delete_category, delete_tag, retrieve_blog_taxonomies
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin


router = APIRouter(prefix="/blog-taxonomy", tags=["blog taxonomy"])


@router.get("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_blog_taxonomies(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> BlogTaxonomyResponseModel:
    return await retrieve_blog_taxonomies(db=db)


@router.post("/tag")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_tag(
    request: Request,
    tag_req: TagCreateModel,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> TagResponseModel:
    return await create_tag(tag_req=tag_req, db=db)


@router.post("/category")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_category(
    request: Request,
    category_req: CategoryCreateModel,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> CategoryResponseModel:
    return await create_category(category_req=category_req, db=db)


@router.delete("/tag")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_tag(
    request: Request,
    tag_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> int:
    return await delete_tag(tag_id=tag_id, db=db)


@router.delete("/category")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_category(
    request: Request,
    category_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin),
) -> int:
    return await delete_category(category_id=category_id, db=db)
