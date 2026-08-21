FROM python:3.13-slim
LABEL author="Mukund Thorat"

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:0.9.10 /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

ENV PATH="/app/.venv/bin:$PATH"

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "PYTHONPATH=/app uv run alembic upgrade head && PYTHONPATH=/app uv run python scripts/init_admin_automated.py && uv run uvicorn main:app --host 0.0.0.0 --port 8000"]
