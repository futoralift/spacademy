from typing import Optional
from pydantic import BaseModel

from data.schemas import AttendanceStatus


class AttendanceRequestModel(BaseModel):
    status: AttendanceStatus
    studentId: str
    lectureId: str

class AttendanceResponseModel(BaseModel):
    id: str
    status: AttendanceStatus
    studentId: str
    lectureId: str

class PaginationAttendanceResponse(BaseModel):
    data: list[AttendanceResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int

class StudentAttendanceInfo(BaseModel):
    studentId: str
    rollNo: str
    firstName: str
    lastName: str
    status: Optional[AttendanceStatus] = None
    attendanceId: Optional[str] = None