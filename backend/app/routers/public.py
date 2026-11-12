from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import Response
from sqlalchemy import func, or_, select

from ..config import get_settings
from ..deps import SessionDep
from ..models import (
    AdPlacement,
    Article,
    Category,
    Comment,
    ContactMessage,
    Document,
    NewsletterSubscriber,
    Tag,
    User,
    Video,
)
from ..pdf import build_sample_pdf
from ..schemas import (
    AdOut,
    ArticleDetail,
    ArticleSummary,
    AuthorArchiveOut,
    BootstrapOut,
    CategoryOut,
    CommentIn,
    CommentOut,
    ContactIn,
    ContactOut,
    DocumentOut,
    NewsletterIn,
    NewsletterOut,
    Page,
    SearchOut,
    TagOut,
    VideoOut,
    format_stamp,
)
from ..serializers import (
    article_detail,
    article_summary,
    author_out,
    document_out,
    video_out,
)
from ._helpers import paginate

router = APIRouter(tags=["public"])


def _published():
    return Article.status == "Published"


@router.get("/bootstrap", response_model=BootstrapOut, summary="Everything the public shell needs")
async def bootstrap(session: SessionDep) -> BootstrapOut:
    categories = (
        (await session.execute(select(Category).order_by(Category.sort_order, Category.name)))
        .scalars()
        .all()
    )
    articles = (
        (
            await session.execute(
                select(Article)
                .where(_published())
                .order_by(Article.published_at.desc().nullslast(), Article.id.desc())
            )
        )
        .scalars()
        .unique()
        .all()
    )
    documents = (
        (
            await session.execute(
                select(Document)
                .where(Document.status == "Ready")
                .order_by(Document.published_at.desc().nullslast(), Document.id.desc())
            )
        )
        .scalars()
        .unique()
        .all()
    )
    videos = (
        (
            await session.execute(
                select(Video)
                .where(Video.status == "Ready")
                .order_by(Video.published_at.desc().nullslast(), Video.id.desc())
            )
        )
        .scalars()
        .unique()
        .all()
    )

    return BootstrapOut(
        categories=[CategoryOut(slug=c.slug, name=c.name, description=c.description) for c in categories],
        articles=[article_detail(a) for a in articles],
        documents=[document_out(d) for d in documents],
        videos=[video_out(v) for v in videos],
    )


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(session: SessionDep) -> list[CategoryOut]:
    rows = (
        (await session.execute(select(Category).order_by(Category.sort_order, Category.name)))
        .scalars()
        .all()
    )
    return [CategoryOut(slug=c.slug, name=c.name, description=c.description) for c in rows]


@router.get("/tags", response_model=list[TagOut])
async def list_tags(session: SessionDep) -> list[TagOut]:
    rows = (await session.execute(select(Tag).order_by(Tag.name))).scalars().all()
    return [TagOut(slug=t.slug, name=t.name) for t in rows]


@router.get("/articles", response_model=Page[ArticleSummary])
async def list_articles(
    session: SessionDep,
    category: str | None = None,
    tag: str | None = None,
    q: str | None = Query(default=None, min_length=2, max_length=120),
    featured: bool | None = None,
    trending: bool | None = None,
    sort: Annotated[str, Query(pattern="^(latest|views)$")] = "latest",
    page: int = 1,
    page_size: int = Query(default=12, alias="pageSize"),
) -> Page[ArticleSummary]:
    statement = select(Article).where(_published())

    if category:
        statement = statement.join(Category, Article.category_id == Category.id).where(
            Category.slug == category
        )
    if tag:
        statement = statement.join(Article.tags).where(Tag.slug == tag)
    if featured is not None:
        statement = statement.where(Article.featured.is_(featured))
    if trending is not None:
        statement = statement.where(Article.trending.is_(trending))
    if q:
        needle = f"%{q.strip().lower()}%"
        statement = statement.where(
            or_(
                func.lower(Article.title).like(needle),
                func.lower(Article.standfirst).like(needle),
            )
        )

    if sort == "views":
        statement = statement.order_by(Article.views.desc(), Article.id.desc())
    else:
        statement = statement.order_by(Article.published_at.desc().nullslast(), Article.id.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[ArticleSummary](
        items=[article_summary(a) for a in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


async def _get_public_article(session: SessionDep, slug: str) -> Article:
    article = (
        await session.execute(select(Article).where(Article.slug == slug, _published()))
    ).scalars().unique().one_or_none()
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/articles/{slug}", response_model=ArticleDetail)
async def get_article(slug: str, session: SessionDep) -> ArticleDetail:
    article = await _get_public_article(session, slug)
    article.views += 1
    await session.commit()
    return article_detail(article)


@router.get("/articles/{slug}/related", response_model=list[ArticleSummary])
async def related_articles(slug: str, session: SessionDep, limit: int = Query(default=3, le=9)):
    article = await _get_public_article(session, slug)
    rows = (
        (
            await session.execute(
                select(Article)
                .where(_published(), Article.id != article.id, Article.category_id == article.category_id)
                .order_by(Article.published_at.desc().nullslast())
                .limit(limit)
            )
        )
        .scalars()
        .unique()
        .all()
    )
    if len(rows) < limit:
        extra = (
            (
                await session.execute(
                    select(Article)
                    .where(_published(), Article.id != article.id)
                    .order_by(Article.views.desc())
                    .limit(limit * 2)
                )
            )
            .scalars()
            .unique()
            .all()
        )
        seen = {row.id for row in rows}
        for candidate in extra:
            if candidate.id not in seen:
                rows.append(candidate)
                seen.add(candidate.id)
            if len(rows) == limit:
                break
    return [article_summary(a) for a in rows]


@router.get("/articles/{slug}/comments", response_model=list[CommentOut])
async def list_comments(slug: str, session: SessionDep) -> list[CommentOut]:
    article = await _get_public_article(session, slug)
    rows = (
        (
            await session.execute(
                select(Comment)
                .where(Comment.article_id == article.id, Comment.status == "Approved")
                .order_by(Comment.created_at)
            )
        )
        .scalars()
        .all()
    )
    return [
        CommentOut(
            id=c.id,
            author_name=c.author_name,
            body=c.body,
            status=c.status,
            created_at=format_stamp(c.created_at),
        )
        for c in rows
    ]


@router.post("/articles/{slug}/comments", response_model=CommentOut, status_code=201)
async def create_comment(slug: str, payload: CommentIn, session: SessionDep) -> CommentOut:
    article = await _get_public_article(session, slug)
    comment = Comment(
        article_id=article.id,
        author_name=payload.author_name,
        email=str(payload.email),
        body=payload.body,
        status="Pending",
    )
    session.add(comment)
    await session.commit()
    await session.refresh(comment)
    return CommentOut(
        id=comment.id,
        author_name=comment.author_name,
        body=comment.body,
        status=comment.status,
        created_at=format_stamp(comment.created_at),
    )


@router.get("/search", response_model=SearchOut)
async def search(
    session: SessionDep,
    q: str = Query(min_length=2, max_length=120),
    limit: int = Query(default=20, ge=1, le=50),
) -> SearchOut:
    needle = f"%{q.strip().lower()}%"

    articles = (
        (
            await session.execute(
                select(Article)
                .where(
                    _published(),
                    or_(
                        func.lower(Article.title).like(needle),
                        func.lower(Article.standfirst).like(needle),
                    ),
                )
                .order_by(Article.published_at.desc().nullslast())
                .limit(limit)
            )
        )
        .scalars()
        .unique()
        .all()
    )
    documents = (
        (
            await session.execute(
                select(Document)
                .where(
                    Document.status == "Ready",
                    or_(
                        func.lower(Document.title).like(needle),
                        func.lower(Document.description).like(needle),
                    ),
                )
                .order_by(Document.downloads.desc())
                .limit(limit)
            )
        )
        .scalars()
        .unique()
        .all()
    )
    videos = (
        (
            await session.execute(
                select(Video)
                .where(
                    Video.status == "Ready",
                    or_(
                        func.lower(Video.title).like(needle),
                        func.lower(Video.description).like(needle),
                    ),
                )
                .order_by(Video.views.desc())
                .limit(limit)
            )
        )
        .scalars()
        .unique()
        .all()
    )

    return SearchOut(
        query=q,
        articles=[article_summary(a) for a in articles],
        documents=[document_out(d) for d in documents],
        videos=[video_out(v) for v in videos],
        total=len(articles) + len(documents) + len(videos),
    )


@router.get("/documents", response_model=Page[DocumentOut])
async def list_documents(
    session: SessionDep,
    category: str | None = None,
    format: str | None = None,
    q: str | None = Query(default=None, min_length=2, max_length=120),
    sort: Annotated[str, Query(pattern="^(newest|downloads)$")] = "newest",
    page: int = 1,
    page_size: int = Query(default=12, alias="pageSize"),
) -> Page[DocumentOut]:
    statement = select(Document).where(Document.status == "Ready")
    if category:
        statement = statement.join(Category, Document.category_id == Category.id).where(
            Category.slug == category
        )
    if format:
        statement = statement.where(Document.format == format.upper())
    if q:
        needle = f"%{q.strip().lower()}%"
        statement = statement.where(
            or_(
                func.lower(Document.title).like(needle),
                func.lower(Document.description).like(needle),
            )
        )
    if sort == "downloads":
        statement = statement.order_by(Document.downloads.desc(), Document.id.desc())
    else:
        statement = statement.order_by(Document.published_at.desc().nullslast(), Document.id.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[DocumentOut](
        items=[document_out(d) for d in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


async def _get_document(session: SessionDep, slug: str) -> Document:
    document = (
        await session.execute(select(Document).where(Document.slug == slug))
    ).scalars().unique().one_or_none()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("/documents/{slug}", response_model=DocumentOut)
async def get_document(slug: str, session: SessionDep) -> DocumentOut:
    document = await _get_document(session, slug)
    if document.status != "Ready":
        raise HTTPException(status_code=404, detail="Document is not available yet")
    document.views += 1
    await session.commit()
    return document_out(document)


@router.get(
    "/documents/{slug}/download",
    summary="Download the document (never gated by an ad)",
    response_class=Response,
)
async def download_document(slug: str, session: SessionDep) -> Response:
    document = await _get_document(session, slug)
    if document.status != "Ready":
        raise HTTPException(status_code=409, detail="The document is still being processed")
    if not document.downloadable:
        raise HTTPException(
            status_code=403,
            detail="This document is view only. The publisher has not enabled downloads.",
        )

    document.downloads += 1
    await session.commit()

    pdf_bytes = build_sample_pdf(document.title, publisher=document.publisher)
    filename = f"forum24-{document.slug}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get("/videos", response_model=Page[VideoOut])
async def list_videos(
    session: SessionDep,
    category: str | None = None,
    provider: str | None = None,
    q: str | None = Query(default=None, min_length=2, max_length=120),
    sort: Annotated[str, Query(pattern="^(newest|views)$")] = "newest",
    page: int = 1,
    page_size: int = Query(default=12, alias="pageSize"),
) -> Page[VideoOut]:
    statement = select(Video).where(Video.status == "Ready")
    if category:
        statement = statement.join(Category, Video.category_id == Category.id).where(
            Category.slug == category
        )
    if provider:
        statement = statement.where(Video.provider == provider)
    if q:
        needle = f"%{q.strip().lower()}%"
        statement = statement.where(
            or_(
                func.lower(Video.title).like(needle),
                func.lower(Video.description).like(needle),
            )
        )
    if sort == "views":
        statement = statement.order_by(Video.views.desc(), Video.id.desc())
    else:
        statement = statement.order_by(Video.published_at.desc().nullslast(), Video.id.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[VideoOut](
        items=[video_out(v) for v in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


async def _get_video(session: SessionDep, slug: str) -> Video:
    video = (
        await session.execute(select(Video).where(Video.slug == slug))
    ).scalars().unique().one_or_none()
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.get("/videos/{slug}", response_model=VideoOut)
async def get_video(slug: str, session: SessionDep) -> VideoOut:
    video = await _get_video(session, slug)
    if video.status != "Ready":
        raise HTTPException(status_code=404, detail="Video is not available yet")
    video.views += 1
    await session.commit()
    return video_out(video)


@router.get("/authors/{slug}", response_model=AuthorArchiveOut)
async def author_archive(slug: str, session: SessionDep) -> AuthorArchiveOut:
    author = (
        await session.execute(select(User).where(User.slug == slug, User.is_active.is_(True)))
    ).scalars().one_or_none()
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")

    rows = (
        (
            await session.execute(
                select(Article)
                .where(_published(), Article.author_id == author.id)
                .order_by(Article.published_at.desc().nullslast())
            )
        )
        .scalars()
        .unique()
        .all()
    )
    return AuthorArchiveOut(author=author_out(author), articles=[article_summary(a) for a in rows])


@router.get("/ads", response_model=list[AdOut])
async def list_ads(
    session: SessionDep,
    page_type: str | None = Query(default=None, alias="pageType"),
    device: Annotated[str, Query(pattern="^(all|mobile|desktop)$")] = "desktop",
) -> list[AdOut]:
    statement = select(AdPlacement).where(
        AdPlacement.enabled.is_(True),
        AdPlacement.device.in_(["all", device]),
    )
    if page_type:
        statement = statement.where(AdPlacement.page_type == page_type)
    rows = (await session.execute(statement.order_by(AdPlacement.page_type, AdPlacement.slot_id))).scalars().all()
    return [
        AdOut(
            slot_id=ad.slot_id,
            name=ad.name,
            page_type=ad.page_type,
            device=ad.device,
            consent_required=ad.consent_required,
            min_height=ad.min_height,
        )
        for ad in rows
    ]


@router.post("/newsletter", response_model=NewsletterOut, status_code=201)
async def subscribe(payload: NewsletterIn, session: SessionDep) -> NewsletterOut:
    email = str(payload.email).strip().lower()
    existing = (
        await session.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email))
    ).scalars().one_or_none()

    if existing is None:
        session.add(NewsletterSubscriber(email=email, consent=True, confirmed=False))
        await session.commit()
        return NewsletterOut(email=email, status="subscribed")

    if existing.unsubscribed_at is not None:
        existing.unsubscribed_at = None
        existing.consent = True
        await session.commit()
        return NewsletterOut(email=email, status="resubscribed")

    return NewsletterOut(email=email, status="already-subscribed")


@router.post("/contact", response_model=ContactOut, status_code=201)
async def contact(payload: ContactIn, session: SessionDep, request: Request) -> ContactOut:
    reference = f"F24-{secrets.token_hex(3).upper()}"

    # Honeypot: accept silently so bots cannot tell they were filtered.
    if payload.company:
        return ContactOut(received=True, reference=reference)

    ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(f"{get_settings().secret_key}:{ip}".encode()).hexdigest()[:32]

    session.add(
        ContactMessage(
            name=payload.name.strip(),
            email=str(payload.email).strip().lower(),
            subject=payload.subject.strip(),
            message=payload.message.strip(),
            ip_hash=ip_hash,
        )
    )
    await session.commit()
    return ContactOut(received=True, reference=reference)


@router.get("/site", summary="Small public site payload")
async def site() -> dict[str, str]:
    return {
        "name": "FORUM24",
        "tagline": "Nigeria's pulse. Africa's stories.",
        "editorialPolicy": "/editorial-policy",
        "privacy": "/privacy",
        "terms": "/terms",
        "updated": datetime.now(timezone.utc).date().isoformat(),
    }
