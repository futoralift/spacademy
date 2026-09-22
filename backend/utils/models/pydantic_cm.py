# Pydantic models for corresponding SQLAlchemy models
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from data.schemas import AuthServiceProvider, UserRole


class UserModel(BaseModel):
    id: uuid.UUID
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    passwordHash: Optional[str]
    authServiceProvider: AuthServiceProvider
    role: UserRole
    avatar: str
    refreshToken: Optional[str]
    createdAt: datetime
    deletedAt: Optional[datetime]
    lastLogIn: Optional[datetime]


class PendingUserModel(BaseModel):
    id: uuid.UUID
    firstName: str
    lastName: str
    email: EmailStr
    passwordHash: Optional[str]
    authServiceProvider: AuthServiceProvider
    role: UserRole
    phone: str
