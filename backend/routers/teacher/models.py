from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from data.schemas import AuthServiceProvider
from routers.courses.models import CourseResponseModel, SubjectResponseModel


class TeacherResponseModel(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    phone: str
    avatar: str
    authServiceProvider: AuthServiceProvider
    createdAt: datetime
    lastLoginAt: Optional[datetime]
    deletedAt: Optional[datetime]
    courses: list[CourseResponseModel]
    subjects: list[SubjectResponseModel]


class PaginationTeacherResponse(BaseModel):
    data: list[TeacherResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int

class StudentMiniModel(BaseModel):
    id: str
    firstName: str
    lastName: str
    rollNo: Optional[str]
    courseName: str
    avatar: str


class LectureMiniModel(BaseModel):
    id: str
    lectureTitle: Optional[str] = None
    subjectName: str
    courseName: str
    startDate: datetime
    endDate: datetime


class TeacherDashboardResponse(BaseModel):
    students: list[StudentMiniModel]
    lectures: list[LectureMiniModel]
