from typing import List

from pydantic import BaseModel


class TagCreateModel(BaseModel):
    name: str


class TagResponseModel(BaseModel):
    id: str
    name: str
    slug: str


class CategoryCreateModel(BaseModel):
    name: str


class CategoryResponseModel(BaseModel):
    id: str
    name: str
    slug: str


class BlogTaxonomyResponseModel(BaseModel):
    tags: List[TagResponseModel]
    categories: List[CategoryResponseModel]
