from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from .common import CamelModel
from .public import ArticleBlock, VideoChapter

ArticleStatusLiteral = Literal[
    "Draft", "Pending Review", "Approved", "Scheduled", "Published", "Archived"
]
RoleLiteral = Literal["admin", "editor", "reviewer", "author", "reader"]


class ArticleAdminOut(CamelModel):
    id: int
    slug: str
    title: str
    standfirst: str
    body: list[ArticleBlock] = Field(default_factory=list)
    category_id: int
    category: str
    tags: list[str] = Field(default_factory=list)
    status: str
    author: str
    author_id: int
    reviewed_by: str | None = None
    ai_draft: bool = False
    views: int = 0
    featured: bool = False
    trending: bool = False
    cover: int = 0
    reading_time: int = 4
    updated: str
    updated_at: datetime | None = None
    published_at: datetime | None = None
    scheduled_for: datetime | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    primary_keyword: str | None = None


class ArticleCreate(CamelModel):
    title: str = Field(min_length=5, max_length=300)
    standfirst: str = Field(default="", max_length=600)
    body: list[ArticleBlock] = Field(default_factory=list)
    category_id: int | None = None
    category: str | None = None
    author_id: int | None = None
    tags: list[str] = Field(default_factory=list)
    cover: int = 0
    reading_time: int = Field(default=4, ge=1, le=120)
    featured: bool = False
    trending: bool = False
    ai_draft: bool = False
    seo_title: str | None = Field(default=None, max_length=120)
    seo_description: str | None = Field(default=None, max_length=320)
    primary_keyword: str | None = Field(default=None, max_length=120)


class ArticleUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=5, max_length=300)
    standfirst: str | None = Field(default=None, max_length=600)
    body: list[ArticleBlock] | None = None
    category_id: int | None = None
    category: str | None = None
    author_id: int | None = None
    tags: list[str] | None = None
    cover: int | None = None
    reading_time: int | None = Field(default=None, ge=1, le=120)
    featured: bool | None = None
    trending: bool | None = None
    ai_draft: bool | None = None
    seo_title: str | None = Field(default=None, max_length=120)
    seo_description: str | None = Field(default=None, max_length=320)
    primary_keyword: str | None = Field(default=None, max_length=120)


class ScheduleIn(CamelModel):
    scheduled_for: datetime


class TransitionOut(CamelModel):
    id: int
    status: str
    published_at: datetime | None = None
    scheduled_for: datetime | None = None


class StatCardOut(CamelModel):
    label: str
    value: str
    delta: str


class ReviewQueueItem(CamelModel):
    id: int
    title: str
    author: str
    age: str
    overdue: bool


class ActivityItem(CamelModel):
    action: str
    actor: str
    target: str
    at: str


class AdminStatsOut(CamelModel):
    cards: list[StatCardOut]
    review_queue: list[ReviewQueueItem]
    ai_task_health: dict[str, int]
    latest_activity: list[ActivityItem]


class DocumentAdminOut(CamelModel):
    id: int
    slug: str
    title: str
    description: str
    format: str
    size: str
    size_bytes: int
    pages: int
    category: str
    downloads: int
    views: int
    published: str
    publisher: str
    licence: str
    version: str
    downloadable: bool
    status: str
    updated: str


class DocumentCreate(CamelModel):
    title: str = Field(min_length=3, max_length=300)
    description: str = Field(default="", max_length=2000)
    format: Literal["PDF", "DOCX", "PPTX"] = "PDF"
    size_bytes: int = Field(default=0, ge=0)
    pages: int = Field(default=1, ge=1)
    category_id: int | None = None
    category: str | None = None
    cover: int = 0
    publisher: str = "FORUM24 Learning"
    licence: str = "Free for personal use"
    version: str = "1.0"
    downloadable: bool = True
    file_key: str | None = None
    status: Literal["Queued", "Uploading", "Processing", "Ready", "Failed"] = "Processing"


class DocumentUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=3, max_length=300)
    description: str | None = Field(default=None, max_length=2000)
    size_bytes: int | None = Field(default=None, ge=0)
    pages: int | None = Field(default=None, ge=1)
    category_id: int | None = None
    category: str | None = None
    cover: int | None = None
    publisher: str | None = None
    licence: str | None = None
    version: str | None = None
    downloadable: bool | None = None
    file_key: str | None = None
    status: Literal["Queued", "Uploading", "Processing", "Ready", "Failed"] | None = None


class VideoAdminOut(CamelModel):
    id: int
    slug: str
    title: str
    description: str
    provider: str
    duration: str
    duration_seconds: int
    views: int
    category: str
    published: str
    embeddable: bool
    embed_url: str | None = None
    status: str
    chapters: list[VideoChapter] = Field(default_factory=list)
    updated: str


class VideoCreate(CamelModel):
    title: str = Field(min_length=3, max_length=300)
    description: str = Field(default="", max_length=2000)
    provider: Literal["YouTube", "Vimeo", "Uploaded"] = "YouTube"
    duration_seconds: int = Field(default=0, ge=0)
    category_id: int | None = None
    category: str | None = None
    cover: int = 0
    embeddable: bool = True
    embed_url: str | None = None
    chapters: list[VideoChapter] = Field(default_factory=list)
    transcript: list[str] = Field(default_factory=list)
    status: Literal["Queued", "Uploading", "Processing", "Ready", "Failed"] = "Processing"


class VideoUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=3, max_length=300)
    description: str | None = Field(default=None, max_length=2000)
    duration_seconds: int | None = Field(default=None, ge=0)
    category_id: int | None = None
    category: str | None = None
    cover: int | None = None
    embeddable: bool | None = None
    embed_url: str | None = None
    chapters: list[VideoChapter] | None = None
    transcript: list[str] | None = None
    status: Literal["Queued", "Uploading", "Processing", "Ready", "Failed"] | None = None


class AdAdminOut(CamelModel):
    id: int
    name: str
    slot_id: str
    page_type: str
    device: str
    enabled: bool
    consent_required: bool
    min_height: int
    notes: str | None = None


class AdCreate(CamelModel):
    name: str = Field(min_length=3, max_length=160)
    slot_id: str = Field(min_length=3, max_length=120)
    page_type: Literal["home", "article", "resource-list", "document", "video"]
    device: Literal["all", "mobile", "desktop"] = "all"
    enabled: bool = True
    consent_required: bool = True
    min_height: int = Field(default=280, ge=50, le=1200)
    notes: str | None = None


class AdUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=3, max_length=160)
    page_type: Literal["home", "article", "resource-list", "document", "video"] | None = None
    device: Literal["all", "mobile", "desktop"] | None = None
    enabled: bool | None = None
    consent_required: bool | None = None
    min_height: int | None = Field(default=None, ge=50, le=1200)
    notes: str | None = None


class AnalyticsPoint(CamelModel):
    label: str
    views: int


class TopContent(CamelModel):
    title: str
    views: int
    category: str


class AnalyticsOut(CamelModel):
    totals: dict[str, int]
    daily: list[AnalyticsPoint]
    top_articles: list[TopContent]
    top_documents: list[TopContent]


class AiTaskOut(CamelModel):
    id: int
    kind: str
    status: str
    prompt: dict[str, Any] = Field(default_factory=dict)
    result: dict[str, Any] | None = None
    error: str | None = None
    tokens: int
    cost_usd: float
    created_at: datetime
    finished_at: datetime | None = None


class AiTaskCreate(CamelModel):
    kind: Literal["trends", "research", "draft", "seo", "fact-check"]
    prompt: dict[str, Any] = Field(default_factory=dict)


class AiSettingOut(CamelModel):
    provider: str
    model: str
    temperature: float
    max_tokens: int
    features: dict[str, bool]
    monthly_budget_usd: float
    api_key_last4: str | None = None
    usage: dict[str, Any] = Field(default_factory=dict)


class AiSettingUpdate(CamelModel):
    provider: Literal["openai", "anthropic", "gemini", "azure-openai", "custom"] | None = None
    model: str | None = Field(default=None, max_length=80)
    temperature: float | None = Field(default=None, ge=0, le=2)
    max_tokens: int | None = Field(default=None, ge=128, le=32000)
    features: dict[str, bool] | None = None
    monthly_budget_usd: float | None = Field(default=None, ge=0)
    # Write-only: never returned by the API.
    api_key: str | None = Field(default=None, max_length=300)


class UserAdminOut(CamelModel):
    id: int
    email: str
    slug: str
    name: str
    role: str
    title: str | None = None
    active: bool
    created_at: datetime


class UserCreate(CamelModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    role: RoleLiteral = "author"
    title: str | None = Field(default=None, max_length=160)
    password: str = Field(min_length=10, max_length=200)


class UserUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    role: RoleLiteral | None = None
    title: str | None = Field(default=None, max_length=160)
    active: bool | None = None
    password: str | None = Field(default=None, min_length=10, max_length=200)


class AuditLogOut(CamelModel):
    id: int
    actor: str
    action: str
    entity_type: str
    entity_id: str | None = None
    detail: dict[str, Any] = Field(default_factory=dict)
    at: str


class CommentAdminOut(CamelModel):
    id: int
    article: str
    author_name: str
    body: str
    status: str
    created_at: str


class CommentModerateIn(CamelModel):
    status: Literal["Pending", "Approved", "Rejected", "Spam"]
