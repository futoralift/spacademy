# SF Academy

A full-stack Learning Management System (LMS) for coaching academies, featuring three role-based portals: **Admin**, **Teacher**, and **Student**.

## Features

- 🏫 **Admin Portal** — Manage courses, students, teachers, blogs, announcements, media, payments, enquiries, and site settings
- 👩‍🏫 **Teacher Portal** — View assigned subjects, manage lectures, assignments, tests, and student attendance  
- 🎓 **Student Portal** — Enroll in courses, attend lectures, take online tests, submit assignments, view performance
- 💳 **Payments** — Razorpay integration for course enrollment fees
- 🔐 **Auth** — JWT + bcrypt password auth, Google OAuth, OTP email verification, password recovery
- 📝 **Blog** — Full CMS with Editor.js rich-text editor, categories, and tags
- 📢 **Announcements** — Time-bounded announcements with public/private visibility
- 📚 **Learning Hub** — YouTube video library organized by subject and type
- 📎 **Study Resources** — File uploads per lecture or subject

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.13+ |
| Node.js | 20+ |
| PostgreSQL | 16+ |
| Redis | 7+ |
| `uv` | latest |
| Docker & Docker Compose | optional but recommended |

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone <repo-url> sf-academy
cd sf-academy

# 2. Create backend .env from template
cp backend/.env.example backend/.env
# Edit backend/.env — fill in SECRET_KEY, PG_URI, SMTP credentials, etc.

# 3. Create frontend .env from template
cp frontend/.env.example frontend/.env
# Edit frontend/.env — set VITE_API_BASE_URL if needed

# 4. Start all services
docker compose up --build

# 5. (First run) Run database migrations
docker compose exec backend uv run alembic upgrade head

# 6. (Optional) Create the admin user
docker compose exec backend uv run python scripts/init_admin_automated.py
```

The frontend is served at **http://localhost:5173** and the API at **http://localhost:8000**.

---

### Option B — Local Development (without Docker)

#### Backend

```bash
cd backend

# 1. Create .env
cp .env.example .env
# Edit .env — fill in PG_URI, REDIS_URL, SECRET_KEY, etc.

# 2. Install dependencies (requires uv: https://docs.astral.sh/uv/)
uv sync

# 3. Initialize the database and storage directories
uv run python scripts/init_db.py

# 4. Run Alembic migrations
uv run alembic upgrade head

# 5. (Optional) Create admin user
uv run python scripts/init_admin_automated.py

# 6. Start the development server
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API docs available at **http://localhost:8000/docs** (Swagger UI).

#### Frontend

```bash
cd frontend

# 1. Create .env
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

App available at **http://localhost:5173**.

---

## Project Structure

```
sf-academy/
├── backend/                    # FastAPI application
│   ├── alembic/                # Database migrations
│   │   └── versions/           # Migration files
│   ├── data/
│   │   ├── core.py             # Database engine & session factory
│   │   └── schemas.py          # SQLAlchemy ORM models
│   ├── routers/                # Feature modules (each has controller/service/repo/models)
│   │   ├── auth/               # Authentication & user management
│   │   ├── courses/            # Course CRUD
│   │   ├── students/           # Student management
│   │   ├── teacher/            # Teacher management
│   │   ├── assignments/        # Assignment management
│   │   ├── attendance/         # Lecture attendance
│   │   ├── blog/               # Blog posts CMS
│   │   ├── blog_taxonomy/      # Tags & categories
│   │   ├── enquiries/          # Contact enquiries
│   │   ├── learning_hub/       # YouTube video library
│   │   ├── media_library/      # File upload library
│   │   ├── payments/           # Razorpay payment flow
│   │   ├── settings/           # Site settings
│   │   ├── study_resources/    # Study material uploads
│   │   ├── testimonials/       # Student testimonials
│   │   ├── test/               # Online MCQ tests
│   │   └── user/               # User profile endpoints
│   ├── scripts/                # Admin/init utility scripts
│   ├── storage/                # Local file storage (gitignored contents)
│   ├── utils/
│   │   ├── errors.py           # Custom exception hierarchy
│   │   ├── models/             # Shared Pydantic models & parsers
│   │   ├── security/           # JWT, OTP, hashing, rate limiting
│   │   ├── redis_client.py     # Async Redis client
│   │   ├── sv_logger.py        # Structured logger
│   │   └── validation.py       # Phone number normalisation
│   ├── main.py                 # FastAPI app entrypoint
│   ├── pyproject.toml          # Python dependencies (managed by uv)
│   ├── Dockerfile              # Production container
│   └── .env.example            # Environment variable template ← copy to .env
│
├── frontend/                   # React + Vite application
│   └── src/
│       ├── api/                # API client, types, React Query hooks
│       ├── app/                # App-level layout components
│       ├── components/         # Reusable UI components (shadcn/ui)
│       ├── contexts/           # React contexts (AuthContext)
│       ├── entities/           # Feature entity components
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utility functions
│       └── pages/              # Route pages (admin/, teacher/, student/, auth/)
│
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml      # Development Docker Compose
├── docs/                       # Project documentation
└── README.md                   # This file
```

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | System design, data flow, component relationships |
| [Setup Guide](docs/setup.md) | Detailed installation & configuration |
| [Environment Variables](docs/environment.md) | All env vars explained |
| [API Reference](docs/api.md) | Endpoints, request/response formats |
| [Database Schema](docs/database.md) | Tables, relationships, indexes |
| [Deployment](docs/deployment.md) | Docker, Vercel, production checklist |
| [Security](docs/security.md) | Auth flows, JWT, OTP, payment security |
| [Testing](docs/testing.md) | Test approach and commands |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, TypeScript 5.9 |
| Styling | Tailwind CSS v4, shadcn/ui (Radix UI) |
| State | TanStack React Query v5 |
| Routing | React Router DOM v7 |
| Backend | FastAPI, Python 3.13, Uvicorn |
| ORM | SQLAlchemy v2 (async) |
| Migrations | Alembic |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT (PyJWT) + bcrypt, Google OAuth (Authlib) |
| Payments | Razorpay |
| Email | SMTP (Gmail) |
| Infra | Docker Compose, Vercel |

---

## Environment Setup

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example) for all required variables.

**Minimum required variables to run locally:**

```bash
# backend/.env
SECRET_KEY=<openssl rand -hex 32>
ALGORITHM=HS256
PG_URI=postgresql+asyncpg://postgres:postgres@localhost:5432/sf_academy
REDIS_URL=redis://localhost:6379
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes, following the existing code style
3. Run the backend: `uv run uvicorn main:app --reload` and verify your changes
4. Run the frontend: `npm run dev` and verify UI
5. Open a pull request with a clear description

---

## License

Proprietary — All rights reserved.
