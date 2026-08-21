import math
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import StudyResource
from data.schemas import MediaType
from routers.media_library.asset_manager import delete_registered_media_asset_by_path, replace_media_asset
from routers.study_resources.models import StudyResourceRequestModel, StudyResourceResponseModel, \
    StudyResourceUpdateModel, PaginationStudyResourceResponse
from routers.study_resources.repo import insert_study_resource, fetch_study_resource, set_study_resource, \
    remove_study_resource, fetch_all_study_resource
from utils.const import StoragePath
from utils.errors import NotFoundError
from utils.files.file_handler import store_file, delete_file


from data.schemas import UserRole
from utils.security.authorization import check_subject_access
from utils.models.pydantic_cm import UserModel

async def retrieve_all_study_resource(limit: int, offset: int, db: AsyncSession, user: UserModel) -> PaginationStudyResourceResponse:
    teacher_id = str(user.id) if user.role == UserRole.TEACHER else None
    study_resource_list, total_records = await fetch_all_study_resource(limit=limit, offset=offset, db=db, teacher_id=teacher_id)

    data =  [
        StudyResourceResponseModel(
            id=str(study_resource.id),
            title=study_resource.title,
            description=study_resource.description,
            uploadAt=study_resource.uploadAt,
            subjectId=str(study_resource.subjectId),
            lectureId=str(study_resource.lectureId),
            filePath=study_resource.filePath
        )
        for study_resource in study_resource_list
    ]

    return PaginationStudyResourceResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )

async def create_study_resource(sr_id: str, file_path: str, study_resource_req: StudyResourceRequestModel, db: AsyncSession, user: UserModel) -> StudyResourceResponseModel:
    await check_subject_access(user, study_resource_req.subjectId, db)
    
    study_resource = StudyResource(
        id=sr_id,
        lectureId=study_resource_req.lectureId,
        title=study_resource_req.title,
        description=study_resource_req.description,
        subjectId=study_resource_req.subjectId,
        filePath=file_path,
        uploadAt=datetime.now(),
    )

    new_study_resource = await insert_study_resource(study_resource, db)

    return StudyResourceResponseModel(
        id=str(new_study_resource.id),
        title=new_study_resource.title,
        description=new_study_resource.description,
        uploadAt=new_study_resource.uploadAt,
        subjectId=str(new_study_resource.subjectId),
        lectureId=str(new_study_resource.lectureId),
        filePath=new_study_resource.filePath
    )

async def modify_study_resource(updated_study_resource: StudyResourceUpdateModel, file: UploadFile, db: AsyncSession, user: UserModel) -> StudyResourceResponseModel:
    await check_subject_access(user, updated_study_resource.subjectId, db)
    
    sr = await fetch_study_resource(updated_study_resource.id, db)
    if not sr:
        raise NotFoundError("Study resource not found", details={"id": updated_study_resource.id})
        
    await check_subject_access(user, sr.subjectId, db)
    
    old_file_path = sr.filePath
    file_path = await store_file(dir_path=StoragePath.SRES_DIR, uid=sr.id, file=file)
    modified_study_resource = await set_study_resource(file_path=file_path, updated_study_resource=updated_study_resource, db=db)
    await replace_media_asset(
        old_path=old_file_path,
        new_path=file_path,
        title=updated_study_resource.title,
        media_type=MediaType.STUDY_RESOURCE,
        original_filename=file.filename,
        content_type=file.content_type,
        db=db,
    )
    if old_file_path != file_path:
        delete_file(file_url=old_file_path)

    return StudyResourceResponseModel(
        id=str(modified_study_resource.id),
        title=modified_study_resource.title,
        description=modified_study_resource.description,
        uploadAt=modified_study_resource.uploadAt,
        subjectId=str(modified_study_resource.subjectId),
        lectureId=str(modified_study_resource.lectureId),
        filePath=modified_study_resource.filePath
    )

async def delete_study_resource(study_resource_id: str, db: AsyncSession, user: UserModel) -> int:
    sr = await fetch_study_resource(study_resource_id, db)
    if not sr:
        raise NotFoundError("Study resource not found", details={"id": study_resource_id})
        
    await check_subject_access(user, sr.subjectId, db)
    
    await delete_registered_media_asset_by_path(file_path=sr.filePath, db=db)
    delete_file(file_url=sr.filePath)
    return await remove_study_resource(study_resource_id, db)
