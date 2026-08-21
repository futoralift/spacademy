from enum import Enum
from typing import Optional
from pydantic import BaseModel

from data.schemas import UserRole, AuthServiceProvider


class ResponseCode(str, Enum):
    CREATED = "Created",
    DELETED = "Deleted",
    UPDATED = "Updated",
    FETCHED = "Fetched",
    ACK = "Acknowledged"


class ResponseModel(BaseModel):
    code: ResponseCode
    message: str
    details: Optional[dict] = None


class UserRequestModel(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    password: str

class UserResponseModel(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    phone: str
    avatar: str
    role: UserRole
    authServiceProvider: AuthServiceProvider


class PaginationUserResponse(BaseModel):
    data: list[UserResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int


class UserModifyRequestModel(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    phone: str
    avatar: str
    role: UserRole
