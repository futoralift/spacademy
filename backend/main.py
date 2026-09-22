import os
import uuid
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.sessions import SessionMiddleware

from utils.errors import AppError
from utils.security.rate_limiting import limiter

from routers.auth.controller import router as auth_router
from routers.user.controller import router as user_router
from routers.teacher.controller import router as teacher_router
from routers.test.controller import router as test_router
from routers.assignments.controller import router as assignments_router
from routers.courses.controller import router as course_router
from routers.study_resources.controller import router as resource_router
from routers.students.controller import router as student_router
from routers.attendance.controller import router as attendance_router
from routers.blog.controller import router as blog_router
from routers.blog_taxonomy.controller import router as blog_taxonomy_router
from routers.learning_hub.controller import router as learning_hub_router
from routers.announcements.controller import router as announcements_router
from routers.media_library.controller import router as media_library_router
from routers.settings.controller import router as settings_router
from routers.testimonials.controller import router as testimonials_router
from routers.enquiries.controller import router as enquiries_router
from routers.payments.controller import router as payments_router


# ── Startup Validation ────────────────────────────────────────────────────────

_REQUIRED_ENV_VARS = [
    "SECRET_KEY",
    "ALGORITHM",
    "PG_URI",
    "REDIS_URL",
]

def _validate_env() -> None:
    """Fail fast if critical environment variables are missing."""
    missing = [v for v in _REQUIRED_ENV_VARS if not os.getenv(v)]
    if missing:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Copy backend/.env.example to backend/.env and fill in the values."
        )


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: validate config and ensure storage directory exists."""
    _validate_env()
    os.makedirs("storage", exist_ok=True)
    yield


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): make_json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [make_json_safe(item) for item in value]
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return str(value)


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SF Academy API",
    description="Backend API for the SF Academy LMS platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Static file serving (local file storage)
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# Rate limiter — must be set on app.state before registering the handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Session Middleware ────────────────────────────────────────────────────────
# Read cookie policy from environment so local dev (HTTP) works correctly.
# Development  → COOKIE_SAMESITE=lax,  COOKIE_SECURE=false
# Production   → COOKIE_SAMESITE=none, COOKIE_SECURE=true
_cookie_samesite = os.getenv("COOKIE_SAMESITE", "lax").lower()
_https_only = os.getenv("COOKIE_SECURE", "false").lower() == "true" or _cookie_samesite == "none"

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "fallback-dev-key-change-in-production"),
    same_site=_cookie_samesite,
    https_only=_https_only,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
_allowed_origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sf-academy.vercel.app",
    "https://deshmukh-academy.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exception Handlers ────────────────────────────────────────────────────────

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    request_id = getattr(request.state, "request_id", None)
    content = {
        "code": exc.code,
        "message": exc.message,
        "details": make_json_safe(exc.details),
    }
    if request_id:
        content["request_id"] = request_id
    return JSONResponse(status_code=exc.status_code, content=content)


# ── Middleware ────────────────────────────────────────────────────────────────

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    return response


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["infra"], summary="Health check")
async def health_check():
    """Returns 200 OK when the API is running. Used by Docker and load balancers."""
    return {"status": "ok"}


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(teacher_router)
app.include_router(test_router)
app.include_router(course_router)
app.include_router(attendance_router)
app.include_router(resource_router)
app.include_router(assignments_router)
app.include_router(student_router)
app.include_router(blog_router)
app.include_router(blog_taxonomy_router)
app.include_router(learning_hub_router)
app.include_router(announcements_router)
app.include_router(media_library_router)
app.include_router(settings_router)
app.include_router(testimonials_router)
app.include_router(enquiries_router)
app.include_router(payments_router)
