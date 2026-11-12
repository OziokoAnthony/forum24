from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select

from ..config import get_settings
from ..deps import CurrentUser, SessionDep
from ..models import User
from ..schemas import LoginIn, TokenOut, UserOut
from ..security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        slug=user.slug,
        role=user.role,
        title=user.title,
    )


async def _authenticate(session: SessionDep, email: str, password: str) -> User:
    normalised = email.strip().lower()
    user = (
        await session.execute(select(User).where(func.lower(User.email) == normalised))
    ).scalars().one_or_none()

    # Same message for unknown address and wrong password: no account enumeration.
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )
    return user


def _issue(session: SessionDep, user: User) -> TokenOut:
    settings = get_settings()
    token = create_access_token(
        user.id,
        secret_key=settings.secret_key,
        role=user.role,
        ttl_minutes=settings.access_token_ttl_minutes,
    )
    return TokenOut(
        access_token=token,
        expires_in=settings.access_token_ttl_minutes * 60,
        user=_user_out(user),
    )


@router.post("/login", response_model=TokenOut, summary="Sign in with email and password")
async def login(payload: LoginIn, session: SessionDep) -> TokenOut:
    user = await _authenticate(session, str(payload.email), payload.password)
    user.last_login_at = datetime.now(timezone.utc)
    await session.commit()
    return _issue(session, user)


@router.post("/token", response_model=TokenOut, summary="OAuth2 password flow (form encoded)")
async def token(
    form: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
) -> TokenOut:
    user = await _authenticate(session, form.username, form.password)
    user.last_login_at = datetime.now(timezone.utc)
    await session.commit()
    return _issue(session, user)


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> UserOut:
    return _user_out(user)
