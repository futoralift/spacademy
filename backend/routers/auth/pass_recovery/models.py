from pydantic import BaseModel, EmailStr


class PasswordRecoveryModel(BaseModel):
    newPassword: str
    recoveryToken: str

class PassRecoveryOTPVerificationModel(BaseModel):
    email: EmailStr
    otp: str
