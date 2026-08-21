import math
import mimetypes
import os
import uuid

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import MediaAsset, MediaType
from routers.media_library.asset_manager import (
    delete_registered_media_asset_by_path,
    media_type_for_storage_path,
    register_media_asset,
    replace_media_asset_file,
    store_and_register_media_asset,
)
from routers.media_library.models import (
    MediaAssetCreate,
    MediaAssetOut,
    MediaAssetUpdate,
    PaginationMediaAssetResponse,
)
from routers.media_library.repo import fetch_media_asset_by_id, fetch_media_assets, fetch_media_asset_by_path
from utils.errors import NotFoundError, ValidationError
from utils.files.file_handler import delete_file


def _to_out(asset: MediaAsset) -> MediaAssetOut:
    return MediaAssetOut(
        id=str(asset.id),
        title=asset.title,
        mediaType=asset.mediaType,
        originalFilename=asset.originalFilename,
        filePath=asset.filePath,
        contentType=asset.contentType,
        createdAt=asset.createdAt,
        updatedAt=asset.updatedAt,
    )


async def retrieve_media_assets(limit: int, offset: int, media_type: MediaType | None, db: AsyncSession) -> PaginationMediaAssetResponse:
    assets, total_records = await fetch_media_assets(limit=limit, offset=offset, media_type=media_type, db=db)
    data = [_to_out(asset) for asset in assets]
    return PaginationMediaAssetResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def create_media_asset(media_asset_req: MediaAssetCreate, file: UploadFile, db: AsyncSession) -> MediaAssetOut:
    asset = await store_and_register_media_asset(
        media_type=media_asset_req.mediaType,
        title=media_asset_req.title,
        file=file,
        db=db,
    )
    return _to_out(asset)


async def modify_media_asset(updated_asset: MediaAssetUpdate, file: UploadFile | None, db: AsyncSession) -> MediaAssetOut:
    try:
        asset_uuid = uuid.UUID(updated_asset.id)
    except ValueError as exc:
        raise ValidationError("Invalid mediaAssetId", details={"mediaAssetId": updated_asset.id}) from exc

    asset = await fetch_media_asset_by_id(asset_uuid, db)
    if asset is None:
        raise NotFoundError("Media asset not found", details={"mediaAssetId": updated_asset.id})

    updated = await replace_media_asset_file(
        asset=asset,
        title=updated_asset.title,
        media_type=updated_asset.mediaType,
        file=file,
        db=db,
    )
    return _to_out(updated)


async def delete_media_asset(asset_id: str, db: AsyncSession) -> int:
    try:
        asset_uuid = uuid.UUID(asset_id)
    except ValueError as exc:
        raise ValidationError("Invalid mediaAssetId", details={"mediaAssetId": asset_id}) from exc

    asset = await fetch_media_asset_by_id(asset_uuid, db)
    if asset is None:
        raise NotFoundError("Media asset not found", details={"mediaAssetId": asset_id})

    file_path = asset.filePath
    await delete_registered_media_asset_by_path(file_path=file_path, db=db)

    delete_file(file_path)

    return 1


async def register_external_media_asset(
    *,
    file_path: str,
    title: str,
    media_type: MediaType,
    original_filename: str,
    content_type: str | None,
    db: AsyncSession,
) -> MediaAssetOut:
    asset = await register_media_asset(
        file_path=file_path,
        title=title,
        media_type=media_type,
        original_filename=original_filename,
        content_type=content_type,
        db=db,
    )
    return _to_out(asset)


async def sync_storage_media_assets(db: AsyncSession) -> int:
    synced = 0

    for root, _, files in os.walk("storage"):
        for filename in files:
            file_path = os.path.join(root, filename)
            normalized_path = os.path.normpath(file_path).replace("\\", "/")
            
            if normalized_path == "storage/placeholder-image.png":
                continue

            # Check if exists
            existing = await fetch_media_asset_by_path(normalized_path, db)
            if existing:
                continue

            media_type = media_type_for_storage_path(normalized_path)
            inferred_name = filename.split("_", 1)[1] if "_" in filename else filename
            content_type, _ = mimetypes.guess_type(filename)
            
            await register_media_asset(
                file_path=normalized_path,
                title=os.path.splitext(inferred_name)[0],
                media_type=media_type,
                original_filename=inferred_name,
                content_type=content_type,
                db=db,
            )
            synced += 1

    return synced
