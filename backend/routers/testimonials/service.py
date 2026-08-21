import uuid
import math
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Testimonial
from routers.testimonials.models import (
    PaginationTestimonialResponse, 
    TestimonialOut, 
    TestimonialCreate, 
    TestimonialUpdate
)
from routers.testimonials.repo import (
    insert_testimonial, 
    fetch_testimonials, 
    fetch_testimonial_by_id, 
    set_testimonial, 
    remove_testimonial
)
from utils.errors import NotFoundError


async def retrieve_all_testimonials(limit: int, offset: int, db: AsyncSession) -> PaginationTestimonialResponse:
    testi_list, total_records = await fetch_testimonials(limit=limit, offset=offset, db=db)
    data = [TestimonialOut.model_validate(t) for t in testi_list]

    return PaginationTestimonialResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1 if limit > 0 else 1,
        totalPages=math.ceil(total_records / limit) if limit > 0 else 1,
    )


async def create_testimonial(testimonial_req: TestimonialCreate, db: AsyncSession) -> TestimonialOut:
    new_testimonial = Testimonial(
        studentName=testimonial_req.studentName,
        content=testimonial_req.content,
        courseName=testimonial_req.courseName,
        avatar=testimonial_req.avatar,
        rating=testimonial_req.rating,
        isActive=testimonial_req.isActive,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )
    
    saved_testimonial = await insert_testimonial(new_testimonial, db)
    return TestimonialOut.model_validate(saved_testimonial)


async def modify_testimonial(updated_testimonial: TestimonialUpdate, db: AsyncSession) -> TestimonialOut:
    testimonial = await fetch_testimonial_by_id(updated_testimonial.id, db)
    if testimonial is None:
        raise NotFoundError("Testimonial not found", details={"testimonialId": updated_testimonial.id})

    testimonial.studentName = updated_testimonial.studentName
    testimonial.content = updated_testimonial.content
    testimonial.courseName = updated_testimonial.courseName
    if updated_testimonial.avatar:
        testimonial.avatar = updated_testimonial.avatar
    testimonial.rating = updated_testimonial.rating
    testimonial.isActive = updated_testimonial.isActive
    testimonial.updatedAt = datetime.now()

    updated_testi = await set_testimonial(testimonial, db)
    return TestimonialOut.model_validate(updated_testi)


async def delete_testimonial(testimonial_id: uuid.UUID, db: AsyncSession) -> int:
    testimonial = await fetch_testimonial_by_id(testimonial_id, db)
    if testimonial is None:
        raise NotFoundError("Testimonial not found", details={"testimonialId": testimonial_id})

    return await remove_testimonial(testimonial_id, db)
