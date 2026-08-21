from fastapi import APIRouter, Request, Depends, Response
from fastapi.params import Body
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_200_OK, HTTP_201_CREATED

from data.core import get_db
from data.schemas import User, UserRole
from routers.auth.models import UserCredentials
from routers.auth.service import authenticate_user
from routers.user.delete_account.service import remove_user
from utils.const import RATE_LIMIT
from utils.errors import ConflictError
from utils.models.common_models import ResponseCode, ResponseModel
from utils.security.otp_manager import OTPPurpose, OTPManager
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_user

router = APIRouter(prefix="/delete_account", tags=["user_delete_account"])


@router.post("/verify_password", response_model=ResponseModel, status_code=HTTP_201_CREATED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_password(
    request: Request,
    password: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role == UserRole.ADMIN:
        raise ConflictError(message="You are not allowed to perform this action.")

    await authenticate_user(credentials=UserCredentials(email=user.email, password=password), db=db)
    await OTPManager().send_otp(email=user.email, purpose=OTPPurpose.DEL_ACC)
    return ResponseModel(code=ResponseCode.CREATED, message="OTP sent to the email")

@router.post("/otp/verify", status_code=HTTP_200_OK, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_otp(
    request: Request,
    response: Response,
    otp: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    response.delete_cookie(key="refresh_token")
    await OTPManager().verify_otp(user.email, otp, purpose=OTPPurpose.DEL_ACC)
    await remove_user(email=user.email, db=db)
    return ResponseModel(code=ResponseCode.ACK, message="Account deleted successfully!", details={"email": user.email})
