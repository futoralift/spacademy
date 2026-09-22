# Testing Guide

## Overview

SF Academy currently relies primarily on manual end-to-end testing. This document describes the existing test infrastructure, manual test procedures, and recommendations for expanding test coverage.

---

## Current Test Infrastructure

### Backend
- **Framework:** None currently implemented
- **Test HTTP file:** `backend/test_main.http` — basic HTTP request templates for manual API testing
- **Recommended:** `pytest` + `httpx` + `pytest-asyncio`

### Frontend
- **Framework:** None currently implemented
- **Test directory:** `frontend/` (no `__tests__` or `spec` files present)
- **Recommended:** Vitest + React Testing Library

---

## Manual Testing Procedures

### 1. Authentication Flow

**Registration (OTP-based):**
```
POST /auth/register  { firstName, lastName, email, phone, password }
→ Email with OTP is sent
→ POST /auth/otp/verify  { email, otp }
→ Returns short-lived loginToken
→ POST /auth/token_login (with loginToken in Authorization header)
→ Returns access_token + sets refresh_token cookie
```

**Login (email + password):**
```
POST /auth/login  (form-data: username=email, password=...)
→ Returns access_token + sets refresh_token cookie
```

**Token Refresh:**
```
GET /auth/refresh  (cookie sent automatically)
→ Returns new access_token
```

**Logout:**
```
GET /auth/logout
→ refresh_token cookie is cleared
```

**Google OAuth:**
```
GET /auth/google → redirect to Google
→ GET /auth/google/callback?code=... → pending user stored
→ POST /auth/google/finalize { email, phone, avatar }
→ Returns access_token
```

### 2. Role-Based Access

Test that each portal is protected:
- Visit `/dashboard/admin/overview` without logging in → should redirect to `/login`
- Log in as a student → `/dashboard` should redirect to `/dashboard/student/overview`
- Log in as a teacher → `/dashboard` should redirect to `/dashboard/teacher/overview`
- Log in as admin → `/dashboard` should redirect to `/dashboard/admin/overview`
- As a student, try to visit `/dashboard/admin/overview` → should redirect to student dashboard

### 3. Rate Limiting

```bash
# Test that the 41st request within a minute returns 429
for i in $(seq 1 41); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:8000/auth/login \
    -F "username=test@example.com" -F "password=wrong"
done
```

The 41st response should be `429 Too Many Requests`.

### 4. Payment Flow

1. Log in as a student
2. Find a paid course (isPaid=true, amount set)
3. `POST /payments/create-order { courseId }` → get Razorpay order
4. Use Razorpay test cards (see https://razorpay.com/docs/payments/payments/test-card-upi-details/)
5. `POST /payments/verify { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId }`
6. Verify student is enrolled in the course

### 5. Health Check

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

---

## Recommended Test Setup

### Backend — pytest

**Install test dependencies:**
```bash
# Add to pyproject.toml [tool.uv.dev-dependencies]
uv add --dev pytest pytest-asyncio httpx
```

**Example test structure:**
```
backend/
├── tests/
│   ├── conftest.py          # Database setup/teardown, test client
│   ├── test_auth.py         # Auth endpoint tests
│   ├── test_courses.py      # Course CRUD tests
│   ├── test_payments.py     # Payment flow tests
│   └── test_health.py       # Health check
```

**Example conftest.py:**
```python
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from main import app
from data.core import get_db
from data.schemas import Base

TEST_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/sf_academy_test"

@pytest.fixture(scope="session")
async def engine():
    eng = create_async_engine(TEST_DB_URL)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()

@pytest.fixture
async def db(engine):
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session

@pytest.fixture
async def client(db):
    app.dependency_overrides[get_db] = lambda: db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
```

**Run tests:**
```bash
cd backend
uv run pytest tests/ -v
```

### Frontend — Vitest

**Install:**
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Add to `vite.config.ts`:**
```typescript
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.ts'],
}
```

**Run tests:**
```bash
npm run test
```

---

## API Testing with the HTTP File

`backend/test_main.http` can be used with VS Code's REST Client extension or JetBrains HTTP Client:

```http
### Health check
GET http://localhost:8000/health

### Login
POST http://localhost:8000/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin@sfacademy.com&password=yourpassword

### Get current user
GET http://localhost:8000/auth/me
Authorization: Bearer {{access_token}}
```

---

## Continuous Integration (Recommended)

Add a GitHub Actions workflow at `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: sf_academy_test
        ports: ["5432:5432"]
      redis:
        image: redis:7
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v2
      - run: uv sync
        working-directory: backend
      - run: uv run pytest tests/ -v
        working-directory: backend
        env:
          PG_URI: postgresql+asyncpg://postgres:postgres@localhost:5432/sf_academy_test
          REDIS_URL: redis://localhost:6379
          SECRET_KEY: test-secret-key-for-ci-only
          ALGORITHM: HS256

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: frontend
      - run: npm run test
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
```
