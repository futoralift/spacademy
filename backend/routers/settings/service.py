from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import SiteSettings
from routers.settings.models import SiteSettingsOut, SiteSettingsUpdate
from routers.settings.repo import fetch_site_settings, insert_site_settings, set_site_settings
from utils.errors import DatabaseError, NotFoundError


def _to_out(settings: SiteSettings) -> SiteSettingsOut:
    return SiteSettingsOut(
        id=str(settings.id),
        academyName=settings.academyName,
        tagline=settings.tagline,
        contactDetails=settings.contactDetails,
        phoneNumbers=settings.phoneNumbers,
        email=settings.email,
        address=settings.address,
        workingHours=settings.workingHours,
        instagram=settings.instagram,
        facebook=settings.facebook,
        createdAt=settings.createdAt,
        updatedAt=settings.updatedAt,
        twitter=settings.twitter,
        youtube=settings.youtube,
        latitude=settings.latitude,
        longitude=settings.longitude,
    )


async def _get_or_create_site_settings(db: AsyncSession) -> SiteSettings:
    settings = await fetch_site_settings(db)
    if settings is None:
        from datetime import datetime
        settings = SiteSettings(
            academyName="The Champions Academy",
            tagline="Excellence in Education",
            contactDetails="Contact us for more information",
            phoneNumbers=["+91 1234567890"],
            email="info@thechampionsacademy.com",
            address="Academy Address",
            workingHours="Mon-Sat: 9 AM - 6 PM",
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
        )
        settings = await insert_site_settings(settings, db)
    return settings


async def retrieve_site_settings(db: AsyncSession) -> SiteSettingsOut:
    settings = await _get_or_create_site_settings(db)
    return _to_out(settings)


async def modify_site_settings(updated_settings: SiteSettingsUpdate, db: AsyncSession) -> SiteSettingsOut:
    settings = await _get_or_create_site_settings(db)

    settings.academyName = updated_settings.academyName
    settings.tagline = updated_settings.tagline
    settings.contactDetails = updated_settings.contactDetails
    settings.phoneNumbers = updated_settings.phoneNumbers
    settings.email = str(updated_settings.email)
    settings.address = updated_settings.address
    settings.workingHours = updated_settings.workingHours
    settings.instagram = updated_settings.instagram
    settings.facebook = updated_settings.facebook
    settings.twitter = updated_settings.twitter
    settings.latitude = updated_settings.latitude
    settings.longitude = updated_settings.longitude
    settings.youtube = updated_settings.youtube

    settings = await set_site_settings(settings, db)
    return _to_out(settings)
