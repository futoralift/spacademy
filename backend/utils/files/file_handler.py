import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, File
from utils.const import StoragePath
from utils.errors import FileError
from utils.sv_logger import sv_logger

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

async def store_file(dir_path: StoragePath, uid: str, file: UploadFile = File(...)) -> str:
    """
    Uploads a file to Cloudinary and returns the secure URL.
    """
    try:
        # Use the directory name as the folder in Cloudinary
        folder = dir_path.value.replace("storage/", "")
        
        # Read file content
        file_content = await file.read()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_content,
            public_id=f"{uid}_{file.filename.split('.')[0]}",
            folder=f"sf_academy/{folder}",
            resource_type="auto" # Automatically detect if it's image, video, or raw file
        )
        
        return upload_result.get("secure_url")
        
    except Exception as e:
        sv_logger.error(f"Cloudinary upload failed: {str(e)}", exc_info=True)
        raise FileError(message="File could not be stored in cloud storage", details={"filename": file.filename})

def delete_file(file_url: str) -> None:
    """
    Deletes a file from Cloudinary using its URL.
    """
    if not file_url or "cloudinary.com" not in file_url:
        return

    try:
        # Extract public_id from the Cloudinary URL
        # URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
        parts = file_url.split("/")
        # The public_id usually starts after 'upload/' (index may vary)
        upload_index = parts.index("upload")
        # Public ID is everything after the version (v1234567) or after upload/ if no version
        id_parts = parts[upload_index + 2:] if parts[upload_index + 1].startswith("v") else parts[upload_index + 1:]
        
        public_id = "/".join(id_parts).split(".")[0]
        
        cloudinary.uploader.destroy(public_id)
        sv_logger.info(f"Deleted from Cloudinary: {public_id}")
        
    except Exception as e:
        sv_logger.error(f"Cloudinary delete failed: {str(e)}", exc_info=True)
        # We don't necessarily want to raise an error here to prevent blocking DB operations
