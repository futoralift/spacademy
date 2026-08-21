import os

from dotenv import load_dotenv
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv(override=True)

pg_uri = os.getenv("PG_URI")
if not pg_uri:
    raise RuntimeError("PG_URI is not set in environment variables.")

try:
    make_url(pg_uri)
except Exception as exc:
    raise RuntimeError(
        "PG_URI is invalid. If your database password contains special characters like '@', "
        "URL-encode them (e.g. '@' -> '%40')."
    ) from exc

engine = create_async_engine(pg_uri)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
    class_=AsyncSession,
    autocommit=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
