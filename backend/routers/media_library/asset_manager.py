import os
import shutil
import uuid
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import (
    Announcement,
    Course,
    LearningHubVideo,
    MediaAsset,
    MediaType,
    Post,
    Questions,
    StudentAssignments,
    StudyResource,
    User,
)
from routers.media_library.repo import (
    fetch_media_asset_by_path,
    insert_media_asset,
    remove_media_asset,
    set_media_asset,
)
from utils.const import PLACEHOLDER_IMAGE_PATH, StoragePath
from utils.errors import FileError, ValidationError
from utils.files.file_handler import delete_file, store_file
from utils.sv_logger import sv_logger


IMAGE_ONLY_MEDIA_TYPES = {
    MediaType.LEARNING_HUB,
    MediaType.ANNOUNCEMENT,
    MediaType.BLOG,
    MediaType.STUDENT,
    MediaType.EVENT,
    MediaType.USER,
    MediaType.COURSE,
}

REFERENCE_COLUMNS = (
    (User, User.avatar),
    (Course, Course.image),
    (StudyResource, StudyResource.filePath),
    (StudentAssignments, StudentAssignments.filePath),
    (Post, Post.featuredImage),
    (LearningHubVideo, LearningHubVideo.thumbnail),
    (Announcement, Announcement.bannerImage),
    (Questions, Questions.questionImage),
    (Questions, Questions.optionAImg),
    (Questions, Questions.optionBImg),
    (Questions, Questions.optionCImg),
    (Questions, Questions.optionDImg),
    (Questions, Questions.explanationImg),
    (Questions, Questions.correctImg),
)


def storage_path_for_media_type(media_type: MediaType) -> StoragePath:
    mapping = {
        MediaType.MEDIA_LIBRARY: StoragePath.MEDIA_LIBRARY_DIR,
        MediaType.ASSIGNMENT: StoragePath.ASSIGNMENT_DIR,
        MediaType.STUDY_RESOURCE: StoragePath.SRES_DIR,
        MediaType.LEARNING_HUB: StoragePath.LEARNING_HUB_DIR,
        MediaType.ANNOUNCEMENT: StoragePath.ANNOUNCEMENT_DIR,
        MediaType.BLOG: StoragePath.BLOG_DIR,
        MediaType.STUDENT: StoragePath.STUDENT_DIR,
        MediaType.EVENT: StoragePath.EVENT_DIR,
        MediaType.USER: StoragePath.USER_DIR,
        MediaType.COURSE: StoragePath.COURSE_DIR,
        MediaType.TEST: StoragePath.TEST_DIR,
    }
    return mapping[media_type]


def media_type_for_storage_path(file_path: str) -> MediaType:
    normalized = os.path.normpath(file_path)
    for media_type in MediaType:
        storage_root = os.path.normpath(storage_path_for_media_type(media_type).value)
        if normalized.startswith(storage_root):
            return media_type
    return MediaType.MEDIA_LIBRARY


def ensure_media_type_matches_file(media_type: MediaType, content_type: str | None, filename: str) -> None:
    ext = os.path.splitext(filename)[1].lower()
    image_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
    image_like = (content_type or "").startswith("image/") or ext in image_extensions

    if media_type in IMAGE_ONLY_MEDIA_TYPES and not image_like:
        raise ValidationError(
            "Selected media type requires an image file",
            details={"mediaType": media_type.value, "contentType": content_type, "filename": filename},
        )


def _is_in_storage(file_path: str | None) -> bool:
    if not file_path:
        return False
    # If it's a Cloudinary URL, it's not in local storage
    if "cloudinary.com" in file_path:
        return False
    return os.path.normpath(file_path).startswith(os.path.normpath("storage"))


async def _repoint_asset_references(old_path: str, new_path: str, db: AsyncSession) -> None:
    if old_path == new_path:
        return

    for model, column in REFERENCE_COLUMNS:
        await db.execute(
            update(model)
            .where(column == old_path)
            .values({column.key: new_path})
        )


async def register_media_asset(
    *,
    file_path: str,
    title: str,
    media_type: MediaType,
    original_filename: str,
    content_type: str | None,
    db: AsyncSession,
) -> MediaAsset:
    existing_asset = await fetch_media_asset_by_path(file_path, db)
    if existing_asset is not None:
        existing_asset.title = title
        existing_asset.mediaType = media_type
        existing_asset.originalFilename = original_filename
        existing_asset.contentType = content_type
        existing_asset.updatedAt = datetime.now(timezone.utc)
        return await set_media_asset(existing_asset, db)

    asset = MediaAsset(
        id=uuid.uuid4(),
        title=title,
        mediaType=media_type,
        originalFilename=original_filename,
        filePath=file_path,
        contentType=content_type,
        createdAt=datetime.now(timezone.utc),
        updatedAt=datetime.now(timezone.utc),
    )
    return await insert_media_asset(asset, db)


async def replace_media_asset(
    *,
    old_path: str,
    new_path: str,
    title: str,
    media_type: MediaType,
    original_filename: str,
    content_type: str | None,
    db: AsyncSession,
) -> MediaAsset:
    existing_asset = await fetch_media_asset_by_path(old_path, db)
    await _repoint_asset_references(old_path, new_path, db)

    if existing_asset is None:
        return await register_media_asset(
            file_path=new_path,
            title=title,
            media_type=media_type,
            original_filename=original_filename,
            content_type=content_type,
            db=db,
        )

    existing_asset.title = title
    existing_asset.mediaType = media_type
    existing_asset.originalFilename = original_filename
    existing_asset.contentType = content_type
    existing_asset.filePath = new_path
    existing_asset.updatedAt = datetime.now(timezone.utc)
    return await set_media_asset(existing_asset, db)


async def delete_registered_media_asset_by_path(
    *,
    file_path: str,
    db: AsyncSession,
    replacement_path: str = PLACEHOLDER_IMAGE_PATH,
) -> None:
    existing_asset = await fetch_media_asset_by_path(file_path, db)
    await _repoint_asset_references(file_path, replacement_path, db)

    if existing_asset is not None:
        await remove_media_asset(existing_asset.id, db)
    else:
        await db.commit()


async def store_and_register_media_asset(
    *,
    media_type: MediaType,
    title: str,
    file: UploadFile,
    db: AsyncSession,
) -> MediaAsset:
    if not file.filename:
        raise ValidationError("Media file is required", details={"file": "missing filename"})

    ensure_media_type_matches_file(media_type, file.content_type, file.filename)
    file_path = await store_file(dir_path=storage_path_for_media_type(media_type), uid=uuid.uuid4(), file=file)
    return await register_media_asset(
        file_path=file_path,
        title=title,
        media_type=media_type,
        original_filename=os.path.basename(file.filename),
        content_type=file.content_type,
        db=db,
    )


def move_file_to_media_bucket(*, source_path: str, media_type: MediaType, filename: str) -> str:
    target_dir = storage_path_for_media_type(media_type).value
    os.makedirs(target_dir, exist_ok=True)
    target_path = os.path.join(target_dir, f"{uuid.uuid4()}_{os.path.basename(filename)}").replace("\\", "/")

    try:
        shutil.move(source_path, target_path)
        return target_path
    except Exception as exc:
        sv_logger.error(
            "failed to move media asset",
            extra={"source_path": source_path, "target_path": target_path},
            exc_info=True,
        )
        raise FileError(message="File could not be moved in storage", details={"source": source_path}) from exc


async def replace_media_asset_file(
    *,
    asset: MediaAsset,
    title: str,
    media_type: MediaType,
    file: UploadFile | None,
    db: AsyncSession,
) -> MediaAsset:
    old_path = asset.filePath
    new_path = old_path
    original_filename = asset.originalFilename
    content_type = asset.contentType
    moved_existing_file = False

    if file is not None and file.filename:
        ensure_media_type_matches_file(media_type, file.content_type, file.filename)
        new_path = await store_file(dir_path=storage_path_for_media_type(media_type), uid=asset.id, file=file)
        original_filename = os.path.basename(file.filename)
        content_type = file.content_type
    elif media_type != asset.mediaType and _is_in_storage(old_path):
        new_path = move_file_to_media_bucket(source_path=old_path, media_type=media_type, filename=asset.originalFilename)
        moved_existing_file = True

    updated_asset = await replace_media_asset(
        old_path=old_path,
        new_path=new_path,
        title=title,
        media_type=media_type,
        original_filename=original_filename,
        content_type=content_type,
        db=db,
    )

    if new_path != old_path and _is_in_storage(old_path) and not moved_existing_file:
        delete_file(old_path)

    return updated_asset
