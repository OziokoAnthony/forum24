from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.db import Base
from app.models import Article, AuditLog, Category, User
from app.services.publisher import publish_due_articles

NOW = datetime(2026, 11, 12, 12, 0, tzinfo=timezone.utc)


@pytest.fixture
async def session():
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    maker = async_sessionmaker(engine, expire_on_commit=False, autoflush=False)
    async with maker() as db:
        category = Category(slug="news", name="News", description="")
        author = User(
            email="author@example.com",
            slug="author",
            name="Author",
            role="author",
            hashed_password="not-used",
        )
        db.add_all([category, author])
        await db.flush()

        def article(slug: str, status: str, scheduled_for: datetime | None) -> Article:
            return Article(
                slug=slug,
                title=slug.replace("-", " ").title(),
                standfirst="",
                body=[],
                status=status,
                category_id=category.id,
                author_id=author.id,
                scheduled_for=scheduled_for,
            )

        db.add_all(
            [
                article("due", "Scheduled", NOW - timedelta(hours=1)),
                article("future", "Scheduled", NOW + timedelta(hours=1)),
                article("draft-with-old-slot", "Draft", NOW - timedelta(days=1)),
                article("approved-no-slot", "Approved", None),
            ]
        )
        await db.commit()
        yield db

    await engine.dispose()


async def test_publishes_only_due_scheduled_articles(session):
    published = await publish_due_articles(session, now=NOW)

    assert [article.slug for article in published] == ["due"]
    due = (
        await session.execute(select(Article).where(Article.slug == "due"))
    ).scalars().one()
    assert due.status == "Published"
    assert due.scheduled_for is None
    assert due.published_at.replace(tzinfo=timezone.utc) == NOW - timedelta(hours=1)

    future = (
        await session.execute(select(Article).where(Article.slug == "future"))
    ).scalars().one()
    assert future.status == "Scheduled"

    draft = (
        await session.execute(
            select(Article).where(Article.slug == "draft-with-old-slot")
        )
    ).scalars().one()
    assert draft.status == "Draft"

    entry = (
        await session.execute(
            select(AuditLog).where(AuditLog.action == "article.auto_publish")
        )
    ).scalars().one()
    assert entry.actor_id is None
    assert entry.entity_id == str(due.id)


async def test_publishing_is_idempotent(session):
    assert len(await publish_due_articles(session, now=NOW)) == 1
    assert await publish_due_articles(session, now=NOW + timedelta(minutes=1)) == []
