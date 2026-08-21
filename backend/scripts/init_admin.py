import asyncio
import uuid
from datetime import datetime

import phonenumbers
import zxcvbn
from phonenumbers import NumberParseException
from pydantic import BaseModel, EmailStr
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import get_db
from data.schemas import User, UserRole, AuthServiceProvider
from utils.errors import DatabaseError
from utils.security.hashing import get_password_hash
from utils.sv_logger import sv_logger
from utils.validation import normalize_phone


class AdminInputModel(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    phone: str


async def create_init_admin(admin_model: AdminInputModel, db: AsyncSession):
    try:
        admin = User(
            id=uuid.uuid4(),
            firstName=admin_model.firstName,
            lastName=admin_model.lastName,
            email=admin_model.email,
            passwordHash=get_password_hash(admin_model.password),
            role=UserRole.ADMIN,
            avatar="",
            createdAt=datetime.now(),
            refreshToken=None,
            lastLogIn=None,
            deletedAt=None,
            authServiceProvider=AuthServiceProvider.APP,
            phone=admin_model.phone,
        )

        db.add(admin)
        await db.commit()
        await db.refresh(admin)
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to create init admin",
            exc_info=True,
        )
        raise DatabaseError(message="Failed to create init admin") from se


async def run_init_admin(admin_model: AdminInputModel) -> None:
    async for db in get_db():
        await create_init_admin(admin_model=admin_model, db=db)
        break

def is_valid_number(phone: str):
    try:
        parsed = phonenumbers.parse(phone, None)
        return phonenumbers.is_valid_number(parsed)
    except NumberParseException:
        return False

def cli_input():
    firstname = str(input("First Name: "))
    lastname = str(input("Last Name: "))
    email = str(input("Email: "))

    while True:
        phone = input("Phone Number (+countrycode): ")

        if not is_valid_number(phone):
            print("Phone Number must be valid")
            continue
        phone = normalize_phone(phone)
        break

    while True:
        password = str(input("Password: "))

        pass_analysis = zxcvbn.zxcvbn(password)
        if not pass_analysis["score"] >= 3:
            print("Password is weak")
            print(pass_analysis["feedback"])
            print("Try again")
            continue
        break

    admin_model = AdminInputModel(
        firstName=firstname.capitalize(),
        lastName=lastname.capitalize(),
        email=email,
        password=password,
        phone=phone,
    )

    asyncio.run(run_init_admin(admin_model))


if __name__ == "__main__":
    cli_input()
