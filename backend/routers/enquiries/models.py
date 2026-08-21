import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from data.schemas import EnquiryStatus

class EnquiryBase(BaseModel):
    fullName: str
    email: str
    phone: str
    title: Optional[str] = None
    message: str
    status: EnquiryStatus = EnquiryStatus.NEW

class EnquiryCreate(EnquiryBase):
    pass

class EnquiryUpdate(BaseModel):
    status: EnquiryStatus

class EnquiryOut(EnquiryBase):
    id: uuid.UUID
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginationEnquiryResponse(BaseModel):
    data: List[EnquiryOut]
    record: int
    totalRecord: int
    page: int
    totalPages: int
