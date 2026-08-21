import os
import uuid
from typing import Any

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from utils.errors import AppError

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

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sf-academy.vercel.app",
    "https://deshmukh-academy.vercel.app"
]


def make_json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): make_json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [make_json_safe(item) for item in value]
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return str(value)

app = FastAPI()

app.mount("/storage", StaticFiles(directory="storage"), name="storage")

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY"),
    same_site="none",
    https_only=True,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "https://sf-academy.vercel.app"),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://deshmukh-academy.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],   # allow all methods (POST, GET, OPTIONS etc.)
    allow_headers=["*"],   # allow all headers
)

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

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
    request.state.request_id = request_id

    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    return response

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
