from datetime import datetime

from pydantic import BaseModel

from data.schemas import LearningHubVideoType


class LearningHubVideoCreate(BaseModel):
    title: str
    youtubeLink: str
    videoType: LearningHubVideoType
    publishDate: datetime
    subjectId: str | None = None


class LearningHubVideoUpdate(BaseModel):
    id: str
    title: str
    youtubeLink: str
    videoType: LearningHubVideoType
    publishDate: datetime
    subjectId: str | None = None


class LearningHubVideoOut(BaseModel):
    id: str
    title: str
    youtubeLink: str
    youtubeVideoId: str
    videoType: LearningHubVideoType
    thumbnail: str | None
    publishDate: datetime
    createdAt: datetime
    updatedAt: datetime
    subjectId: str | None = None


class PaginationLearningHubVideoResponse(BaseModel):
    data: list[LearningHubVideoOut]
    record: int
    totalRecord: int
    page: int
    totalPages: int
