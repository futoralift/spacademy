import uuid
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from data.schemas import UserRole, Subject
from utils.models.pydantic_cm import UserModel

async def check_subject_access(user: UserModel, subject_id: str | uuid.UUID, db: AsyncSession):
    if user.role == UserRole.ADMIN:
        return
    
    if user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # If teacher, check if they teach this subject
    query = select(Subject).where(Subject.id == subject_id, Subject.teacherId == user.id)
    result = await db.execute(query)
    subject = result.scalar_one_or_none()
    
    if not subject:
        raise HTTPException(status_code=403, detail="You do not have access to this subject")
