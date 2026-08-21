import os
from datetime import timedelta
from urllib.parse import urlencode

from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import RedirectResponse

from data.schemas import AuthServiceProvider, UserRole
from routers.auth.google.repo import fetch_user_by_email
from routers.auth.models import SignUpModel
from routers.auth.service import store_pend_user, tokens_generator
from utils.models.sql_pydantic_parser import user_2_p
from utils.security.tokens import create_access_token


async def login_or_create_user(first_name: str, last_name: str, email: str, db: AsyncSession):
    user = await fetch_user_by_email(email, db)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    
    if user:
        redirect = RedirectResponse(f"{frontend_url}/oauth/callback", status_code=302)
        # tokens_generator will set the refresh_token cookie on the redirect response
        tokens = await tokens_generator(redirect, user_2_p(user), db)
        
        # We still put the access_token in the URL for the frontend to pick up
        redirect.headers["location"] = f"{frontend_url}/oauth/callback#token={tokens.access_token}"
        return redirect


    signup_model = SignUpModel(
        firstName = first_name,
        lastName = last_name,
        email = email,
        phone = None,
        password = None,
    )

    await store_pend_user(signup_model, AuthServiceProvider.GOOGLE, db)
    query = urlencode({"email": email})
    return RedirectResponse(f"{frontend_url}/pick_avatar?{query}")
