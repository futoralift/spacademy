from typing import List, Optional
from fastapi import APIRouter, Request, Query, Depends, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from data.schemas import BlogPostStatus
from routers.blog.models import PaginationPostResponse, PostCreate, PostOut, PostUpdateModel
from routers.blog.service import retrieve_all_post, create_post, modify_post, delete_post, retrieve_public_posts, \
    retrieve_post_by_id
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin


router = APIRouter(prefix="/post", tags=["post"])

@router.get("/", response_model=PaginationPostResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_posts(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> PaginationPostResponse:
    return await retrieve_all_post(limit, offset, db)

@router.get("/public", response_model=PaginationPostResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_public_posts(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db)) -> PaginationPostResponse:
    return await retrieve_public_posts(limit, offset, db)

@router.get("/public/{post_id}", response_model=PostOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_public_post(request: Request, post_id: str, db: AsyncSession = Depends(get_db)) -> PostOut:
    return await retrieve_post_by_id(post_id, db)

@router.post("/", response_model=PostOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_post(
    request: Request,
    title: str = Form(...),
    content: str = Form(...),
    excerpt: Optional[str] = Form(None),
    tag_ids: List[str] = Form([]),
    category_ids: List[str] = Form([]),
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    featured_image: UploadFile | None = File(None),
    _: UserModel = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
) -> PostOut:
    post_req = PostCreate(
        title=title,
        content=content,
        excerpt=excerpt,
        tagIds=tag_ids,
        categoryIds=category_ids,
        metaTitle=meta_title,
        metaDescription=meta_description,
        featuredImage=None
    )
    return await create_post(post_req=post_req, thumbnail=featured_image, db=db)

@router.put("/", response_model=PostOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_post(
    request: Request,
    post_id: str = Form(...),
    title: str = Form(...),
    slug: str = Form(...),
    content: str = Form(...),
    status: BlogPostStatus = Form(...),
    excerpt: Optional[str] = Form(None),
    tag_ids: List[str] = Form([]),
    category_ids: List[str] = Form([]),
    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    featured_image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_admin)
) -> PostOut:
    updated_post = PostUpdateModel(
        id=post_id,
        title=title,
        slug=slug,
        content=content,
        status=status,
        excerpt=excerpt,
        tagIds=tag_ids,
        categoryIds=category_ids,
        metaTitle=meta_title,
        metaDescription=meta_description,
        featuredImage=None
    )
    return await modify_post(updated_post=updated_post, thumbnail=featured_image, db=db)

@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_post(request: Request, post_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_admin)) -> int:
    return await delete_post(post_id=post_id, db=db)
