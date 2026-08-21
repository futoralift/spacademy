from typing import Optional

from pydantic import BaseModel, EmailStr

from data.schemas import UserRole


class SignUpModel(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: Optional[str] = None
    password: Optional[str] = None

class GoogleFinalizeModel(BaseModel):
    email: EmailStr
    phone: str
    avatar: Optional[str] = None

class UserCredentials(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginOTPVerificationModel(BaseModel):
    email: EmailStr
    otp: str

class UserResponseModel(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    avatar: str
    role: UserRole


class UserRoleUpdateModel(BaseModel):
    email: EmailStr
    role: UserRole


class UserProfileUpdateModel(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    avatar: Optional[str] = None
