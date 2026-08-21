import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class TestimonialBase(BaseModel):
    studentName: str
    content: str
    courseName: Optional[str] = None
    avatar: Optional[str] = None
    rating: int = 5
    isActive: bool = True


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(TestimonialBase):
    id: uuid.UUID


class TestimonialOut(TestimonialBase):
    id: uuid.UUID
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginationTestimonialResponse(BaseModel):
    data: List[TestimonialOut]
    record: int
    totalRecord: int
    page: int
    totalPages: int
