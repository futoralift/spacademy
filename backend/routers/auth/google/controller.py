import os

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request, HTTPException, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from data.core import get_db
from routers.auth.google.service import login_or_create_user
from routers.auth.service import tokens_generator
from utils.models.pydantic_cm import UserModel
from utils.security.tokens import get_current_user

router = APIRouter(prefix="/google", tags=["google_auth"])

oauth = OAuth()

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/login", status_code=status.HTTP_202_ACCEPTED)
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback", name="google_callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(status_code=400, detail="Google authentication failed")

    email = user_info["email"]
    first_name = user_info.get("given_name")
    last_name = user_info.get("family_name")

    return await login_or_create_user(email=email, first_name=first_name, last_name=last_name, db=db)

@router.get("/token/login")
async def token_login(response: Response, db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_user)):
    return await tokens_generator(response, user, db)
