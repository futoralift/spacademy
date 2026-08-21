from typing import Optional
from pydantic import BaseModel
import uuid
from routers.students.models import StudentResponseModel

class CreateOrderRequest(BaseModel):
    courseId: str

class RazorpayOrderResponse(BaseModel):
    id: str
    amount: int
    currency: str
    receipt: str
    status: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    courseId: str

class PaymentResponse(BaseModel):
    id: str
    status: str
    message: Optional[str] = None

class PaymentInfoModel(BaseModel):
    id: uuid.UUID
    studentId: uuid.UUID
    studentName: str
    studentEmail: str
    studentAvatar: Optional[str] = None
    courseName: str
    amount: float
    currency: str
    status: str
    createdAt: str # ISO string
    razorpayOrderId: str
    razorpayPaymentId: Optional[str] = None
    student: StudentResponseModel
