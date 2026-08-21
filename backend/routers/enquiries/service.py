import uuid
import math
from datetime import datetime
from typing import List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Enquiry, EnquiryStatus
from routers.enquiries.models import (
    PaginationEnquiryResponse,
    EnquiryOut,
    EnquiryCreate,
    EnquiryUpdate
)
from routers.enquiries.repo import (
    insert_enquiry,
    fetch_enquiries,
    fetch_enquiry_by_id,
    set_enquiry_status,
    remove_enquiry
)
from utils.errors import NotFoundError


async def retrieve_all_enquiries(limit: int, offset: int, db: AsyncSession) -> PaginationEnquiryResponse:
    enquiry_list, total_records = await fetch_enquiries(limit=limit, offset=offset, db=db)
    data = [EnquiryOut.model_validate(e) for e in enquiry_list]

    return PaginationEnquiryResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1 if limit > 0 else 1,
        totalPages=math.ceil(total_records / limit) if limit > 1 else 1,
    )


async def create_new_enquiry(enquiry_data: EnquiryCreate, db: AsyncSession) -> EnquiryOut:
    enquiry = Enquiry(
        fullName=enquiry_data.fullName,
        email=enquiry_data.email,
        phone=enquiry_data.phone,
        title=enquiry_data.title,
        message=enquiry_data.message,
        status=enquiry_data.status,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )
    saved_enquiry = await insert_enquiry(enquiry, db)
    return EnquiryOut.model_validate(saved_enquiry)


async def update_enquiry_status(enquiry_id: uuid.UUID, enquiry_data: EnquiryUpdate, db: AsyncSession) -> EnquiryOut:
    enquiry = await fetch_enquiry_by_id(enquiry_id, db)
    if not enquiry:
        raise NotFoundError(message=f"Enquiry with id {enquiry_id} not found")
    
    enquiry.status = enquiry_data.status
    enquiry.updatedAt = datetime.now()
    updated_enquiry = await set_enquiry_status(enquiry, db)
    return EnquiryOut.model_validate(updated_enquiry)


async def delete_enquiry_by_id(enquiry_id: uuid.UUID, db: AsyncSession) -> int:
    row_count = await remove_enquiry(enquiry_id, db)
    if row_count == 0:
        raise NotFoundError(message=f"Enquiry with id {enquiry_id} not found")
    return row_count
