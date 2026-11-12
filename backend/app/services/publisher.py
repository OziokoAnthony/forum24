from __future__ import annotations

import asyncio
import logging
from contextlib import suppress
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import SessionLocal
from ..models import Article
from . import audit

logger = logging.getLogger(__name__)


async def publish_due_articles(
    session: AsyncSession, *, now: datetime | None = None
) -> list[Article]:
    """Publish every Scheduled article whose slot has passed.

    Only articles that already passed the human approval gate can reach
    "Scheduled", so this never promotes drafts or AI output on its own.
    """
    moment = now or datetime.now(timezone.utc)

    articles = (
        (
            await session.execute(
                select(Article)
                .where(
                    Article.status == "Scheduled",
                    Article.scheduled_for.is_not(None),
                    Article.scheduled_for <= moment,
                )
                .order_by(Article.scheduled_for)
            )
        )
        .scalars()
        .unique()
        .all()
    )

    for article in articles:
        scheduled_for = article.scheduled_for
        article.status = "Published"
        article.published_at = scheduled_for or moment
        article.scheduled_for = None
        audit.record(
            session,
            actor=None,
            action="article.auto_publish",
            entity_type="article",
            entity_id=article.id,
            detail={
                "title": article.title,
                "scheduledFor": scheduled_for.isoformat() if scheduled_for else None,
            },
        )

    if articles:
        await session.commit()
        logger.info("Auto-published %d scheduled article(s)", len(articles))
    return articles


async def scheduler_loop(stop: asyncio.Event, interval_seconds: float) -> None:
    """Poll for due articles until shutdown. Errors never kill the worker."""
    interval = max(interval_seconds, 1.0)
    while not stop.is_set():
        try:
            async with SessionLocal() as session:
                await publish_due_articles(session)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Scheduled publisher run failed; will retry")

        with suppress(asyncio.TimeoutError):
            await asyncio.wait_for(stop.wait(), timeout=interval)
