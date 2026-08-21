from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from data.schemas import AuthServiceProvider
from routers.courses.models import CourseResponseModel


class EntireStudentsInsightModel(BaseModel):
    totalStudents: int
    proStudents: int

class StudentInsightModel(BaseModel):
    firstName: str
    lastName: str
    email: str
    studentNumber: str
    parentNumber: Optional[str]
    parentName: Optional[str]
    board: Optional[str]
    schoolName: Optional[str]
    avatar: str
    createdAt: datetime
    lastLoginAt: Optional[datetime]
    deletedAt: Optional[datetime]
    authServiceProvider: AuthServiceProvider
    rollNo: Optional[str]
    standard: Optional[str]
    courses: list[tuple[str, str]]
    attendance: dict

class StudentResponseModel(BaseModel):
    id: str
    courses: list[CourseResponseModel]
    firstName: str
    lastName: str
    email: str
    authServiceProvider: AuthServiceProvider
    studentNumber: str
    parentNumber: Optional[str]
    parentName: Optional[str]
    board: Optional[str]
    schoolName: Optional[str]
    avatar: str
    createdAt: datetime
    lastLoginAt: Optional[datetime]
    deletedAt: Optional[datetime]
    rollNo: Optional[str]
    standard: Optional[str]

class StudentRequestModel(BaseModel):
    firstName: str
    lastName: str
    avatar: str
    email: str
    phone: str
    password: Optional[str] = None
    rollNo: Optional[str] = None
    courseIds: list[str]
    standard: Optional[str] = None
    board: Optional[str] = None
    schoolName: Optional[str] = None
    parentName: Optional[str] = None
    parentMobileNumber: Optional[str] = None

class StudentUpdateModel(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    phone: str
    avatar: str
    password: Optional[str] = None
    rollNo: Optional[str] = None
    courseIds: list[str]
    standard: Optional[str] = None
    board: Optional[str] = None
    schoolName: Optional[str] = None
    parentName: Optional[str] = None
    parentMobileNumber: Optional[str] = None

class PaginationStudentResponse(BaseModel):
    data: list[StudentResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int