from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from data.schemas import AssignmentStatus


class AssignmentRequestModel(BaseModel):
    title: str
    description: Optional[str] = None
    lectureId: Optional[str] = None
    deadline: datetime
    mark: Optional[int] = None


class AssignmentResponseModel(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    lectureId: Optional[str] = None
    deadline: datetime
    mark: Optional[int] = None


class AssignmentUpdateModel(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    lectureId: Optional[str] = None
    deadline: datetime
    mark: Optional[int] = None


class PaginationAssignmentResponse(BaseModel):
    data: list[AssignmentResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int


class StudentAssignmentRequestModel(BaseModel):
    assignmentId: str
    studentId: str
    status: AssignmentStatus


class StudentAssignmentResponseModel(BaseModel):
    id: str
    assignmentId: str
    studentId: str
    status: AssignmentStatus
    filePath: str
    uploadAt: datetime


class StudentAssignmentUpdateModelByStudent(BaseModel):
    id: str
    assignmentId: str
    studentId: str
    status: AssignmentStatus

class StudentAssignmentUpdateModelByTeacher(BaseModel):
    studentAssignmentId: str
    status: AssignmentStatus

class PaginationStudentAssignmentResponse(BaseModel):
    data: list[StudentAssignmentResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int
