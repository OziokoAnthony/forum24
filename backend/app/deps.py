from __future__ import annotations

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .db import get_session
from .models import User
from .security import InvalidTokenError, decode_access_token

bearer_scheme = HTTPBearer(auto_error=False, description="Bearer access token")

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def _unauthorised(detail: str = "Not authenticated") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: SessionDep,
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorised()

    try:
        payload = decode_access_token(credentials.credentials, secret_key=get_settings().secret_key)
    except InvalidTokenError:
        raise _unauthorised("Invalid or expired token") from None

    try:
        user_id = int(payload.get("sub", ""))
    except (TypeError, ValueError):
        raise _unauthorised("Invalid token subject") from None

    user = await session.get(User, user_id)
    if user is None or not user.is_active:
        raise _unauthorised("Account is not active")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*allowed: str) -> Callable[..., User]:
    """Allow the listed roles plus anyone more senior (admin always passes)."""

    from .constants import ROLE_RANK

    minimum = min(ROLE_RANK[role] for role in allowed)

    async def dependency(user: CurrentUser) -> User:
        if ROLE_RANK.get(user.role, -1) < minimum:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your role does not permit this action",
            )
        return user

    return dependency
