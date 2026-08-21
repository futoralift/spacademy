from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Request, Response
from fastapi.params import Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_201_CREATED, HTTP_202_ACCEPTED, HTTP_200_OK

from data.core import get_db
from data.schemas import AuthServiceProvider
from routers.auth.repo_user import set_user_timestamp, set_user_role, fetch_user_by_email, update_user_profile
from routers.auth.models import UserCredentials, SignUpModel, LoginOTPVerificationModel, Token, UserResponseModel, UserRoleUpdateModel, UserProfileUpdateModel, GoogleFinalizeModel
from routers.auth.service import authenticate_user, store_pend_user, login_verification, tokens_generator, google_finalize_verification
from utils.const import RATE_LIMIT
from utils.errors import ValidationError
from routers.auth.pass_recovery.controller import router as pass_recovery_router
from routers.auth.google.controller import router as google_router
from utils.models.common_models import ResponseModel, ResponseCode
from utils.models.pydantic_cm import UserModel
from utils.models.sql_pydantic_parser import user_2_p
from utils.security.otp_manager import OTPPurpose, OTPManager
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_user_refresh_token, get_current_user, get_current_admin

router = APIRouter(prefix="/auth", tags=["auth"])
router.include_router(pass_recovery_router)
router.include_router(google_router)


@router.post("/login", status_code=HTTP_202_ACCEPTED, response_model=Token)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def login(request: Request, response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)):
    if form_data.username is None or form_data.password is None:
        raise ValidationError("Email or password is required")

    credentials = UserCredentials(email=form_data.username, password=form_data.password)

    user = await authenticate_user(credentials=credentials, db=db)
    await set_user_timestamp(email=user.email, date_time_field="lastLogIn", new_date_time=datetime.now(), db=db)

    return await tokens_generator(response, user, db)


@router.get("/refresh", status_code=HTTP_201_CREATED, response_model=Token)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def token_regenerator(request: Request, response: Response, user: UserModel = Depends(get_current_user_refresh_token), db: AsyncSession = Depends(get_db)):
    return await tokens_generator(response, user, db)


@router.get("/logout", status_code=HTTP_200_OK, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def logout(request: Request, response: Response):
    response.delete_cookie(key="refresh_token")
    return ResponseModel(code=ResponseCode.ACK, message="Successfully Logged Out")


@router.post("/register", status_code=HTTP_202_ACCEPTED, response_model=ResponseModel)
@limiter.limit(f'{RATE_LIMIT}/minute')
async def register_user(request: Request, signup_data: SignUpModel, db: AsyncSession = Depends(get_db)):
    await store_pend_user(signup_data, AuthServiceProvider.APP, db)
    return ResponseModel(code=ResponseCode.CREATED, message="Successfully Registered")


@router.post("/otp/request", status_code=HTTP_201_CREATED, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def otp_request(request: Request, email: EmailStr):
    await OTPManager().send_otp(email, purpose=OTPPurpose.LOGIN)
    return ResponseModel(code=ResponseCode.CREATED, message="Successfully sent OTP to the email")


@router.post("/otp/verify", status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def otp_verifier(request: Request, payload: LoginOTPVerificationModel, db: AsyncSession = Depends(get_db)):
    await OTPManager().verify_otp(payload.email, payload.otp, purpose=OTPPurpose.LOGIN)
    token = await login_verification(payload.email, db)
    return {"loginToken": token, "tokenType": "bearer"}


@router.post("/google/finalize", status_code=HTTP_200_OK, response_model=Token)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def google_finalize_verifier(request: Request, payload: GoogleFinalizeModel, db: AsyncSession = Depends(get_db)):
    token_data = await google_finalize_verification(payload.email, payload.phone, payload.avatar, db)
    return Token(**token_data)


@router.post("/token_login", status_code=HTTP_202_ACCEPTED, response_model=Token)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def token_login(request: Request, response: Response, user: UserModel = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await set_user_timestamp(email=user.email, date_time_field="lastLogIn", new_date_time=datetime.now(), db=db)
    return await tokens_generator(response, user, db)

@router.get("/me", response_model=UserResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_current_user_info(request: Request, user: UserModel = Depends(get_current_user)) -> UserResponseModel:
    return UserResponseModel(
        id=str(user.id),
        email=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        avatar=user.avatar,
        role=user.role,
        phone=user.phone
    )


@router.patch("/users/role", status_code=HTTP_200_OK, response_model=UserResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def update_user_role(
    request: Request,
    payload: UserRoleUpdateModel,
    _: UserModel = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> UserResponseModel:
    await set_user_role(payload.email, payload.role, db)
    updated_user = user_2_p(await fetch_user_by_email(payload.email, db))
    return UserResponseModel(
        id=str(updated_user.id),
        email=updated_user.email,
        firstName=updated_user.firstName,
        lastName=updated_user.lastName,
        avatar=updated_user.avatar,
        role=updated_user.role,
        phone=updated_user.phone
    )


@router.put("/me", response_model=UserResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def update_current_user_info(
    request: Request,
    payload: UserProfileUpdateModel,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponseModel:
    await update_user_profile(
        email=user.email,
        first_name=payload.firstName,
        last_name=payload.lastName,
        new_email=payload.email,
        phone=payload.phone,
        avatar=payload.avatar,
        db=db,
    )
    updated_user = user_2_p(await fetch_user_by_email(payload.email, db))
    return UserResponseModel(
        id=str(updated_user.id),
        email=updated_user.email,
        firstName=updated_user.firstName,
        lastName=updated_user.lastName,
        avatar=updated_user.avatar,
        role=updated_user.role,
        phone=updated_user.phone,
    )
