# Architecture Overview

## System Architecture

SF Academy is a three-tier web application:

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENTS                          │
│  Browser (React SPA)   ←→   Vercel CDN                  │
└─────────────────────────────────┬───────────────────────┘
                                  │ HTTPS / REST JSON
┌─────────────────────────────────▼───────────────────────┐
│                    BACKEND (FastAPI)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  Routers   │  │  Services  │  │  Repositories      │ │
│  │ (HTTP API) │→ │(Business   │→ │ (SQL via           │ │
│  │            │  │ Logic)     │  │  SQLAlchemy async) │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │   Redis    │  │ Cloudinary │  │  Local Storage     │ │
│  │ (OTP/Cache)│  │(File Store)│  │  (storage/ dir)    │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ asyncpg
┌─────────────────────────▼───────────────────────────────┐
│                   PostgreSQL Database                    │
└─────────────────────────────────────────────────────────┘
```

## Role-Based Portals

The application has three distinct portals sharing the same backend:

| Portal | URL Prefix | Description |
|---|---|---|
| Admin | `/dashboard/admin` | Full system management |
| Teacher | `/dashboard/teacher` | Subject/class management |
| Student | `/dashboard/student` | Learning and assessment |

## Authentication Flow

```
User → POST /auth/register → PendingUser (email+OTP verification)
     → POST /auth/otp/verify → User created → Short-lived JWT
     → POST /auth/token_login → Full JWT (15min) + Refresh Token (7d httpOnly cookie)

Subsequent requests:
  JWT in Authorization header → GET /auth/me → user profile
  JWT expires → GET /auth/refresh (uses httpOnly cookie) → new JWT
```

## Module Architecture

Each feature domain follows the Controller → Service → Repository pattern:

```
routers/<feature>/
├── controller.py    # FastAPI router: HTTP routing, input parsing, response shaping
├── service.py       # Business logic, orchestration, validation rules
├── repo.py          # Database queries (SQLAlchemy async)
└── models.py        # Pydantic request/response models for this feature
```

## Frontend Architecture

```
src/
├── api/             # Backend API client + TanStack React Query hooks
│   ├── http.ts      # Fetch wrapper with token refresh, error parsing
│   ├── types.ts     # TypeScript types mirroring backend models
│   ├── academy.ts   # API functions (courses, lectures, tests, etc.)
│   ├── academyHooks.ts  # React Query hooks wrapping academy.ts
│   ├── auth.ts      # Auth API functions
│   └── authHooks.ts # React Query hooks for auth
├── contexts/
│   └── AuthContext.tsx  # Global auth state: user, login, logout
├── pages/
│   ├── admin/       # Admin portal pages
│   ├── teacher/     # Teacher portal pages
│   ├── student/     # Student portal pages
│   └── auth/        # Login, signup, password recovery pages
└── components/      # Shared UI components (shadcn/ui)
```

## Key Data Flows

### Course Enrollment (Paid)
```
Student → POST /payments/create-order → Razorpay order
        → [Razorpay checkout widget]
        → POST /payments/verify → signature verified → student enrolled → 200 OK
```

### Online Test
```
Teacher creates test + questions
Student → GET /tests/:id → loads test (time-limited)
        → POST /tests/:id/submit (bulk answers) → marks calculated → attempt stored
        → GET /tests/:id/results → detailed score + explanations
```

### File Upload Pattern
```
Client → multipart/form-data → Backend validates → saves to storage/ → returns file path
File served at: GET /storage/<path>  (StaticFiles mount)
```

## Infrastructure

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| Development | Vite dev server :5173 | Uvicorn :8000 --reload | Local PostgreSQL |
| Docker Dev | Vite :5174 | Uvicorn :8001 | Docker postgres :5434 |
| Production | Vercel | Docker container :8000 | Managed PostgreSQL |
