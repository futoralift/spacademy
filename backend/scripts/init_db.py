import asyncio
import socket

from sqlalchemy import text
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import create_async_engine

from data.core import engine, pg_uri
from data.schemas import *


def validate_database_host() -> None:
    url = make_url(pg_uri)
    host = url.host
    port = url.port or 5432

    if not host:
        raise RuntimeError("PG_URI must include a database host.")

    try:
        socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise RuntimeError(
            f"Database host '{host}' could not be resolved. "
            "If you are running outside Docker, use 'localhost' or your actual Postgres host in PG_URI. "
            "If you are running in Docker, make sure the Postgres service/container name matches the hostname in PG_URI."
        ) from exc


async def ensure_database_exists() -> None:
    url = make_url(pg_uri)
    target_db = url.database
    print(f"Connecting to database '{target_db}'.")
    if not target_db:
        raise RuntimeError("PG_URI must include a database name.")

    validate_database_host()

    maintenance_url = url.set(database="postgres")
    maintenance_engine = create_async_engine(
        maintenance_url.render_as_string(hide_password=False),
        isolation_level="AUTOCOMMIT",
    )

    db_identifier = target_db.replace('"', '""')

    try:
        async with maintenance_engine.connect() as conn:
            result = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                {"db_name": target_db},
            )
            exists = result.scalar() is not None
            if not exists:
                await conn.execute(text(f'CREATE DATABASE "{db_identifier}"'))
                print(f"Created database '{target_db}'.")
    finally:
        await maintenance_engine.dispose()

async def init():
    await ensure_database_exists()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()
    print("Database tables created successfully.")


if __name__ == "__main__":
    asyncio.run(init())
