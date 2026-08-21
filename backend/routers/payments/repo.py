import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from data.schemas import Payment, Student, student_courses, Course, User
from typing import Optional, List
from sqlalchemy.orm import selectinload

async def create_payment(
    db: AsyncSession,
    order_id: str,
    amount: float,
    currency: str,
    student_id: uuid.UUID,
    course_id: uuid.UUID
) -> Payment:
    payment = Payment(
        razorpayOrderId=order_id,
        amount=amount,
        currency=currency,
        studentId=student_id,
        courseId=course_id,
        status="pending"
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment

async def get_payment_by_order_id(db: AsyncSession, order_id: str) -> Optional[Payment]:
    result = await db.execute(select(Payment).where(Payment.razorpayOrderId == order_id))
    return result.scalars().first()

async def update_payment_status(
    db: AsyncSession,
    order_id: str,
    payment_id: str,
    signature: str,
    status: str
) -> Optional[Payment]:
    payment = await get_payment_by_order_id(db, order_id)
    if payment:
        payment.razorpayPaymentId = payment_id
        payment.razorpaySignature = signature
        payment.status = status
        await db.commit()
        await db.refresh(payment)
    return payment

async def enroll_student_in_course(db: AsyncSession, student_id: uuid.UUID, course_id: uuid.UUID):
    # Check if already enrolled
    query = select(student_courses).where(
        student_courses.c.student_id == student_id,
        student_courses.c.course_id == course_id
    )
    result = await db.execute(query)
    if result.first() is None:
        stmt = student_courses.insert().values(student_id=student_id, course_id=course_id)
        await db.execute(stmt)
        await db.commit()

async def get_all_payments(db: AsyncSession) -> List[Payment]:
    query = (
        select(Payment)
        .options(
            selectinload(Payment.student).selectinload(Student.user),
            selectinload(Payment.student).selectinload(Student.courses),
            selectinload(Payment.course)
        )
        .order_by(Payment.createdAt.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()
