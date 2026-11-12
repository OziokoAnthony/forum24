from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import get_settings
from .db import SessionLocal, engine
from .routers import (
    admin_ads,
    admin_ai,
    admin_analytics,
    admin_articles,
    admin_resources,
    admin_system,
    auth,
    public,
)
from .seed import seed_if_empty
from .services.publisher import scheduler_loop

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.seed_on_startup:
        async with SessionLocal() as session:
            await seed_if_empty(session)

    stop_scheduler = asyncio.Event()
    scheduler: asyncio.Task[None] | None = None
    if settings.scheduler_enabled:
        scheduler = asyncio.create_task(
            scheduler_loop(stop_scheduler, settings.scheduler_interval_seconds),
            name="forum24-scheduler",
        )

    yield

    stop_scheduler.set()
    if scheduler is not None:
        scheduler.cancel()
        with suppress(asyncio.CancelledError):
            await scheduler
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description=(
            "The FORUM24 API behind the public site, the Learning Centre and the editorial desk. "
            "Ads never gate content; publishing always requires a human approval."
        ),
        docs_url="/docs" if settings.docs_enabled else None,
        redoc_url="/redoc" if settings.docs_enabled else None,
        openapi_url="/openapi.json" if settings.docs_enabled else None,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    for router in (
        public.router,
        auth.router,
        admin_articles.router,
        admin_resources.router,
        admin_ads.router,
        admin_ai.router,
        admin_analytics.router,
        admin_system.router,
    ):
        app.include_router(router, prefix=settings.api_prefix)

    @app.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        try:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
        except Exception:
            return {"status": "degraded", "database": "unavailable"}
        return {"status": "ok", "database": "ok"}

    return app


app = create_app()
