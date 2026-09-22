# Setup & Installation Guide

## Prerequisites

Install the following tools before proceeding:

| Tool | Version | Install |
|---|---|---|
| Python | 3.13+ | https://www.python.org/downloads/ |
| `uv` | latest | `pip install uv` or https://docs.astral.sh/uv/getting-started/installation/ |
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | Bundled with Node.js |
| PostgreSQL | 16+ | https://www.postgresql.org/download/ |
| Redis | 7+ | https://redis.io/docs/getting-started/ |
| Git | any | https://git-scm.com |

> **Windows users:** Redis is not officially supported on Windows. Use WSL2 or Docker for Redis.

---

## Quick Start (Docker — simplest)

```bash
# 1. Clone
git clone <repo-url> sf-academy && cd sf-academy

# 2. Configure backend
cp backend/.env.example backend/.env
# Open backend/.env in a text editor and fill in the values

# 3. Configure frontend
cp frontend/.env.example frontend/.env

# 4. Start everything
docker compose up --build

# 5. First-time: run migrations
docker compose exec backend uv run alembic upgrade head

# 6. Optional: create the first admin account
docker compose exec backend uv run python scripts/init_admin_automated.py
```

---

## Local Development Setup (without Docker)

### Step 1: PostgreSQL

Ensure PostgreSQL is running. Create a database:

```sql
CREATE DATABASE sf_academy;
```

Or on command line:
```bash
createdb sf_academy
```

### Step 2: Redis

**Linux/macOS:**
```bash
redis-server
```

**Windows (WSL2):**
```bash
sudo service redis-server start
```

**Windows (Docker):**
```bash
docker run -d -p 6379:6379 redis:7
```

### Step 3: Backend

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env — at minimum, set SECRET_KEY, PG_URI, REDIS_URL

# Install Python dependencies
uv sync

# Initialize the database (creates tables + storage directories)
uv run python scripts/init_db.py

# Run Alembic migrations
uv run alembic upgrade head

# (Optional) Create admin account interactively
uv run python scripts/init_admin.py

# Start backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend available at: **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

### Step 4: Frontend

```bash
cd frontend

# Copy environment config
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend available at: **http://localhost:5173**

---

## Verifying the Setup

### Backend Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

### Test an API Endpoint
```bash
curl http://localhost:8000/docs
# Opens Swagger UI in browser
```

### Frontend
Open http://localhost:5173 — you should see the SF Academy landing page.

---

## Common Issues

### `PG_URI is not set in environment variables`
You haven't created `backend/.env`. Run `cp backend/.env.example backend/.env` and fill in the values.

### `Database host 'postgres' could not be resolved`
Your `PG_URI` uses `postgres` as the hostname (Docker service name), but you're running locally. Change the host to `localhost`:
```
PG_URI=postgresql+asyncpg://postgres:postgres@localhost:5432/sf_academy
```

### `redis.exceptions.ConnectionError`
Redis is not running. Start it (`redis-server`) or run `docker run -d -p 6379:6379 redis:7`.

### `SMTP credentials are not configured`
You need to set `SMTP_EMAIL` and `SMTP_PASS` in `backend/.env` to use OTP-based login.  
For local testing of non-OTP flows, you can use `POST /auth/login` with email+password.

### `npm run dev` fails — module not found
Run `npm install` in the `frontend/` directory first.

---

## Resetting the Database

```bash
# Drop and recreate
dropdb sf_academy && createdb sf_academy

# Re-run migrations
uv run alembic upgrade head

# Re-create admin
uv run python scripts/init_admin_automated.py
```
