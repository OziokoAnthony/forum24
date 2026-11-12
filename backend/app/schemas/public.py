from __future__ import annotations

from typing import Annotated, Generic, Literal, TypeVar

from pydantic import BaseModel, EmailStr, Field, field_validator

from .common import CamelModel

T = TypeVar("T")


class Page(CamelModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class CategoryOut(CamelModel):
    slug: str
    name: str
    description: str = ""


class TagOut(CamelModel):
    slug: str
    name: str


class ParagraphBlock(BaseModel):
    type: Literal["p"]
    text: str


class HeadingBlock(BaseModel):
    type: Literal["h2"]
    text: str


class QuoteBlock(BaseModel):
    type: Literal["quote"]
    text: str


class ListBlock(BaseModel):
    type: Literal["list"]
    items: list[str]


ArticleBlock = Annotated[
    ParagraphBlock | HeadingBlock | QuoteBlock | ListBlock,
    Field(discriminator="type"),
]


class AuthorOut(CamelModel):
    slug: str
    name: str
    role: str
    title: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


class ArticleSummary(CamelModel):
    slug: str
    title: str
    standfirst: str
    category: str
    author: str
    author_role: str
    date: str
    reading_time: int
    views: int
    cover: int
    tags: list[str] = Field(default_factory=list)
    reviewed_by: str | None = None
    featured: bool = False
    trending: bool = False


class ArticleDetail(ArticleSummary):
    body: list[ArticleBlock] = Field(default_factory=list)


class DocumentOut(CamelModel):
    slug: str
    title: str
    description: str
    format: str
    size: str
    pages: int
    category: str
    downloads: int
    published: str
    cover: int
    publisher: str
    licence: str
    version: str
    downloadable: bool
    status: str = "Ready"


class VideoChapter(CamelModel):
    at: str
    label: str


class VideoOut(CamelModel):
    slug: str
    title: str
    description: str
    provider: str
    duration: str
    views: int
    category: str
    published: str
    cover: int
    embeddable: bool
    chapters: list[VideoChapter] = Field(default_factory=list)
    transcript: list[str] = Field(default_factory=list)
    embed_url: str | None = None
    status: str = "Ready"


class BootstrapOut(CamelModel):
    categories: list[CategoryOut]
    articles: list[ArticleDetail]
    documents: list[DocumentOut]
    videos: list[VideoOut]


class SearchOut(CamelModel):
    query: str
    articles: list[ArticleSummary]
    documents: list[DocumentOut]
    videos: list[VideoOut]
    total: int


class AuthorArchiveOut(CamelModel):
    author: AuthorOut
    articles: list[ArticleSummary]


class AdOut(CamelModel):
    slot_id: str
    name: str
    page_type: str
    device: str
    consent_required: bool
    min_height: int


class NewsletterIn(CamelModel):
    email: EmailStr
    consent: bool = True

    @field_validator("consent")
    @classmethod
    def consent_required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Consent is required to subscribe")
        return value


class NewsletterOut(CamelModel):
    email: str
    status: str


class ContactIn(CamelModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    # Honeypot: real people never fill this in.
    company: str | None = Field(default=None, max_length=200)


class ContactOut(CamelModel):
    received: bool
    reference: str


class CommentIn(CamelModel):
    author_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    body: str = Field(min_length=2, max_length=4000)


class CommentOut(CamelModel):
    id: int
    author_name: str
    body: str
    status: str
    created_at: str
