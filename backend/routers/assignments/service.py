import math
import uuid
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Assignments, StudentAssignments
from data.schemas import MediaType
from routers.media_library.asset_manager import delete_registered_media_asset_by_path, replace_media_asset
from routers.assignments.models import (
    AssignmentRequestModel,
    AssignmentResponseModel,
    AssignmentUpdateModel,
    PaginationAssignmentResponse,
    PaginationStudentAssignmentResponse,
    StudentAssignmentRequestModel,
    StudentAssignmentResponseModel,
    StudentAssignmentUpdateModelByStudent, StudentAssignmentUpdateModelByTeacher,
)
from routers.assignments.repo import (
    fetch_all_assignment,
    fetch_all_student_assignment,
    fetch_assignment,
    fetch_student_assignment,
    insert_assignment,
    insert_student_assignment,
    remove_assignment,
    remove_student_assignment,
    set_assignment,
    set_student_assignment, fetch_student_assignment_by_student_id, set_student_assignment_status,
    fetch_all_assignment_by_student,
    fetch_student_assignments_by_assignment_id,
)


async def retrieve_assignment_submissions(assignment_id: str, db: AsyncSession) -> list[StudentAssignmentResponseModel]:
    submissions = await fetch_student_assignments_by_assignment_id(assignment_id=assignment_id, db=db)
    return [
        StudentAssignmentResponseModel(
            id=str(submission.id),
            studentId=str(submission.studentId),
            assignmentId=str(submission.assignmentId),
            status=submission.status,
            filePath=submission.filePath,
            uploadAt=submission.uploadAt,
        )
        for submission in submissions
    ]
from routers.students.repo import fetch_student_profile_by_user_id
from utils.const import StoragePath
from utils.errors import NotFoundError
from utils.files.file_handler import delete_file, store_file


async def retrieve_all_assignment(limit: int, offset: int, db: AsyncSession) -> PaginationAssignmentResponse:
    assignment_list, total_records = await fetch_all_assignment(limit=limit, offset=offset, db=db)

    data = [
        AssignmentResponseModel(
            id=str(assignment.id),
            title=assignment.title,
            description=assignment.description,
            lectureId=str(assignment.lectureId) if assignment.lectureId is not None else None,
            deadline=assignment.deadline,
            mark=assignment.mark,
        )
        for assignment in assignment_list
    ]

    return PaginationAssignmentResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )

async def retrieve_all_assignment_by_student(user_id: str, limit: int, offset: int, db: AsyncSession) -> PaginationAssignmentResponse:
    student = await fetch_student_profile_by_user_id(user_id, db)
    course_ids = [str(course.id) for course in student.courses]
    assignment_list, total_records = await fetch_all_assignment_by_student(course_ids=course_ids, limit=limit, offset=offset, db=db)

    data = [
        AssignmentResponseModel(
            id=str(assignment.id),
            title=assignment.title,
            description=assignment.description,
            lectureId=str(assignment.lectureId) if assignment.lectureId is not None else None,
            deadline=assignment.deadline,
            mark=assignment.mark,
        )
        for assignment in assignment_list
    ]

    return PaginationAssignmentResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def create_assignment(assignment_req: AssignmentRequestModel, db: AsyncSession) -> AssignmentResponseModel:
    assignment = Assignments(
        id=uuid.uuid4(),
        title=assignment_req.title,
        description=assignment_req.description,
        lectureId=assignment_req.lectureId,
        deadline=assignment_req.deadline,
        mark=assignment_req.mark,
    )

    new_assignment = await insert_assignment(assignment, db)

    return AssignmentResponseModel(
        id=str(new_assignment.id),
        title=new_assignment.title,
        description=new_assignment.description,
        lectureId=str(new_assignment.lectureId) if new_assignment.lectureId is not None else None,
        deadline=new_assignment.deadline,
        mark=new_assignment.mark,
    )


async def modify_assignment(updated_assignment: AssignmentUpdateModel, db: AsyncSession) -> AssignmentResponseModel:
    assignment = await fetch_assignment(updated_assignment.id, db)
    if assignment is None:
        raise NotFoundError("Assignment not found", details={"assignmentId": updated_assignment.id})

    modified_assignment = await set_assignment(updated_assignment=updated_assignment, db=db)

    return AssignmentResponseModel(
        id=str(modified_assignment.id),
        title=modified_assignment.title,
        description=modified_assignment.description,
        lectureId=str(modified_assignment.lectureId) if modified_assignment.lectureId is not None else None,
        deadline=modified_assignment.deadline,
        mark=modified_assignment.mark,
    )


async def delete_assignment(assignment_id: str, db: AsyncSession) -> int:
    assignment = await fetch_assignment(assignment_id, db)
    if assignment is None:
        raise NotFoundError("Assignment not found", details={"assignmentId": assignment_id})

    return await remove_assignment(assignment_id, db)


async def retrieve_all_student_assignment(limit: int, offset: int, db: AsyncSession) -> PaginationStudentAssignmentResponse:
    student_assignment_list, total_records = await fetch_all_student_assignment(limit=limit, offset=offset, db=db)

    data = [
        StudentAssignmentResponseModel(
            id=str(student_assignment.id),
            assignmentId=str(student_assignment.assignmentId),
            studentId=str(student_assignment.studentId),
            status=student_assignment.status,
            filePath=student_assignment.filePath,
            uploadAt=student_assignment.uploadAt,
        )
        for student_assignment in student_assignment_list
    ]

    return PaginationStudentAssignmentResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )

async def retrieve_student_assignment(student_id: str, db: AsyncSession) -> list[StudentAssignmentResponseModel]:
    student_submissions = await fetch_student_assignment_by_student_id(student_id=student_id, db=db)
    return [
        StudentAssignmentResponseModel(
            id=str(submission.id),
            studentId=str(submission.studentId),
            assignmentId=str(submission.assignmentId),
            status=submission.status,
            filePath=submission.filePath,
            uploadAt=submission.uploadAt,
        )
        for submission in student_submissions
    ]

async def create_student_assignment(
    submission_id: str,
    file_path: str,
    student_assignment_req: StudentAssignmentRequestModel,
    db: AsyncSession,
) -> StudentAssignmentResponseModel:
    student_assignment = StudentAssignments(
        id=submission_id,
        assignmentId=student_assignment_req.assignmentId,
        studentId=student_assignment_req.studentId,
        status=student_assignment_req.status,
        filePath=file_path,
        uploadAt=datetime.now(),
    )

    new_student_assignment = await insert_student_assignment(student_assignment, db)

    return StudentAssignmentResponseModel(
        id=str(new_student_assignment.id),
        assignmentId=str(new_student_assignment.assignmentId),
        studentId=str(new_student_assignment.studentId),
        status=new_student_assignment.status,
        filePath=new_student_assignment.filePath,
        uploadAt=new_student_assignment.uploadAt,
    )


async def modify_student_assignment(updated_student_assignment: StudentAssignmentUpdateModelByStudent, file: UploadFile, db: AsyncSession) -> StudentAssignmentResponseModel:
    student_assignment = await fetch_student_assignment(updated_student_assignment.id, db)
    if student_assignment is None:
        raise NotFoundError(
            "Student assignment not found",
            details={"studentAssignmentId": updated_student_assignment.id},
        )

    old_file_path = student_assignment.filePath
    file_path = await store_file(dir_path=StoragePath.ASSIGNMENT_DIR, uid=student_assignment.id, file=file)
    modified_student_assignment = await set_student_assignment(
        file_path=file_path,
        updated_student_assignment=updated_student_assignment,
        db=db,
    )
    await replace_media_asset(
        old_path=old_file_path,
        new_path=file_path,
        title=f"Assignment Submission {updated_student_assignment.assignmentId}",
        media_type=MediaType.ASSIGNMENT,
        original_filename=file.filename,
        content_type=file.content_type,
        db=db,
    )
    if old_file_path != file_path:
        delete_file(file_url=old_file_path)

    return StudentAssignmentResponseModel(
        id=str(modified_student_assignment.id),
        assignmentId=str(modified_student_assignment.assignmentId),
        studentId=str(modified_student_assignment.studentId),
        status=modified_student_assignment.status,
        filePath=modified_student_assignment.filePath,
        uploadAt=modified_student_assignment.uploadAt,
    )


async def modify_student_assignment_status(updated_status_req: StudentAssignmentUpdateModelByTeacher, db: AsyncSession) -> StudentAssignmentResponseModel:
    modified_student_assignment = await set_student_assignment_status(updated_status_req=updated_status_req, db=db)

    return StudentAssignmentResponseModel(
        id=str(modified_student_assignment.id),
        assignmentId=str(modified_student_assignment.assignmentId),
        studentId=str(modified_student_assignment.studentId),
        status=modified_student_assignment.status,
        filePath=modified_student_assignment.filePath,
        uploadAt=modified_student_assignment.uploadAt,
    )


async def delete_student_assignment(student_assignment_id: str, db: AsyncSession) -> int:
    student_assignment = await fetch_student_assignment(student_assignment_id, db)
    if student_assignment is None:
        raise NotFoundError(
            "Student assignment not found",
            details={"studentAssignmentId": student_assignment_id},
        )

    await delete_registered_media_asset_by_path(file_path=student_assignment.filePath, db=db)
    delete_file(file_url=student_assignment.filePath)
    return await remove_student_assignment(student_assignment_id, db)
