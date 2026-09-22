import asyncio
import json
import os
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from enum import Enum
from smtplib import SMTPException

from redis.exceptions import RedisError
from fastapi import HTTPException
from starlette.status import HTTP_408_REQUEST_TIMEOUT

from utils.errors import ExternalServiceError, ValidationError
from utils.redis_client import redis_client
from utils.security.hashing import generate_hash, verify_hash


class OTPPurpose(str, Enum):
    LOGIN = "LOGIN"
    DEL_ACC = "DELETE_ACCOUNT"
    PASS_CHANGE = "PASSWORD_CHANGE"
    PASS_RECOVER = "PASSWORD_RECOVER"


class OTPManager:
    OTP_LENGTH = 6
    EXPIRY_SEC = 5 * 60
    MAX_ATTEMPTS = 5

    def __init__(self):
        self.smtp_email = os.getenv("SMTP_EMAIL")
        self.smtp_password = os.getenv("SMTP_PASS")
        self.from_name = os.getenv("SMTP_FROM_NAME", "SF Academy")

    async def __generate_otp(self, email: str, purpose: OTPPurpose) -> str:
        otp = "".join([str(random.randint(0, 9)) for _ in range(self.OTP_LENGTH)])
        salt, hashed_otp = generate_hash(otp)
        value = json.dumps({"salt": salt, "otp": hashed_otp, "attempts": 0})
        key = f"{purpose}:{email}"
        try:
            await redis_client.set(key, value, ex=self.EXPIRY_SEC)
        except RedisError as exc:
            raise ExternalServiceError(
                "OTP store is unavailable. Check your Redis configuration and service status."
            ) from exc
        return otp

    def __build_email(self, to_email: str, otp: str) -> MIMEMultipart:
        """Build a plain-text OTP email with branded subject and sender."""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your OTP Code — {self.from_name}"
        msg["From"] = f"{self.from_name} <{self.smtp_email}>"
        msg["To"] = to_email

        expiry_minutes = int(self.EXPIRY_SEC / 60)
        body = (
            f"Your one-time password (OTP) is:\n\n"
            f"    {otp}\n\n"
            f"This code expires in {expiry_minutes} minutes.\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"— {self.from_name}"
        )
        msg.attach(MIMEText(body, "plain"))
        return msg

    def __send_smtp(self, msg: MIMEMultipart) -> None:
        """Synchronous SMTP send — run in a thread pool to avoid blocking the event loop."""
        if not self.smtp_email or not self.smtp_password:
            raise HTTPException(
                status_code=500,
                detail="SMTP credentials are not configured. Set SMTP_EMAIL and SMTP_PASS.",
            )
        try:
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(self.smtp_email, self.smtp_password)
            server.send_message(msg)
            server.quit()
        except SMTPException as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send OTP email: {exc}",
            )

    async def send_otp(self, email: str, purpose: OTPPurpose) -> None:
        otp = await self.__generate_otp(email, purpose)
        msg = self.__build_email(email, otp)
        # Run the blocking SMTP call in a thread pool so we don't block the async loop
        await asyncio.to_thread(self.__send_smtp, msg)

    @staticmethod
    async def verify_otp(email: str, otp: str, purpose: OTPPurpose) -> None:
        key = f"{purpose}:{email}"
        try:
            payload = await redis_client.get(key)
        except RedisError as exc:
            raise ExternalServiceError(
                "OTP store is unavailable. Check your Redis configuration and service status."
            ) from exc

        if payload is None:
            raise HTTPException(
                status_code=HTTP_408_REQUEST_TIMEOUT,
                detail="OTP expired or not requested.",
            )

        data = json.loads(payload)
        salt = data["salt"]
        stored_otp_hash = data["otp"]
        attempts = data.get("attempts", 0)

        # Enforce max attempt limit
        if attempts >= OTPManager.MAX_ATTEMPTS:
            try:
                await redis_client.delete(key)
            except RedisError:
                pass
            raise ValidationError(
                "Too many failed OTP attempts. Please request a new OTP.",
            )

        if not verify_hash(otp, stored_otp_hash, salt):
            # Increment attempt counter in Redis
            data["attempts"] = attempts + 1
            try:
                ttl = await redis_client.ttl(key)
                await redis_client.set(key, json.dumps(data), ex=max(ttl, 1))
            except RedisError:
                pass
            raise ValidationError("Wrong OTP. Please try again.")

        # OTP verified — delete it so it cannot be reused
        try:
            await redis_client.delete(key)
        except RedisError as exc:
            raise ExternalServiceError(
                "OTP store is unavailable. Check your Redis configuration and service status."
            ) from exc
