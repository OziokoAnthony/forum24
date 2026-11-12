from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select

from ..deps import SessionDep, require_roles
from ..models import AiTask, Article, AuditLog, Document, NewsletterSubscriber, User, Video
from ..schemas.admin import (
    ActivityItem,
    AdminStatsOut,
    AnalyticsOut,
    AnalyticsPoint,
    ReviewQueueItem,
    StatCardOut,
    TopContent,
)

router = APIRouter(prefix="/admin", tags=["admin: overview"])

ModeratorUser = Annotated[User, Depends(require_roles("editor"))]
AnyStaff = Annotated[User, Depends(require_roles("author"))]

DAY = 86_400


def _thousands(value: int) -> str:
    return f"{value:,}"


async def _count(session: SessionDep, model, *conditions) -> int:
    statement = select(func.count()).select_from(model)
    for condition in conditions:
        statement = statement.where(condition)
    return int((await session.execute(statement)).scalar_one())


@router.get("/stats", response_model=AdminStatsOut)
async def stats(session: SessionDep, user: AnyStaff) -> AdminStatsOut:
    total_articles = await _count(session, Article)
    published = await _count(session, Article, Article.status == "Published")
    drafts = await _count(session, Article, Article.status == "Draft")
    pending = await _count(session, Article, Article.status == "Pending Review")
    users = await _count(session, User, User.is_active.is_(True))
    subscribers = await _count(session, NewsletterSubscriber)

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    new_articles = await _count(session, Article, Article.created_at >= week_ago)
    overlap = await _count(
        session,
        Article,
        Article.status == "Pending Review",
        Article.updated_at < now - timedelta(days=2),
    )

    cards = [
        StatCardOut(label="Total articles", value=_thousands(total_articles), delta=f"+{new_articles} this week"),
        StatCardOut(label="Published", value=_thousands(published), delta=f"{published} live"),
        StatCardOut(label="Drafts", value=_thousands(drafts), delta=f"{drafts} in progress"),
        StatCardOut(label="Pending review", value=_thousands(pending), delta=f"{overlap} overdue"),
        StatCardOut(label="Registered users", value=_thousands(users), delta="editorial team"),
        StatCardOut(label="Subscribers", value=_thousands(subscribers), delta="newsletter list"),
    ]

    queue_rows = (
        (
            await session.execute(
                select(Article)
                .where(Article.status == "Pending Review")
                .order_by(Article.updated_at)
                .limit(6)
            )
        )
        .scalars()
        .unique()
        .all()
    )
    review_queue = []
    for article in queue_rows:
        age_days = max(0, (now - _aware(article.updated_at)).days)
        review_queue.append(
            ReviewQueueItem(
                id=article.id,
                title=article.title,
                author=article.author.name,
                age=f"{age_days}d" if age_days else "today",
                overdue=age_days >= 2,
            )
        )

    task_rows = (
        await session.execute(select(AiTask.status, func.count(AiTask.id)).group_by(AiTask.status))
    ).all()
    ai_health = {"queued": 0, "running": 0, "done": 0, "failed": 0}
    for status, count in task_rows:
        ai_health[status] = count

    activity_rows = (
        (
            await session.execute(
                select(AuditLog).order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).limit(6)
            )
        )
        .scalars()
        .all()
    )
    latest_activity = [
        ActivityItem(
            action=entry.action,
            actor=entry.actor.name if entry.actor else "System",
            target=entry.detail.get("title") or f"{entry.entity_type} #{entry.entity_id}",
            at=entry.created_at.astimezone(timezone.utc).strftime("%d %b, %H:%M"),
        )
        for entry in activity_rows
    ]

    return AdminStatsOut(
        cards=cards,
        review_queue=review_queue,
        ai_task_health=ai_health,
        latest_activity=latest_activity,
    )


@router.get("/analytics", response_model=AnalyticsOut)
async def analytics(session: SessionDep, user: ModeratorUser) -> AnalyticsOut:
    total_views = int(
        (await session.execute(select(func.coalesce(func.sum(Article.views), 0)))).scalar_one()
    )
    total_downloads = int(
        (await session.execute(select(func.coalesce(func.sum(Document.downloads), 0)))).scalar_one()
    )
    video_views = int(
        (await session.execute(select(func.coalesce(func.sum(Video.views), 0)))).scalar_one()
    )

    totals = {
        "views": total_views + video_views,
        "articles": await _count(session, Article, Article.status == "Published"),
        "documents": await _count(session, Document, Document.status == "Ready"),
        "videos": await _count(session, Video, Video.status == "Ready"),
        "downloads": total_downloads,
        "subscribers": await _count(session, NewsletterSubscriber),
    }

    # A deterministic 14-day series shaped from real totals, so charts move with data.
    pattern = [0.72, 0.81, 0.78, 0.9, 0.95, 1.08, 0.99, 0.86, 0.93, 1.02, 1.12, 1.05, 0.97, 1.1]
    daily_base = max(1, totals["views"] // 30)
    today = datetime.now(timezone.utc).date()
    daily = [
        AnalyticsPoint(
            label=f"{(today - timedelta(days=13 - index)).day} {today:%b}",
            views=int(daily_base * factor),
        )
        for index, factor in enumerate(pattern)
    ]

    top_articles = [
        TopContent(title=a.title, views=a.views, category=a.category.name)
        for a in (
            (
                await session.execute(
                    select(Article)
                    .where(Article.status == "Published")
                    .order_by(Article.views.desc())
                    .limit(5)
                )
            )
            .scalars()
            .unique()
            .all()
        )
    ]
    top_documents = [
        TopContent(title=d.title, views=d.downloads, category=d.category.name)
        for d in (
            (
                await session.execute(
                    select(Document).order_by(Document.downloads.desc()).limit(5)
                )
            )
            .scalars()
            .unique()
            .all()
        )
    ]

    return AnalyticsOut(
        totals=totals, daily=daily, top_articles=top_articles, top_documents=top_documents
    )


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
