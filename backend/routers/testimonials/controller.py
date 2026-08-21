import uuid
from fastapi import APIRouter, Depends, Query, Request, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from data.schemas import MediaType
from routers.testimonials.models import (
    PaginationTestimonialResponse, 
    TestimonialCreate, 
    TestimonialOut, 
    TestimonialUpdate
)
from routers.testimonials.service import (
    retrieve_all_testimonials, 
    create_testimonial, 
    modify_testimonial, 
    delete_testimonial
)
from utils.const import RATE_LIMIT, StoragePath
from utils.files.store_n_register import store_n_register_media
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin


router = APIRouter(prefix="/testimonials", tags=["testimonials"])


@router.get("/", response_model=PaginationTestimonialResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_testimonials(
    request: Request, 
    limit: int = Query(15, ge=1, le=100), 
    offset: int = Query(0, ge=0), 
    db: AsyncSession = Depends(get_db)
) -> PaginationTestimonialResponse:
    return await retrieve_all_testimonials(limit, offset, db)


@router.post("/", response_model=TestimonialOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_testimonial(
    request: Request, 
    student_name: str = Form(...),
    content: str = Form(...),
    course_name: str | None = Form(None),
    rating: int = Form(5),
    is_active: bool = Form(True),
    file: UploadFile | None = File(None),
    _: UserModel = Depends(get_current_admin), 
    db: AsyncSession = Depends(get_db)
) -> TestimonialOut:
    testimonial_uuid = uuid.uuid4()
    avatar_path = None
    if file and file.filename:
        avatar_path = await store_n_register_media(
            uid=str(testimonial_uuid), 
            dir_path=StoragePath.TESTIMONIAL_DIR, 
            media_type=MediaType.TESTIMONIAL, 
            db=db, 
            file=file
        )
    
    testimonial_req = TestimonialCreate(
        studentName=student_name,
        content=content,
        courseName=course_name,
        rating=rating,
        isActive=is_active,
        avatar=avatar_path
    )
    
    return await create_testimonial(testimonial_req=testimonial_req, db=db)


@router.put("/", response_model=TestimonialOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_testimonial(
    request: Request, 
    id: uuid.UUID = Form(...),
    student_name: str = Form(...),
    content: str = Form(...),
    course_name: str | None = Form(None),
    rating: int = Form(5),
    is_active: bool = Form(True),
    file: UploadFile | None = File(None),
    _: UserModel = Depends(get_current_admin), 
    db: AsyncSession = Depends(get_db)
) -> TestimonialOut:
    avatar_path = None
    if file and file.filename:
        avatar_path = await store_n_register_media(
            uid=str(id), 
            dir_path=StoragePath.TESTIMONIAL_DIR, 
            media_type=MediaType.TESTIMONIAL, 
            db=db, 
            file=file
        )
    
    testimonial_req = TestimonialUpdate(
        id=id,
        studentName=student_name,
        content=content,
        courseName=course_name,
        rating=rating,
        isActive=is_active,
        avatar=avatar_path
    )
    
    return await modify_testimonial(updated_testimonial=testimonial_req, db=db)


@router.delete("/{testimonial_id}", response_model=int)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_testimonial(
    request: Request, 
    testimonial_id: uuid.UUID, 
    _: UserModel = Depends(get_current_admin), 
    db: AsyncSession = Depends(get_db)
) -> int:
    return await delete_testimonial(testimonial_id=testimonial_id, db=db)
