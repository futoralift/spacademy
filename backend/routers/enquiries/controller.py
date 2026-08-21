import uuid
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from routers.enquiries.models import (
    PaginationEnquiryResponse,
    EnquiryOut,
    EnquiryCreate,
    EnquiryUpdate
)
from routers.enquiries.service import (
    retrieve_all_enquiries,
    create_new_enquiry,
    update_enquiry_status,
    delete_enquiry_by_id
)
from utils.const import RATE_LIMIT
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_admin


router = APIRouter(prefix="/enquiries", tags=["enquiries"])


@router.get("/", response_model=PaginationEnquiryResponse)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_enquiries(
    request: Request,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: UserModel = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
) -> PaginationEnquiryResponse:
    return await retrieve_all_enquiries(limit, offset, db)


@router.post("/", response_model=EnquiryOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_enquiry(
    request: Request,
    enquiry_req: EnquiryCreate,
    db: AsyncSession = Depends(get_db)
) -> EnquiryOut:
    return await create_new_enquiry(enquiry_data=enquiry_req, db=db)


@router.patch("/{enquiry_id}", response_model=EnquiryOut)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_enquiry_status(
    request: Request,
    enquiry_id: uuid.UUID,
    enquiry_req: EnquiryUpdate,
    _: UserModel = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
) -> EnquiryOut:
    return await update_enquiry_status(enquiry_id=enquiry_id, enquiry_data=enquiry_req, db=db)


@router.delete("/{enquiry_id}", response_model=int)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_enquiry(
    request: Request,
    enquiry_id: uuid.UUID,
    _: UserModel = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
) -> int:
    return await delete_enquiry_by_id(enquiry_id=enquiry_id, db=db)
