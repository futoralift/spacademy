import math
import uuid
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import LectureAttendance
from routers.students.repo import fetch_student_profile_by_user_id, fetch_student_by_id
from routers.attendance.models import PaginationAttendanceResponse, \
    AttendanceResponseModel, AttendanceRequestModel, StudentAttendanceInfo
from utils.errors import ValidationError
from routers.attendance.repo import fetch_attendance, set_attendance, insert_attendance, remove_attendance, \
    fetch_attendance_for_lecture, fetch_attendance_for_student
from routers.courses.repo import fetch_lecture_students


async def retrieve_all_attendance(limit: int, offset: int, db: AsyncSession) -> PaginationAttendanceResponse:
    attendance_list, total_records = await fetch_attendance(limit=limit, offset=offset, db=db)
    data =  [
        AttendanceResponseModel(
            id=str(attendance.id),
            status=attendance.status,
            studentId=str(attendance.studentId),
            lectureId=str(attendance.lectureId)
        )
        for attendance in attendance_list
    ]

    return PaginationAttendanceResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit),
    )

async def create_attendance(attendance_req: AttendanceRequestModel, db: AsyncSession) -> AttendanceResponseModel:
    # Try fetching by userId first, then by studentId
    student_profile = await fetch_student_profile_by_user_id(attendance_req.studentId, db=db)
    if student_profile is None:
        student_profile = await fetch_student_by_id(attendance_req.studentId, db=db)
    
    if student_profile is None:
        raise ValidationError(
            message="Student profile not found for attendance",
            details={"studentId": attendance_req.studentId},
        )

    attendance = LectureAttendance(
        id=uuid.uuid4(),
        status=attendance_req.status,
        studentId=student_profile.id,
        lectureId=attendance_req.lectureId,
    )

    new_attendance = await insert_attendance(attendance, db)

    return AttendanceResponseModel(
        id=str(new_attendance.id),
        status=new_attendance.status,
        studentId=str(new_attendance.studentId),
        lectureId=str(new_attendance.lectureId),
    )

async def modify_attendance(updated_attendance: AttendanceResponseModel, db: AsyncSession) -> AttendanceResponseModel:
    # Ensure the studentId is a valid student UUID (handle userId conversion if passed)
    student_profile = await fetch_student_profile_by_user_id(updated_attendance.studentId, db=db)
    if student_profile is None:
        student_profile = await fetch_student_by_id(updated_attendance.studentId, db=db)
    
    if student_profile is None:
        raise ValidationError(
            message="Student profile not found for attendance update",
            details={"studentId": updated_attendance.studentId},
        )
    
    # Use the real student UUID for the update
    updated_attendance.studentId = str(student_profile.id)
    
    modified_attendance = await set_attendance(updated_attendance=updated_attendance, db=db)
    return AttendanceResponseModel(
        id=str(modified_attendance.id),
        status=modified_attendance.status,
        studentId=str(modified_attendance.studentId),
        lectureId=str(modified_attendance.lectureId),
    )

async def delete_attendance(attendance_id: str, db: AsyncSession) -> int:
    return await remove_attendance(attendance_id, db)

async def retrieve_lecture_attendance_info(lecture_id: str, db: AsyncSession) -> List[StudentAttendanceInfo]:
    students = await fetch_lecture_students(lecture_id, db=db)
    attendance_records = await fetch_attendance_for_lecture(lecture_id, db=db)
    
    # Map attendance records by studentId for easy lookup
    attendance_map = {str(att.studentId): att for att in attendance_records}
    
    result = []
    for student in students:
        att = attendance_map.get(str(student.id))
        result.append(
            StudentAttendanceInfo(
                studentId=str(student.id), # Return the primary Student.id for accurate DB operations
                rollNo=student.rollNo,
                firstName=student.user.firstName,
                lastName=student.user.lastName,
                status=att.status if att else None,
                attendanceId=str(att.id) if att else None
            )
        )
    
    return result

async def retrieve_student_attendance_history(student_id: str, db: AsyncSession) -> List[AttendanceResponseModel]:
    attendance_records = await fetch_attendance_for_student(student_id=student_id, db=db)
    return [
        AttendanceResponseModel(
            id=str(record.id),
            status=record.status,
            studentId=str(record.studentId),
            lectureId=str(record.lectureId)
        )
        for record in attendance_records
    ]
