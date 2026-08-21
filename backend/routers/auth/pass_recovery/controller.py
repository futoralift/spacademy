from fastapi import APIRouter, Depends, Request
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_202_ACCEPTED

from data.core import get_db
from routers.auth.pass_recovery.models import PassRecoveryOTPVerificationModel, PasswordRecoveryModel
from routers.auth.pass_recovery.service import change_user_password_by_token, generate_recovery_token
from routers.auth.repo_user import fetch_user_by_email
from utils.const import RATE_LIMIT
from utils.models.common_models import ResponseModel, ResponseCode
from utils.security.otp_manager import OTPManager, OTPPurpose
from utils.security.rate_limiting import limiter

router = APIRouter(prefix="/recovery", tags=["User Password Recovery"])


@router.get("/otp/request", status_code=HTTP_201_CREATED, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def generate_otp(request: Request, email: EmailStr, db: AsyncSession = Depends(get_db)):
    await fetch_user_by_email(email=email, db=db)
    await OTPManager().send_otp(email, purpose=OTPPurpose.PASS_RECOVER)
    return ResponseModel(code=ResponseCode.CREATED, message="Successfully sent OTP to the email")


@router.post("/otp/verify", status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_otp(request: Request, payload: PassRecoveryOTPVerificationModel):
    await OTPManager().verify_otp(payload.email, payload.otp, purpose=OTPPurpose.PASS_RECOVER)
    return await generate_recovery_token(payload.email)


@router.post("/change_password", status_code=HTTP_202_ACCEPTED, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def change_password(request: Request, payload: PasswordRecoveryModel, db: AsyncSession = Depends(get_db)):
    await change_user_password_by_token(token=payload.recoveryToken, new_password=payload.newPassword, db=db)
    return ResponseModel(code=ResponseCode.UPDATED, message="Password changed successfully")