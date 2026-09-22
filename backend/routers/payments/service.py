import os
import uuid
import razorpay
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession

from routers.students.models import StudentResponseModel
from routers.courses.models import CourseResponseModel
from routers.payments import repo, models
from routers.courses.repo import fetch_course_by_id
from utils.errors import AppError

from routers.students.repo import fetch_student_profile_by_user_id

load_dotenv()


def _get_razorpay_client() -> razorpay.Client:
    """
    Lazily create a Razorpay client.
    Initialising at module load time causes an import error when
    RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are absent (e.g. in dev without payments).
    """
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise AppError(
            code="RAZORPAY_NOT_CONFIGURED",
            message="Razorpay credentials are not set. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
            status_code=503,
        )
    return razorpay.Client(auth=(key_id, key_secret))


async def create_razorpay_order(db: AsyncSession, course_id: str, current_user_id: uuid.UUID):
    course = await fetch_course_by_id(course_id, db)
    if not course:
        raise AppError(code="COURSE_NOT_FOUND", message="Course not found", status_code=404)

    if not course.isPaid or course.amount is None:
        raise AppError(
            code="INVALID_COURSE",
            message="This course is free or its price has not been set.",
            status_code=400,
        )

    student = await fetch_student_profile_by_user_id(str(current_user_id), db)
    if not student:
        raise AppError(code="STUDENT_NOT_FOUND", message="Current user is not a student.", status_code=403)

    razorpay_client = _get_razorpay_client()

    amount_in_paise = int(course.amount * 100)
    data = {
        "amount": amount_in_paise,
        "currency": course.currency or "INR",
        "receipt": f"receipt_{uuid.uuid4().hex[:10]}",
        "notes": {
            "course_id": str(course.id),
            "student_id": str(student.id),
        },
    }

    try:
        razorpay_order = razorpay_client.order.create(data=data)
    except Exception as e:
        raise AppError(
            code="RAZORPAY_ERROR",
            message=f"Failed to create Razorpay order: {e}",
            status_code=500,
        )

    await repo.create_payment(
        db,
        order_id=razorpay_order["id"],
        amount=course.amount,
        currency=course.currency or "INR",
        student_id=student.id,
        course_id=course.id,
    )

    return razorpay_order


async def verify_razorpay_payment(
    db: AsyncSession,
    order_id: str,
    payment_id: str,
    signature: str,
    course_id: str,
    current_user_id: uuid.UUID,
):
    params_dict = {
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": signature,
    }

    razorpay_client = _get_razorpay_client()

    try:
        razorpay_client.utility.verify_payment_signature(params_dict)
    except Exception:
        await repo.update_payment_status(db, order_id, payment_id, signature, "failed")
        raise AppError(
            code="PAYMENT_VERIFICATION_FAILED",
            message="Invalid payment signature. Payment could not be verified.",
            status_code=400,
        )

    payment = await repo.get_payment_by_order_id(db, order_id)
    if not payment:
        raise AppError(code="PAYMENT_NOT_FOUND", message="Payment record not found.", status_code=404)

    student = await fetch_student_profile_by_user_id(str(current_user_id), db)
    if not student or student.id != payment.studentId:
        raise AppError(
            code="UNAUTHORIZED_PAYMENT",
            message="Authenticated user does not match the payment record.",
            status_code=403,
        )

    await repo.update_payment_status(db, order_id, payment_id, signature, "success")
    await repo.enroll_student_in_course(db, student.id, payment.courseId)

    return {"status": "success", "message": "Payment verified and student enrolled."}


async def fetch_all_payments(db: AsyncSession) -> list[models.PaymentInfoModel]:
    payments = await repo.get_all_payments(db)
    return [
        models.PaymentInfoModel(
            id=p.id,
            studentId=p.studentId,
            studentName=f"{p.student.user.firstName} {p.student.user.lastName}",
            studentEmail=p.student.user.email,
            studentAvatar=p.student.user.avatar,
            courseName=p.course.name,
            amount=p.amount,
            currency=p.currency,
            status=p.status,
            createdAt=p.createdAt.isoformat(),
            razorpayOrderId=p.razorpayOrderId,
            razorpayPaymentId=p.razorpayPaymentId,
            student=StudentResponseModel(
                id=str(p.student.user.id),
                firstName=p.student.user.firstName,
                lastName=p.student.user.lastName,
                email=p.student.user.email,
                avatar=p.student.user.avatar,
                studentNumber=p.student.user.phone,
                rollNo=p.student.rollNo,
                standard=p.student.standard,
                board=p.student.board,
                schoolName=p.student.schoolName,
                parentName=p.student.parentName,
                parentNumber=p.student.parentMobileNumber,
                authServiceProvider=p.student.user.authServiceProvider,
                createdAt=p.student.user.createdAt,
                deletedAt=p.student.user.deletedAt,
                lastLoginAt=p.student.user.lastLogIn,
                courses=[
                    CourseResponseModel(
                        id=str(c.id),
                        name=c.name,
                        description=c.description,
                        standards=c.standards,
                        image=c.image,
                        highlights=c.highlights,
                        isActive=c.isActive,
                        isPaid=c.isPaid,
                        mode=c.mode,
                        amount=c.amount,
                        currency=c.currency,
                    )
                    for c in p.student.courses
                ],
            ),
        )
        for p in payments
    ]
