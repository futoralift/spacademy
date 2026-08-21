from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from data.schemas import CourseMode


class SubjectRequestModel(BaseModel):
    name: str
    teacherId: str | None = None
    courseId: str

class SubjectResponseModel(BaseModel):
    id: str
    name: str
    teacherId: str | None = None
    courseId: str

class CourseRequestModel(BaseModel):
    name: str
    description: str
    standards: list[str]
    image: str
    highlights: list[str]
    isActive: bool
    isPaid: bool
    mode: CourseMode
    amount: Optional[float]
    currency: str

class CourseResponseModel(BaseModel):
    id: str
    name: str
    description: str
    standards: list[str]
    image: str
    highlights: list[str]
    isActive: bool
    isPaid: bool
    mode: CourseMode
    amount: Optional[float]
    currency: str


class LectureResponseModel(BaseModel):
    id: str
    startDate: datetime
    endDate: datetime
    subjectId: str
    lectureTitle: Optional[str] = None


class LectureRequestModel(BaseModel):
    lectureTitle: Optional[str] = None
    subjectId: str
    startDate: datetime
    endDate: datetime


class BatchLectureRequestModel(BaseModel):
    lectures: list[LectureRequestModel]


class PaginationLectureResponse(BaseModel):
    data: list[LectureResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int