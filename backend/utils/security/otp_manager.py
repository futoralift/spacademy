# TODO Add attempt counter

import json
import os
import random
import smtplib
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


    def __init__(self, ):
        self.smtp_email = os.getenv("SMTP_EMAIL")
        self.smtp_password = os.getenv("SMTP_PASS")


    async def __generate_otp(self, email: str, purpose: OTPPurpose) -> str:
        otp = "".join([str(random.randint(0, 9)) for _ in range(self.OTP_LENGTH)])
        salt, hashed_otp = generate_hash(otp)
        value = json.dumps({"salt": salt, "otp": hashed_otp})
        key = f'{purpose}:{email}'
        try:
            await redis_client.set(key, value, ex=self.EXPIRY_SEC)
        except RedisError as exc:
            raise ExternalServiceError(
                "OTP store is unavailable. Check your Redis configuration and service status."
            ) from exc
        return otp


    async def send_otp(self, email: str, purpose: OTPPurpose):
        otp = await self.__generate_otp(email, purpose)

        msg = MIMEText(f"Your OTP is: {otp}\nThis OTP expires in {self.EXPIRY_SEC/60} minutes.")
        msg["Subject"] = "OTP - Todo By Mukund"
        msg["From"] = self.smtp_email
        msg["To"] = email

        try:
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(self.smtp_email, self.smtp_password)
            server.send_message(msg)
            server.quit()
        except SMTPException:
            raise HTTPException(status_code=500, detail="Failed to send OTP email.")

    @staticmethod
    async def verify_otp(email: str, otp: str, purpose: OTPPurpose):
        key = f"{purpose}:{email}"
        try:
            payload = await redis_client.get(key)
        except RedisError as exc:
            raise ExternalServiceError(
                "OTP store is unavailable. Check your Redis configuration and service status."
            ) from exc

        if payload is None:
            raise HTTPException(status_code=HTTP_408_REQUEST_TIMEOUT, detail="OTP expired or not requested.")

        data = json.loads(payload)
        salt = data["salt"]
        stored_otp_hash = data["otp"]
        if not verify_hash(otp, stored_otp_hash, salt):
            raise ValidationError("Wrong OTP")

        try:
            await redis_client.delete(key)
        except RedisError as exc:
            raise ExternalServiceError(
                "OTP store is unavailable. Check your Redis configuration and service status."
            ) from exc
