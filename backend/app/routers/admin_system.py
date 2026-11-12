from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from ..deps import SessionDep, require_roles
from ..models import AuditLog, Comment, User
from ..schemas import Page, slugify
from ..schemas.admin import (
    AuditLogOut,
    CommentAdminOut,
    CommentModerateIn,
    UserAdminOut,
    UserCreate,
    UserUpdate,
)
from ..security import hash_password
from ..serializers import audit_out, comment_admin, user_admin
from ..services import audit
from ._helpers import paginate

router = APIRouter(prefix="/admin", tags=["admin: system"])

AdminUser = Annotated[User, Depends(require_roles("admin"))]
ModeratorUser = Annotated[User, Depends(require_roles("editor"))]


async def _unique_user_slug(session: SessionDep, name: str) -> str:
    base = slugify(name)
    candidate = base
    counter = 2
    while True:
        exists = (
            await session.execute(select(User.id).where(User.slug == candidate))
        ).scalar_one_or_none()
        if exists is None:
            return candidate
        candidate = f"{base}-{counter}"
        counter += 1


# --------------------------------------------------------------------------- users


@router.get("/users", response_model=Page[UserAdminOut])
async def list_users(
    session: SessionDep,
    user: AdminUser,
    q: str | None = Query(default=None, min_length=2, max_length=120),
    role: str | None = None,
    page: int = 1,
    page_size: int = Query(default=20, alias="pageSize"),
) -> Page[UserAdminOut]:
    statement = select(User)
    if q:
        needle = f"%{q.strip().lower()}%"
        statement = statement.where(
            func.lower(User.name).like(needle) | func.lower(User.email).like(needle)
        )
    if role:
        statement = statement.where(User.role == role)
    statement = statement.order_by(User.created_at.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[UserAdminOut](
        items=[user_admin(row) for row in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


@router.post("/users", response_model=UserAdminOut, status_code=201)
async def create_user(payload: UserCreate, session: SessionDep, user: AdminUser) -> UserAdminOut:
    email = str(payload.email).strip().lower()
    existing = (
        await session.execute(select(User).where(func.lower(User.email) == email))
    ).scalars().one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="That email already has an account")

    created = User(
        email=email,
        slug=await _unique_user_slug(session, payload.name),
        name=payload.name.strip(),
        role=payload.role,
        title=payload.title,
        hashed_password=hash_password(payload.password),
    )
    session.add(created)
    await session.flush()
    audit.record(
        session,
        actor=user,
        action="user.create",
        entity_type="user",
        entity_id=created.id,
        detail={"email": created.email, "role": created.role},
    )
    await session.commit()
    await session.refresh(created)
    return user_admin(created)


@router.patch("/users/{user_id}", response_model=UserAdminOut)
async def update_user(
    user_id: int, payload: UserUpdate, session: SessionDep, user: AdminUser
) -> UserAdminOut:
    target = await session.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)
    password = data.pop("password", None)

    if target.id == user.id and data.get("active") is False:
        raise HTTPException(status_code=409, detail="You cannot deactivate your own account")
    if target.id == user.id and data.get("role") not in (None, "admin"):
        raise HTTPException(status_code=409, detail="You cannot remove your own admin role")

    if password:
        target.hashed_password = hash_password(password)
    for field, value in data.items():
        setattr(target, field, value)

    audit.record(
        session,
        actor=user,
        action="user.update",
        entity_type="user",
        entity_id=target.id,
        detail={"fields": sorted(payload.model_fields_set)},
    )
    await session.commit()
    await session.refresh(target)
    return user_admin(target)


@router.delete("/users/{user_id}", status_code=204)
async def deactivate_user(user_id: int, session: SessionDep, user: AdminUser) -> None:
    if user_id == user.id:
        raise HTTPException(status_code=409, detail="You cannot deactivate your own account")
    target = await session.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    target.is_active = False
    audit.record(
        session,
        actor=user,
        action="user.deactivate",
        entity_type="user",
        entity_id=target.id,
    )
    await session.commit()


# --------------------------------------------------------------------------- audit log


@router.get("/audit-log", response_model=Page[AuditLogOut])
async def audit_log(
    session: SessionDep,
    user: ModeratorUser,
    action: str | None = None,
    page: int = 1,
    page_size: int = Query(default=25, alias="pageSize"),
) -> Page[AuditLogOut]:
    statement = select(AuditLog)
    if action:
        statement = statement.where(AuditLog.action == action)
    statement = statement.order_by(AuditLog.created_at.desc(), AuditLog.id.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[AuditLogOut](
        items=[audit_out(entry) for entry in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


# --------------------------------------------------------------------------- comments


@router.get("/comments", response_model=Page[CommentAdminOut])
async def list_comments(
    session: SessionDep,
    user: ModeratorUser,
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = 1,
    page_size: int = Query(default=25, alias="pageSize"),
) -> Page[CommentAdminOut]:
    statement = select(Comment).options(selectinload(Comment.article))
    if status_filter:
        statement = statement.where(Comment.status == status_filter)
    statement = statement.order_by(Comment.created_at.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[CommentAdminOut](
        items=[comment_admin(c) for c in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


@router.patch("/comments/{comment_id}", response_model=CommentAdminOut)
async def moderate_comment(
    comment_id: int, payload: CommentModerateIn, session: SessionDep, user: ModeratorUser
) -> CommentAdminOut:
    comment = (
        await session.execute(
            select(Comment).options(selectinload(Comment.article)).where(Comment.id == comment_id)
        )
    ).scalars().one_or_none()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.status = payload.status
    audit.record(
        session,
        actor=user,
        action="comment.moderate",
        entity_type="comment",
        entity_id=comment.id,
        detail={"status": payload.status},
    )
    await session.commit()
    await session.refresh(comment)
    return comment_admin(comment)
