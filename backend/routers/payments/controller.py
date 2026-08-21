from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from data.core import get_db
from routers.payments import service, models
from utils.security.tokens import get_current_student, get_current_admin
from utils.models.pydantic_cm import UserModel
from starlette.status import HTTP_200_OK, HTTP_201_CREATED

router = APIRouter(prefix="/payment", tags=["Payments"])

@router.post("/order", status_code=HTTP_201_CREATED, response_model=models.RazorpayOrderResponse)
async def create_order(
    payload: models.CreateOrderRequest,
    user: UserModel = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
):
    order = await service.create_razorpay_order(db, payload.courseId, user.id)
    return order

@router.post("/verify", status_code=HTTP_200_OK, response_model=models.PaymentResponse)
async def verify_payment(
    payload: models.VerifyPaymentRequest,
    user: UserModel = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
):
    result = await service.verify_razorpay_payment(
        db,
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
        payload.courseId,
        user.id
    )
    return models.PaymentResponse(id=payload.razorpay_payment_id, status=result["status"], message=result["message"])

@router.get("/", status_code=HTTP_200_OK, response_model=list[models.PaymentInfoModel])
async def get_all_payments(
    user: UserModel = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await service.fetch_all_payments(db)