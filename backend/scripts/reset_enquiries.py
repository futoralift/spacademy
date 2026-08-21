import asyncio
from data.core import engine
from data.schemas import Base, Enquiry

from sqlalchemy import text

async def reset_enquiries():
    async with engine.begin() as conn:
        # Drop the enquiries table
        # We handle any error (like if it doesn't exist)
        try:
            await conn.execute(text("DROP TABLE IF EXISTS enquiries"))
        except:
            pass
        # Recreate all tables
        await conn.run_sync(Base.metadata.create_all)
    print("Enquiries table reset successfully.")

if __name__ == "__main__":
    asyncio.run(reset_enquiries())
