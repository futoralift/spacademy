import math
import os
import uuid
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Announcement, MediaType
from routers.media_library.asset_manager import delete_registered_media_asset_by_path, register_media_asset, replace_media_asset
from routers.announcements.models import (
    AnnouncementCreate,
    AnnouncementOut,
    AnnouncementUpdate,
    PaginationAnnouncementResponse,
)
from routers.announcements.repo import (
    fetch_active_announcements,
    fetch_announcement_by_id,
    fetch_announcements,
    insert_announcement,
    remove_announcement,
    set_announcement,
)
from utils.const import StoragePath
from utils.errors import NotFoundError, ValidationError
from utils.files.file_handler import delete_file, store_file


def _validate_date_range(start_date: datetime, end_date: datetime) -> None:
    if end_date < start_date:
        raise ValidationError(
            "End date must be greater than or equal to start date",
            details={"startDate": str(start_date), "endDate": str(end_date)},
        )


def _should_delete_banner(banner_image: str | None) -> bool:
    if not banner_image:
        return False
    normalized = os.path.normpath(banner_image)
    storage_root = os.path.normpath(StoragePath.ANNOUNCEMENT_DIR.value)
    return normalized.startswith(storage_root)


def _to_out(announcement: Announcement) -> AnnouncementOut:
    return AnnouncementOut(
        id=str(announcement.id),
        title=announcement.title,
        description=announcement.description,
        bannerImage=announcement.bannerImage,
        startDate=announcement.startDate,
        endDate=announcement.endDate,
        status=announcement.status,
        type=announcement.type,
        createdAt=announcement.createdAt,
        updatedAt=announcement.updatedAt,
    )


async def retrieve_all_announcements(limit: int, offset: int, db: AsyncSession) -> PaginationAnnouncementResponse:
    announcements, total_records = await fetch_announcements(limit=limit, offset=offset, db=db)
    data = [_to_out(announcement) for announcement in announcements]
    return PaginationAnnouncementResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def retrieve_active_announcements(limit: int, offset: int, db: AsyncSession) -> PaginationAnnouncementResponse:
    now = datetime.now(timezone.utc)
    announcements, total_records = await fetch_active_announcements(limit=limit, offset=offset, active_at=now, db=db)
    data = [_to_out(announcement) for announcement in announcements]
    return PaginationAnnouncementResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def create_announcement(
    announcement_req: AnnouncementCreate,
    banner_image: UploadFile,
    db: AsyncSession,
) -> AnnouncementOut:
    _validate_date_range(announcement_req.startDate, announcement_req.endDate)

    announcement_id = uuid.uuid4()
    banner_path = await store_file(dir_path=StoragePath.ANNOUNCEMENT_DIR, uid=announcement_id, file=banner_image)

    announcement = Announcement(
        id=announcement_id,
        title=announcement_req.title,
        description=announcement_req.description,
        bannerImage=banner_path,
        startDate=announcement_req.startDate,
        endDate=announcement_req.endDate,
        status=announcement_req.status,
        type=announcement_req.type,
        createdAt=datetime.now(timezone.utc),
        updatedAt=datetime.now(timezone.utc),
    )

    new_announcement = await insert_announcement(announcement, db)
    await register_media_asset(
        file_path=banner_path,
        title=announcement_req.title,
        media_type=MediaType.ANNOUNCEMENT,
        original_filename=banner_image.filename,
        content_type=banner_image.content_type,
        db=db,
    )
    return _to_out(new_announcement)


async def modify_announcement(
    updated_announcement: AnnouncementUpdate,
    banner_image: UploadFile | None,
    db: AsyncSession,
) -> AnnouncementOut:
    _validate_date_range(updated_announcement.startDate, updated_announcement.endDate)

    try:
        announcement_uuid = uuid.UUID(updated_announcement.id)
    except ValueError as exc:
        raise ValidationError("Invalid announcementId", details={"announcementId": updated_announcement.id}) from exc

    announcement = await fetch_announcement_by_id(announcement_uuid, db)
    if announcement is None:
        raise NotFoundError("Announcement not found", details={"announcementId": updated_announcement.id})

    announcement.title = updated_announcement.title
    announcement.description = updated_announcement.description
    announcement.startDate = updated_announcement.startDate
    announcement.endDate = updated_announcement.endDate
    announcement.status = updated_announcement.status
    announcement.type = updated_announcement.type

    if banner_image is not None and banner_image.filename:
        old_banner_path = announcement.bannerImage
        if _should_delete_banner(announcement.bannerImage):
            delete_file(announcement.bannerImage)
        announcement.bannerImage = await store_file(dir_path=StoragePath.ANNOUNCEMENT_DIR, uid=announcement.id, file=banner_image)
        await replace_media_asset(
            old_path=old_banner_path,
            new_path=announcement.bannerImage,
            title=updated_announcement.title,
            media_type=MediaType.ANNOUNCEMENT,
            original_filename=banner_image.filename,
            content_type=banner_image.content_type,
            db=db,
        )

    modified_announcement = await set_announcement(announcement, db)
    return _to_out(modified_announcement)


async def delete_announcement(announcement_id: str, db: AsyncSession) -> int:
    try:
        announcement_uuid = uuid.UUID(announcement_id)
    except ValueError as exc:
        raise ValidationError("Invalid announcementId", details={"announcementId": announcement_id}) from exc

    announcement = await fetch_announcement_by_id(announcement_uuid, db)
    if announcement is None:
        raise NotFoundError("Announcement not found", details={"announcementId": announcement_id})

    if _should_delete_banner(announcement.bannerImage):
        await delete_registered_media_asset_by_path(file_path=announcement.bannerImage, db=db)
        delete_file(announcement.bannerImage)

    return await remove_announcement(announcement_uuid, db)
