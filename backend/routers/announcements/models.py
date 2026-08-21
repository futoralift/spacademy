from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from data.schemas import AnnouncementStatus, AnnouncementType


class AnnouncementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    startDate: datetime
    endDate: datetime
    status: AnnouncementStatus
    type: AnnouncementType


class AnnouncementUpdate(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    startDate: datetime
    endDate: datetime
    status: AnnouncementStatus
    type: AnnouncementType


class AnnouncementOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    bannerImage: str
    startDate: datetime
    endDate: datetime
    status: AnnouncementStatus
    type: AnnouncementType
    createdAt: datetime
    updatedAt: datetime


class PaginationAnnouncementResponse(BaseModel):
    data: list[AnnouncementOut]
    record: int
    totalRecord: int
    page: int
    totalPages: int
