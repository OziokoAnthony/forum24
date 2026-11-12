from __future__ import annotations

import math
from typing import Any

from fastapi import HTTPException
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Category, User


async def paginate(
    session: AsyncSession,
    statement: Select[Any],
    *,
    page: int,
    page_size: int,
) -> tuple[list[Any], int, int]:
    if page < 1:
        raise HTTPException(status_code=422, detail="page must be 1 or greater")
    page_size = max(1, min(page_size, 50))

    count_statement = select(func.count()).select_from(statement.order_by(None).subquery())
    total = int((await session.execute(count_statement)).scalar_one())
    pages = max(1, math.ceil(total / page_size)) if total else 0

    result = await session.execute(statement.offset((page - 1) * page_size).limit(page_size))
    return list(result.scalars().unique()), total, pages


async def resolve_category(
    session: AsyncSession,
    *,
    category_id: int | None = None,
    category: str | None = None,
) -> Category:
    found: Category | None = None
    if category_id is not None:
        found = await session.get(Category, category_id)
    elif category:
        needle = category.strip().lower()
        found = (
            await session.execute(
                select(Category).where(
                    func.lower(Category.slug) == needle,  # type: ignore[arg-type]
                )
            )
        ).scalar_one_or_none()
        if found is None:
            found = (
                await session.execute(
                    select(Category).where(func.lower(Category.name) == needle)  # type: ignore[arg-type]
                )
            ).scalar_one_or_none()

    if found is None:
        raise HTTPException(
            status_code=422,
            detail="Unknown category: pass a valid categoryId or category slug",
        )
    return found


async def find_user(session: AsyncSession, user_id: int) -> User:
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
