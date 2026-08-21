from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from data.schemas import BlogPostStatus


class CategoryOut(BaseModel):
    id: str
    name: str

class TagOut(BaseModel):
    id: str
    name: str

class PostCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str]
    featuredImage: Optional[str]

    tagIds: List[str] = Field(default_factory=list)
    categoryIds: List[str] = Field(default_factory=list)

    metaTitle: Optional[str]
    metaDescription: Optional[str]


class PostOut(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    featuredImage: Optional[str]
    status: BlogPostStatus
    tagIds: List[str] = Field(default_factory=list)
    categoryIds: List[str] = Field(default_factory=list)
    tags: List[TagOut] = Field(default_factory=list)
    categories: List[CategoryOut] = Field(default_factory=list)
    metaTitle: Optional[str]
    metaDescription: Optional[str]
    createdAt: datetime
    updatedAt: datetime
    publishedAt: Optional[datetime]


class PostUpdateModel(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    featuredImage: Optional[str]
    status: BlogPostStatus
    tagIds: List[str] = Field(default_factory=list)
    categoryIds: List[str] = Field(default_factory=list)
    metaTitle: Optional[str]
    metaDescription: Optional[str]


class PaginationPostResponse(BaseModel):
    data: list[PostOut]
    record: int
    totalRecord: int
    page: int
    totalPages: int
