import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def reset():
    uri = os.getenv("PG_URI")
    print(f"DEBUG: Attempting to reset DB at: {uri.split('@')[-1] if uri else 'MISSING'}")
    
    if not uri:
        print("ERROR: PG_URI environment variable is missing!")
        return

    # Create a fresh engine just for this reset
    temp_engine = create_async_engine(uri)
    
    try:
        async with temp_engine.begin() as conn:
            print("Executing DROP TABLE IF EXISTS alembic_version CASCADE...")
            await conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
        print("SUCCESS: alembic_version table dropped.")
    except Exception as e:
        print(f"FAILURE: Could not drop table: {e}")
    finally:
        await temp_engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset())
