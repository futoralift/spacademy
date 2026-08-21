from __future__ import annotations
from dataclasses import dataclass
from typing import Any


@dataclass
class AppError(Exception):
    code: str
    message: str
    status_code: int = 500
    details: dict[str, Any] | None = None

    def __init__(self, code: str, message: str, status_code: int = 500, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details

class NotFoundError(AppError):
    def __init__(self, message: str, *, details: dict[str, Any] | None = None):
        super().__init__(code="NOT_FOUND", message=message, status_code=404, details=details)


class ValidationError(AppError):
    def __init__(self, message: str, *, details: dict[str, Any] | None = None):
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=422, details=details)


class ConflictError(AppError):
    def __init__(self, message: str, *, details: dict[str, Any] | None = None):
        super().__init__(code="CONFLICT", message=message, status_code=409, details=details)


class DatabaseError(AppError):
    def __init__(self, message: str = "Database operation failed", *, details: dict[str, Any] | None = None):
        super().__init__(code="DATABASE_ERROR", message=message, status_code=500, details=details)


class FileError(AppError):
    def __init__(self, message: str = "File operation failed", *, details: dict[str, Any] | None = None):
        super().__init__(code="FILE_ERROR", message=message, status_code=500, details=details)


class ExternalServiceError(AppError):
    def __init__(self, message: str = "External service unavailable", *, details: dict[str, Any] | None = None):
        super().__init__(code="EXTERNAL_SERVICE_ERROR", message=message, status_code=503, details=details)
