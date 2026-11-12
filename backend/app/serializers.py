from __future__ import annotations

from .models import (
    AdPlacement,
    AiTask,
    Article,
    AuditLog,
    Comment,
    Document,
    User,
    Video,
)
from .schemas import (
    AdOut,
    ArticleDetail,
    ArticleSummary,
    AuthorOut,
    DocumentOut,
    VideoChapter,
    VideoOut,
    format_date,
    format_duration,
    format_stamp,
    human_size,
)
from .schemas.admin import (
    AdAdminOut,
    AiTaskOut,
    ArticleAdminOut,
    AuditLogOut,
    CommentAdminOut,
    DocumentAdminOut,
    VideoAdminOut,
    UserAdminOut,
)


def article_summary(article: Article) -> ArticleSummary:
    reviewer = article.reviewer
    return ArticleSummary(
        slug=article.slug,
        title=article.title,
        standfirst=article.standfirst,
        category=article.category.name,
        author=article.author.name,
        author_role=article.author.title or article.author.role.title(),
        date=format_date(article.published_at or article.updated_at),
        reading_time=article.reading_time,
        views=article.views,
        cover=article.cover,
        tags=sorted(tag.name for tag in article.tags),
        reviewed_by=reviewer.name if reviewer else None,
        featured=article.featured,
        trending=article.trending,
    )


def article_detail(article: Article) -> ArticleDetail:
    summary = article_summary(article)
    return ArticleDetail(**summary.model_dump(), body=article.body or [])


def document_out(document: Document) -> DocumentOut:
    return DocumentOut(
        slug=document.slug,
        title=document.title,
        description=document.description,
        format=document.format,
        size=human_size(document.size_bytes),
        pages=document.pages,
        category=document.category.name,
        downloads=document.downloads,
        published=format_date(document.published_at),
        cover=document.cover,
        publisher=document.publisher,
        licence=document.licence,
        version=document.version,
        downloadable=document.downloadable,
        status=document.status,
    )


def video_out(video: Video) -> VideoOut:
    return VideoOut(
        slug=video.slug,
        title=video.title,
        description=video.description,
        provider=video.provider,
        duration=format_duration(video.duration_seconds),
        views=video.views,
        category=video.category.name,
        published=format_date(video.published_at),
        cover=video.cover,
        embeddable=video.embeddable,
        chapters=[VideoChapter(**chapter) for chapter in (video.chapters or [])],
        transcript=list(video.transcript or []),
        embed_url=video.embed_url,
        status=video.status,
    )


def author_out(user: User) -> AuthorOut:
    return AuthorOut(
        slug=user.slug,
        name=user.name,
        role=user.role,
        title=user.title,
        bio=user.bio,
        avatar_url=user.avatar_url,
    )


def ad_out(ad: AdPlacement) -> AdOut:
    return AdOut(
        slot_id=ad.slot_id,
        name=ad.name,
        page_type=ad.page_type,
        device=ad.device,
        consent_required=ad.consent_required,
        min_height=ad.min_height,
    )


def article_admin(article: Article) -> ArticleAdminOut:
    return ArticleAdminOut(
        id=article.id,
        slug=article.slug,
        title=article.title,
        standfirst=article.standfirst,
        body=article.body or [],
        category_id=article.category_id,
        category=article.category.name,
        tags=sorted(tag.name for tag in article.tags),
        status=article.status,
        author=article.author.name,
        author_id=article.author_id,
        reviewed_by=article.reviewer.name if article.reviewer else None,
        ai_draft=article.ai_draft,
        views=article.views,
        featured=article.featured,
        trending=article.trending,
        cover=article.cover,
        reading_time=article.reading_time,
        updated=format_stamp(article.updated_at),
        updated_at=article.updated_at,
        published_at=article.published_at,
        scheduled_for=article.scheduled_for,
        seo_title=article.seo_title,
        seo_description=article.seo_description,
        primary_keyword=article.primary_keyword,
    )


def document_admin(document: Document) -> DocumentAdminOut:
    return DocumentAdminOut(
        id=document.id,
        slug=document.slug,
        title=document.title,
        description=document.description,
        format=document.format,
        size=human_size(document.size_bytes),
        size_bytes=document.size_bytes,
        pages=document.pages,
        category=document.category.name,
        downloads=document.downloads,
        views=document.views,
        published=format_date(document.published_at),
        publisher=document.publisher,
        licence=document.licence,
        version=document.version,
        downloadable=document.downloadable,
        status=document.status,
        updated=format_stamp(document.updated_at),
    )


def video_admin(video: Video) -> VideoAdminOut:
    return VideoAdminOut(
        id=video.id,
        slug=video.slug,
        title=video.title,
        description=video.description,
        provider=video.provider,
        duration=format_duration(video.duration_seconds),
        duration_seconds=video.duration_seconds,
        views=video.views,
        category=video.category.name,
        published=format_date(video.published_at),
        embeddable=video.embeddable,
        embed_url=video.embed_url,
        status=video.status,
        chapters=[VideoChapter(**chapter) for chapter in (video.chapters or [])],
        updated=format_stamp(video.updated_at),
    )


def ad_admin(ad: AdPlacement) -> AdAdminOut:
    return AdAdminOut(
        id=ad.id,
        name=ad.name,
        slot_id=ad.slot_id,
        page_type=ad.page_type,
        device=ad.device,
        enabled=ad.enabled,
        consent_required=ad.consent_required,
        min_height=ad.min_height,
        notes=ad.notes,
    )


def ai_task_out(task: AiTask) -> AiTaskOut:
    return AiTaskOut(
        id=task.id,
        kind=task.kind,
        status=task.status,
        prompt=task.prompt or {},
        result=task.result,
        error=task.error,
        tokens=task.tokens,
        cost_usd=task.cost_usd,
        created_at=task.created_at,
        finished_at=task.finished_at,
    )


def user_admin(user: User) -> UserAdminOut:
    return UserAdminOut(
        id=user.id,
        email=user.email,
        slug=user.slug,
        name=user.name,
        role=user.role,
        title=user.title,
        active=user.is_active,
        created_at=user.created_at,
    )


def audit_out(entry: AuditLog) -> AuditLogOut:
    return AuditLogOut(
        id=entry.id,
        actor=entry.actor.name if entry.actor else "System",
        action=entry.action,
        entity_type=entry.entity_type,
        entity_id=entry.entity_id,
        detail=entry.detail or {},
        at=format_stamp(entry.created_at),
    )


def comment_admin(comment: Comment) -> CommentAdminOut:
    return CommentAdminOut(
        id=comment.id,
        article=comment.article.title if comment.article else "",
        author_name=comment.author_name,
        body=comment.body,
        status=comment.status,
        created_at=format_stamp(comment.created_at),
    )
