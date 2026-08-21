from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SiteSettingsUpdate(BaseModel):
    academyName: str
    tagline: str
    contactDetails: str | None = None
    phoneNumbers: list[str] = Field(default_factory=list)
    email: EmailStr
    address: str
    workingHours: str
    instagram: str | None = None
    facebook: str | None = None
    twitter: str | None = None
    youtube: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class SiteSettingsOut(BaseModel):
    id: str
    academyName: str
    tagline: str
    contactDetails: str | None
    phoneNumbers: list[str]
    email: EmailStr
    address: str
    workingHours: str
    instagram: str | None
    facebook: str | None
    twitter: str | None
    youtube: str | None
    latitude: float | None
    longitude: float | None
    createdAt: datetime
    updatedAt: datetime
