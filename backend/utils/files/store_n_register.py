from fastapi import UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import MediaType
from routers.media_library.service import register_external_media_asset
from utils.const import StoragePath
from utils.files.file_handler import store_file


async def store_n_register_media(uid: str, dir_path: StoragePath, media_type: MediaType, db: AsyncSession, file: UploadFile = File(...)) -> str:
    file_path = await store_file(dir_path=dir_path, uid=uid, file=file)
    await register_external_media_asset(
        file_path=file_path,
        title=file.filename,
        media_type=media_type,
        original_filename=file.filename,
        content_type=file.content_type,
        db=db,
    )
    return file_path