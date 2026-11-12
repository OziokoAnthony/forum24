from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..constants import PUBLISH_ROLES, REVIEW_ROLES, ROLE_RANK
from ..deps import CurrentUser, SessionDep, require_roles
from ..models import Article, Tag, User
from ..schemas import Page, slugify
from ..schemas.admin import (
    ArticleAdminOut,
    ArticleCreate,
    ArticleUpdate,
    ScheduleIn,
    TransitionOut,
)
from ..serializers import article_admin
from ..services import audit
from ._helpers import paginate, resolve_category

router = APIRouter(prefix="/admin/articles", tags=["admin: articles"])

EditorUser = Annotated[User, Depends(require_roles("author"))]
ReviewerUser = Annotated[User, Depends(require_roles(*REVIEW_ROLES))]
PublisherUser = Annotated[User, Depends(require_roles(*PUBLISH_ROLES))]


def _can_manage(user: User, article: Article) -> bool:
    return ROLE_RANK.get(user.role, -1) >= ROLE_RANK["reviewer"] or article.author_id == user.id


def _require_manage(user: User, article: Article) -> None:
    if not _can_manage(user, article):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own articles",
        )


async def _unique_slug(session: AsyncSession, base: str, *, exclude_id: int | None = None) -> str:
    candidate = base
    counter = 2
    while True:
        statement = select(Article.id).where(Article.slug == candidate)
        if exclude_id is not None:
            statement = statement.where(Article.id != exclude_id)
        exists = (await session.execute(statement)).scalar_one_or_none()
        if exists is None:
            return candidate
        candidate = f"{base}-{counter}"
        counter += 1


async def _set_tags(session: AsyncSession, article: Article, names: list[str]) -> None:
    tags: list[Tag] = []
    seen: set[str] = set()
    for raw in names:
        name = raw.strip()
        if not name:
            continue
        slug = slugify(name)
        if slug in seen:
            continue
        seen.add(slug)
        tag = (
            await session.execute(select(Tag).where(Tag.slug == slug))
        ).scalars().one_or_none()
        if tag is None:
            tag = Tag(slug=slug, name=name)
            session.add(tag)
        tags.append(tag)
    article.tags = tags


async def _load(session: AsyncSession, article_id: int) -> Article:
    article = (
        await session.execute(select(Article).where(Article.id == article_id))
    ).scalars().unique().one_or_none()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("", response_model=Page[ArticleAdminOut])
async def list_articles(
    session: SessionDep,
    user: EditorUser,
    status_filter: str | None = Query(default=None, alias="status"),
    q: str | None = Query(default=None, min_length=2, max_length=120),
    mine: bool = False,
    page: int = 1,
    page_size: int = Query(default=20, alias="pageSize"),
) -> Page[ArticleAdminOut]:
    statement = select(Article)
    if status_filter:
        statement = statement.where(Article.status == status_filter)
    if mine or user.role == "author":
        statement = statement.where(Article.author_id == user.id)
    if q:
        needle = f"%{q.strip().lower()}%"
        statement = statement.where(
            or_(
                func.lower(Article.title).like(needle),
                func.lower(Article.standfirst).like(needle),
            )
        )
    statement = statement.order_by(Article.updated_at.desc(), Article.id.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[ArticleAdminOut](
        items=[article_admin(a) for a in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


@router.post("", response_model=ArticleAdminOut, status_code=201)
async def create_article(payload: ArticleCreate, session: SessionDep, user: EditorUser) -> ArticleAdminOut:
    category = await resolve_category(
        session, category_id=payload.category_id, category=payload.category
    )

    author = user
    if payload.author_id is not None and payload.author_id != user.id:
        if ROLE_RANK.get(user.role, -1) < ROLE_RANK["editor"]:
            raise HTTPException(status_code=403, detail="Only editors can assign another author")
        author = await session.get(User, payload.author_id)
        if author is None:
            raise HTTPException(status_code=422, detail="Unknown authorId")

    slug = await _unique_slug(session, slugify(payload.title))
    article = Article(
        slug=slug,
        title=payload.title.strip(),
        standfirst=payload.standfirst.strip(),
        body=[block.model_dump() for block in payload.body],
        status="Draft",
        category_id=category.id,
        author_id=author.id,
        cover=payload.cover,
        reading_time=payload.reading_time,
        featured=payload.featured,
        trending=payload.trending,
        ai_draft=payload.ai_draft,
        seo_title=payload.seo_title,
        seo_description=payload.seo_description,
        primary_keyword=payload.primary_keyword,
    )
    await _set_tags(session, article, payload.tags)
    session.add(article)
    audit.record(
        session,
        actor=user,
        action="article.create",
        entity_type="article",
        entity_id=None,
        detail={"title": article.title},
    )
    await session.commit()
    await session.refresh(article)
    return article_admin(article)


@router.get("/{article_id}", response_model=ArticleAdminOut)
async def get_article(article_id: int, session: SessionDep, user: EditorUser) -> ArticleAdminOut:
    article = await _load(session, article_id)
    _require_manage(user, article)
    return article_admin(article)


@router.patch("/{article_id}", response_model=ArticleAdminOut)
async def update_article(
    article_id: int, payload: ArticleUpdate, session: SessionDep, user: EditorUser
) -> ArticleAdminOut:
    article = await _load(session, article_id)
    _require_manage(user, article)

    data = payload.model_dump(exclude_unset=True)

    if "category_id" in data or "category" in data:
        category = await resolve_category(
            session, category_id=data.pop("category_id", None), category=data.pop("category", None)
        )
        article.category_id = category.id

    if "author_id" in data:
        author_id = data.pop("author_id")
        if author_id is not None and author_id != article.author_id:
            if ROLE_RANK.get(user.role, -1) < ROLE_RANK["editor"]:
                raise HTTPException(status_code=403, detail="Only editors can reassign authors")
            if await session.get(User, author_id) is None:
                raise HTTPException(status_code=422, detail="Unknown authorId")
            article.author_id = author_id

    if "tags" in data:
        await _set_tags(session, article, data.pop("tags") or [])

    if "body" in data and data["body"] is not None:
        article.body = [block.model_dump() for block in payload.body or []]
        data.pop("body")

    for field in (
        "title",
        "standfirst",
        "body",
        "cover",
        "reading_time",
        "featured",
        "trending",
        "ai_draft",
        "seo_title",
        "seo_description",
        "primary_keyword",
    ):
        if field in data:
            value = data[field]
            setattr(article, field, value.strip() if isinstance(value, str) else value)

    audit.record(
        session,
        actor=user,
        action="article.update",
        entity_type="article",
        entity_id=article.id,
        detail={"fields": sorted(payload.model_fields_set)},
    )
    await session.commit()
    await session.refresh(article)
    return article_admin(article)


@router.delete("/{article_id}", status_code=204)
async def delete_article(
    article_id: int,
    session: SessionDep,
    user: Annotated[User, Depends(require_roles("admin"))],
) -> None:
    article = await _load(session, article_id)
    audit.record(
        session,
        actor=user,
        action="article.delete",
        entity_type="article",
        entity_id=article.id,
        detail={"title": article.title, "status": article.status},
    )
    await session.delete(article)
    await session.commit()


@router.post("/{article_id}/submit-review", response_model=TransitionOut)
async def submit_for_review(
    article_id: int, session: SessionDep, user: EditorUser
) -> TransitionOut:
    article = await _load(session, article_id)
    _require_manage(user, article)
    if article.status not in {"Draft", "Archived"}:
        raise HTTPException(
            status_code=409, detail=f"An article in {article.status} cannot be submitted"
        )
    article.status = "Pending Review"
    audit.record(
        session,
        actor=user,
        action="article.submit_review",
        entity_type="article",
        entity_id=article.id,
    )
    await session.commit()
    return TransitionOut(id=article.id, status=article.status)


@router.post("/{article_id}/approve", response_model=TransitionOut)
async def approve_article(article_id: int, session: SessionDep, user: ReviewerUser) -> TransitionOut:
    article = await _load(session, article_id)
    if article.status != "Pending Review":
        raise HTTPException(status_code=409, detail="Only articles pending review can be approved")
    article.status = "Approved"
    article.reviewed_by_id = user.id
    audit.record(
        session,
        actor=user,
        action="article.approve",
        entity_type="article",
        entity_id=article.id,
    )
    await session.commit()
    return TransitionOut(id=article.id, status=article.status)


@router.post("/{article_id}/publish", response_model=TransitionOut)
async def publish_article(
    article_id: int, session: SessionDep, user: PublisherUser
) -> TransitionOut:
    article = await _load(session, article_id)
    if article.status not in {"Approved", "Published"}:
        raise HTTPException(
            status_code=409,
            detail="Publishing requires an editor's approval first (human gate)",
        )
    article.status = "Published"
    if article.published_at is None:
        article.published_at = datetime.now(timezone.utc)
    article.scheduled_for = None
    audit.record(
        session,
        actor=user,
        action="article.publish",
        entity_type="article",
        entity_id=article.id,
    )
    await session.commit()
    return TransitionOut(
        id=article.id, status=article.status, published_at=article.published_at
    )


@router.post("/{article_id}/schedule", response_model=TransitionOut)
async def schedule_article(
    article_id: int, payload: ScheduleIn, session: SessionDep, user: PublisherUser
) -> TransitionOut:
    article = await _load(session, article_id)
    if article.status != "Approved":
        raise HTTPException(status_code=409, detail="Only approved articles can be scheduled")
    when = payload.scheduled_for
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    if when <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="scheduledFor must be in the future")
    article.status = "Scheduled"
    article.scheduled_for = when
    audit.record(
        session,
        actor=user,
        action="article.schedule",
        entity_type="article",
        entity_id=article.id,
        detail={"scheduledFor": when.isoformat()},
    )
    await session.commit()
    return TransitionOut(id=article.id, status=article.status, scheduled_for=article.scheduled_for)


@router.post("/{article_id}/unschedule", response_model=TransitionOut)
async def unschedule_article(
    article_id: int, session: SessionDep, user: PublisherUser
) -> TransitionOut:
    article = await _load(session, article_id)
    if article.status != "Scheduled":
        raise HTTPException(status_code=409, detail="Only scheduled articles can be unscheduled")
    previous = article.scheduled_for
    article.status = "Approved"
    article.scheduled_for = None
    audit.record(
        session,
        actor=user,
        action="article.unschedule",
        entity_type="article",
        entity_id=article.id,
        detail={"scheduledFor": previous.isoformat() if previous else None},
    )
    await session.commit()
    return TransitionOut(id=article.id, status=article.status)


@router.post("/{article_id}/reject", response_model=TransitionOut)
async def reject_article(article_id: int, session: SessionDep, user: ReviewerUser) -> TransitionOut:
    article = await _load(session, article_id)
    if article.status != "Pending Review":
        raise HTTPException(status_code=409, detail="Only articles pending review can be sent back")
    article.status = "Draft"
    article.reviewed_by_id = None
    audit.record(
        session,
        actor=user,
        action="article.reject",
        entity_type="article",
        entity_id=article.id,
    )
    await session.commit()
    return TransitionOut(id=article.id, status=article.status)


@router.post("/{article_id}/archive", response_model=TransitionOut)
async def archive_article(article_id: int, session: SessionDep, user: PublisherUser) -> TransitionOut:
    article = await _load(session, article_id)
    article.status = "Archived"
    audit.record(
        session,
        actor=user,
        action="article.archive",
        entity_type="article",
        entity_id=article.id,
    )
    await session.commit()
    return TransitionOut(id=article.id, status=article.status)
