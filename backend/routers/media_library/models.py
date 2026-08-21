from datetime import datetime

from pydantic import BaseModel

from data.schemas import MediaType


class MediaAssetCreate(BaseModel):
    title: str
    mediaType: MediaType


class MediaAssetUpdate(BaseModel):
    id: str
    title: str
    mediaType: MediaType


class MediaAssetOut(BaseModel):
    id: str
    title: str
    mediaType: MediaType
    originalFilename: str
    filePath: str
    contentType: str | None
    createdAt: datetime
    updatedAt: datetime


class PaginationMediaAssetResponse(BaseModel):
    data: list[MediaAssetOut]
    record: int
    totalRecord: int
    page: int
    totalPages: int
