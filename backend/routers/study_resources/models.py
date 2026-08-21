from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class StudyResourceRequestModel(BaseModel):
    title: str
    description: str
    lectureId: Optional[str] = None
    subjectId: str

class StudyResourceResponseModel(BaseModel):
    id: str
    title: str
    description: str
    lectureId: Optional[str] = None
    subjectId: str
    filePath: str
    uploadAt: datetime

class StudyResourceUpdateModel(BaseModel):
    id: str
    title: str
    description: str
    lectureId: Optional[str] = None
    subjectId: str

class PaginationStudyResourceResponse(BaseModel):
    data: list[StudyResourceResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int