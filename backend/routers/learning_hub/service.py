import math
import os
import uuid
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlparse

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import LearningHubVideo, MediaType
from routers.media_library.asset_manager import delete_registered_media_asset_by_path, register_media_asset, replace_media_asset
from routers.learning_hub.models import (
    LearningHubVideoCreate,
    LearningHubVideoOut,
    LearningHubVideoUpdate,
    PaginationLearningHubVideoResponse,
)
from routers.learning_hub.repo import (
    fetch_learning_hub_video_by_id,
    fetch_learning_hub_videos,
    fetch_published_learning_hub_videos,
    insert_learning_hub_video,
    remove_learning_hub_video,
    set_learning_hub_video,
)
from utils.const import StoragePath
from utils.errors import NotFoundError, ValidationError
from utils.files.file_handler import delete_file, store_file


def _extract_youtube_video_id(youtube_link: str) -> str:
    parsed = urlparse(youtube_link.strip())
    host = parsed.netloc.lower()
    path = parsed.path.strip("/")

    if host in {"youtu.be", "www.youtu.be"}:
        video_id = path.split("/")[0] if path else ""
    elif host in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        if path == "watch":
            video_id = parse_qs(parsed.query).get("v", [""])[0]
        elif path.startswith("shorts/") or path.startswith("embed/"):
            video_id = path.split("/")[1] if len(path.split("/")) > 1 else ""
        else:
            video_id = ""
    else:
        video_id = ""

    if not video_id or len(video_id) < 6:
        raise ValidationError("Invalid YouTube link", details={"youtubeLink": youtube_link})

    return video_id


def _default_thumbnail(video_id: str) -> str:
    return f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"


def _should_delete_thumbnail(thumbnail_path: str | None) -> bool:
    if not thumbnail_path:
        return False
    normalized = os.path.normpath(thumbnail_path)
    storage_root = os.path.normpath(StoragePath.LEARNING_HUB_DIR.value)
    return normalized.startswith(storage_root)


from data.schemas import UserRole
from utils.security.authorization import check_subject_access
from utils.models.pydantic_cm import UserModel


def _to_out(video: LearningHubVideo) -> LearningHubVideoOut:
    return LearningHubVideoOut(
        id=str(video.id),
        title=video.title,
        youtubeLink=video.youtubeLink,
        youtubeVideoId=video.youtubeVideoId,
        videoType=video.videoType,
        thumbnail=video.thumbnail or _default_thumbnail(video.youtubeVideoId),
        publishDate=video.publishDate,
        createdAt=video.createdAt,
        updatedAt=video.updatedAt,
        subjectId=str(video.subjectId) if video.subjectId else None
    )


async def retrieve_all_learning_hub_videos(limit: int, offset: int, db: AsyncSession, user: UserModel, subject_id: str = None) -> PaginationLearningHubVideoResponse:
    teacher_id = str(user.id) if user.role == UserRole.TEACHER else None
    videos, total_records = await fetch_learning_hub_videos(limit=limit, offset=offset, db=db, teacher_id=teacher_id, subject_id=subject_id)
    data = [_to_out(video) for video in videos]
    return PaginationLearningHubVideoResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def retrieve_published_learning_hub_videos(limit: int, offset: int, db: AsyncSession, subject_id: str = None) -> PaginationLearningHubVideoResponse:
    now = datetime.now(timezone.utc)
    videos, total_records = await fetch_published_learning_hub_videos(limit=limit, offset=offset, published_until=now, db=db, subject_id=subject_id)
    data = [_to_out(video) for video in videos]
    return PaginationLearningHubVideoResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def create_learning_hub_video(
    video_req: LearningHubVideoCreate,
    thumbnail: UploadFile | None,
    db: AsyncSession,
    user: UserModel
) -> LearningHubVideoOut:
    if video_req.subjectId:
        await check_subject_access(user, video_req.subjectId, db)

    video_id = uuid.uuid4()
    youtube_video_id = _extract_youtube_video_id(video_req.youtubeLink)
    thumbnail_path = None
    if thumbnail is not None and thumbnail.filename:
        thumbnail_path = await store_file(dir_path=StoragePath.LEARNING_HUB_DIR, uid=video_id, file=thumbnail)

    video = LearningHubVideo(
        id=video_id,
        title=video_req.title,
        youtubeLink=video_req.youtubeLink,
        youtubeVideoId=youtube_video_id,
        videoType=video_req.videoType,
        thumbnail=thumbnail_path,
        publishDate=video_req.publishDate,
        createdAt=datetime.now(timezone.utc),
        updatedAt=datetime.now(timezone.utc),
        subjectId=video_req.subjectId
    )

    new_video = await insert_learning_hub_video(video, db)
    if thumbnail_path is not None and thumbnail is not None and thumbnail.filename:
        await register_media_asset(
            file_path=thumbnail_path,
            title=video_req.title,
            media_type=MediaType.LEARNING_HUB,
            original_filename=thumbnail.filename,
            content_type=thumbnail.content_type,
            db=db,
        )
    return _to_out(new_video)


async def modify_learning_hub_video(
    updated_video: LearningHubVideoUpdate,
    thumbnail: UploadFile | None,
    db: AsyncSession,
    user: UserModel
) -> LearningHubVideoOut:
    if updated_video.subjectId:
        await check_subject_access(user, updated_video.subjectId, db)

    try:
        video_uuid = uuid.UUID(updated_video.id)
    except ValueError as exc:
        raise ValidationError("Invalid videoId", details={"videoId": updated_video.id}) from exc

    video = await fetch_learning_hub_video_by_id(video_uuid, db)
    if video is None:
        raise NotFoundError("Learning Hub video not found", details={"videoId": updated_video.id})

    if video.subjectId:
        await check_subject_access(user, video.subjectId, db)

    video.title = updated_video.title
    video.youtubeLink = updated_video.youtubeLink
    video.youtubeVideoId = _extract_youtube_video_id(updated_video.youtubeLink)
    video.videoType = updated_video.videoType
    video.publishDate = updated_video.publishDate
    video.subjectId = updated_video.subjectId

    if thumbnail is not None and thumbnail.filename:
        old_thumbnail_path = video.thumbnail
        if _should_delete_thumbnail(video.thumbnail):
            delete_file(video.thumbnail)
        video.thumbnail = await store_file(dir_path=StoragePath.LEARNING_HUB_DIR, uid=video.id, file=thumbnail)
        if old_thumbnail_path:
            await replace_media_asset(
                old_path=old_thumbnail_path,
                new_path=video.thumbnail,
                title=updated_video.title,
                media_type=MediaType.LEARNING_HUB,
                original_filename=thumbnail.filename,
                content_type=thumbnail.content_type,
                db=db,
            )
        else:
            await register_media_asset(
                file_path=video.thumbnail,
                title=updated_video.title,
                media_type=MediaType.LEARNING_HUB,
                original_filename=thumbnail.filename,
                content_type=thumbnail.content_type,
                db=db,
            )

    modified_video = await set_learning_hub_video(video, db)
    return _to_out(modified_video)


async def delete_learning_hub_video(video_id: str, db: AsyncSession, user: UserModel) -> int:
    try:
        video_uuid = uuid.UUID(video_id)
    except ValueError as exc:
        raise ValidationError("Invalid videoId", details={"videoId": video_id}) from exc

    video = await fetch_learning_hub_video_by_id(video_uuid, db)
    if video is None:
        raise NotFoundError("Learning Hub video not found", details={"videoId": video_id})

    if video.subjectId:
        await check_subject_access(user, video.subjectId, db)

    if _should_delete_thumbnail(video.thumbnail):
        await delete_registered_media_asset_by_path(file_path=video.thumbnail, db=db)
        delete_file(video.thumbnail)

    return await remove_learning_hub_video(video_uuid, db)
