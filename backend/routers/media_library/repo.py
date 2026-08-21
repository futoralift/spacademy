import uuid
from typing import List

from sqlalchemy import delete, desc, func, select, or_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import MediaAsset, MediaType
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_media_assets(limit: int, offset: int, media_type: MediaType | None, db: AsyncSession) -> tuple[List[MediaAsset], int]:
    try:
        query = select(MediaAsset)
        count_query = select(func.count()).select_from(MediaAsset)

        if media_type is not None:
            query = query.where(MediaAsset.mediaType == media_type)
            count_query = count_query.where(MediaAsset.mediaType == media_type)

        query = query.order_by(desc(MediaAsset.createdAt)).limit(limit).offset(offset)
        result = await db.execute(query)
        assets = result.scalars().all()

        count_result = await db.execute(count_query)
        total_record = count_result.scalar() or 0
        return assets, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to fetch media assets", exc_info=True)
        raise DatabaseError(message="failed to fetch media assets") from se


async def fetch_media_asset_by_id(asset_id: str | uuid.UUID, db: AsyncSession) -> MediaAsset | None:
    try:
        result = await db.execute(select(MediaAsset).where(MediaAsset.id == asset_id))
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch media asset by id",
            extra={"asset_id": str(asset_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch media asset {asset_id}") from se


async def fetch_media_asset_by_path(file_path: str, db: AsyncSession) -> MediaAsset | None:
    try:
        path_v1 = file_path.replace("\\", "/")
        path_v2 = file_path.replace("/", "\\")
        
        result = await db.execute(
            select(MediaAsset).where(
                or_(
                    MediaAsset.filePath == path_v1,
                    MediaAsset.filePath == path_v2
                )
            ).limit(1)
        )
        return result.scalars().first()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch media asset by path",
            extra={"file_path": file_path},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch media asset for path {file_path}") from se


async def insert_media_asset(asset: MediaAsset, db: AsyncSession) -> MediaAsset:
    try:
        db.add(asset)
        await db.commit()
        await db.refresh(asset)
        return asset
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to insert media asset", exc_info=True)
        raise DatabaseError(message="failed to insert media asset") from se


async def set_media_asset(asset: MediaAsset, db: AsyncSession) -> MediaAsset:
    try:
        await db.commit()
        await db.refresh(asset)
        return asset
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update media asset",
            extra={"asset_id": str(asset.id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update media asset {asset.id}") from se


async def remove_media_asset(asset_id: str | uuid.UUID, db: AsyncSession) -> int:
    try:
        result = await db.execute(delete(MediaAsset).where(MediaAsset.id == asset_id))
        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete media asset",
            extra={"asset_id": str(asset_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete media asset {asset_id}") from se
