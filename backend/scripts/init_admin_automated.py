import asyncio
import os
import uuid
from datetime import datetime
from data.core import get_db
from data.schemas import User, UserRole, AuthServiceProvider
from utils.security.hashing import get_password_hash


async def create_automated_admin():
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    first_name = os.getenv("ADMIN_FIRST_NAME", "Admin")
    last_name = os.getenv("ADMIN_LAST_NAME", "User")
    phone = os.getenv("ADMIN_PHONE", "+910000000000")

    if not email or not password:
        print("ERROR: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables.")
        return

    print(f"Creating admin: {email}...")

    async for db in get_db():
        # Check if user already exists
        from sqlalchemy import select
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            print(f"User {email} already exists. Skipping.")
            return

        admin = User(
            id=uuid.uuid4(),
            firstName=first_name,
            lastName=last_name,
            email=email,
            passwordHash=get_password_hash(password),
            role=UserRole.ADMIN,
            avatar=f"https://ui-avatars.com/api/?name={first_name}+{last_name}&background=000&color=fff",
            createdAt=datetime.now(),
            authServiceProvider=AuthServiceProvider.APP,
            phone=phone,
        )

        db.add(admin)
        await db.commit()
        print(f"SUCCESS: Admin {email} created!")
        break

if __name__ == "__main__":
    asyncio.run(create_automated_admin())
