from pydantic import BaseModel


class PasswordChangeModel(BaseModel):
    newPassword: str
    otp: str
