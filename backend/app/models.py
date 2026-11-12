from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from .db import Base

# JSONB on PostgreSQL, plain JSON on SQLite.
JSONType = JSON().with_variant(JSONB(), "postgresql")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )


article_tags = Table(
    "article_tags",
    Base.metadata,
    Column("article_id", ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    role: Mapped[str] = mapped_column(String(20), default="author", index=True)
    title: Mapped[str | None] = mapped_column(String(160))
    bio: Mapped[str | None] = mapped_column(Text)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    articles: Mapped[list["Article"]] = relationship(
        back_populates="author", foreign_keys="Article.author_id"
    )


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), unique=True)
    description: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    articles: Mapped[list["Article"]] = relationship(back_populates="category")


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), unique=True)


class Article(Base, TimestampMixin):
    __tablename__ = "articles"
    __table_args__ = (
        Index("ix_articles_status_published", "status", "published_at"),
        UniqueConstraint("slug", name="uq_articles_slug"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(240), index=True)
    title: Mapped[str] = mapped_column(String(300))
    standfirst: Mapped[str] = mapped_column(Text, default="")
    body: Mapped[list[dict[str, Any]]] = mapped_column(JSONType, default=list)

    status: Mapped[str] = mapped_column(String(30), default="Draft", index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    reviewed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))

    cover: Mapped[int] = mapped_column(Integer, default=0)
    reading_time: Mapped[int] = mapped_column(Integer, default=4)
    views: Mapped[int] = mapped_column(Integer, default=0)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    trending: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_draft: Mapped[bool] = mapped_column(Boolean, default=False)

    seo_title: Mapped[str | None] = mapped_column(String(120))
    seo_description: Mapped[str | None] = mapped_column(String(320))
    primary_keyword: Mapped[str | None] = mapped_column(String(120))

    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    category: Mapped[Category] = relationship(back_populates="articles", lazy="joined")
    author: Mapped[User] = relationship(
        back_populates="articles", foreign_keys=[author_id], lazy="joined"
    )
    reviewer: Mapped[User | None] = relationship(foreign_keys=[reviewed_by_id], lazy="joined")
    tags: Mapped[list[Tag]] = relationship(secondary=article_tags, lazy="selectin")
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="article", cascade="all, delete-orphan"
    )


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(240), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")
    format: Mapped[str] = mapped_column(String(10), default="PDF")
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    pages: Mapped[int] = mapped_column(Integer, default=1)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    downloads: Mapped[int] = mapped_column(Integer, default=0)
    views: Mapped[int] = mapped_column(Integer, default=0)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cover: Mapped[int] = mapped_column(Integer, default=0)
    publisher: Mapped[str] = mapped_column(String(160), default="FORUM24 Learning")
    licence: Mapped[str] = mapped_column(String(160), default="Free for personal use")
    version: Mapped[str] = mapped_column(String(40), default="1.0")
    downloadable: Mapped[bool] = mapped_column(Boolean, default=True)
    file_key: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="Ready", index=True)
    processing_error: Mapped[str | None] = mapped_column(Text)

    category: Mapped[Category] = relationship(lazy="joined")


class Video(Base, TimestampMixin):
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(240), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")
    provider: Mapped[str] = mapped_column(String(20), default="YouTube")
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    views: Mapped[int] = mapped_column(Integer, default=0)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cover: Mapped[int] = mapped_column(Integer, default=0)
    embeddable: Mapped[bool] = mapped_column(Boolean, default=True)
    embed_url: Mapped[str | None] = mapped_column(String(500))
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="Ready", index=True)
    chapters: Mapped[list[dict[str, str]]] = mapped_column(JSONType, default=list)
    transcript: Mapped[list[str]] = mapped_column(JSONType, default=list)

    category: Mapped[Category] = relationship(lazy="joined")


class AdPlacement(Base, TimestampMixin):
    __tablename__ = "ad_placements"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    slot_id: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    page_type: Mapped[str] = mapped_column(String(30), index=True)
    device: Mapped[str] = mapped_column(String(20), default="all")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    consent_required: Mapped[bool] = mapped_column(Boolean, default=True)
    min_height: Mapped[int] = mapped_column(Integer, default=280)
    notes: Mapped[str | None] = mapped_column(Text)


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    consent: Mapped[bool] = mapped_column(Boolean, default=True)
    confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    unsubscribed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    ip_hash: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    handled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    article_id: Mapped[int] = mapped_column(ForeignKey("articles.id", ondelete="CASCADE"))
    author_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str | None] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="Pending", index=True)

    article: Mapped[Article] = relationship(back_populates="comments")


class AiTask(Base, TimestampMixin):
    __tablename__ = "ai_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(30), index=True)
    status: Mapped[str] = mapped_column(String(20), default="queued", index=True)
    prompt: Mapped[dict[str, Any]] = mapped_column(JSONType, default=dict)
    result: Mapped[dict[str, Any] | None] = mapped_column(JSONType)
    error: Mapped[str | None] = mapped_column(Text)
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    cost_usd: Mapped[float] = mapped_column(Float, default=0)
    requested_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class AiSetting(Base, TimestampMixin):
    __tablename__ = "ai_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    provider: Mapped[str] = mapped_column(String(30), default="openai")
    model: Mapped[str] = mapped_column(String(80), default="gpt-4.1-mini")
    temperature: Mapped[float] = mapped_column(Float, default=0.4)
    max_tokens: Mapped[int] = mapped_column(Integer, default=2000)
    features: Mapped[dict[str, bool]] = mapped_column(JSONType, default=dict)
    monthly_budget_usd: Mapped[float] = mapped_column(Float, default=150)
    api_key_last4: Mapped[str | None] = mapped_column(String(8))


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(80), index=True)
    entity_type: Mapped[str] = mapped_column(String(60))
    entity_id: Mapped[str | None] = mapped_column(String(60))
    detail: Mapped[dict[str, Any]] = mapped_column(JSONType, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False, index=True
    )
    actor: Mapped[User | None] = relationship(lazy="joined")
