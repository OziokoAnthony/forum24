from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..deps import CurrentUser, SessionDep, require_roles
from ..models import Document, User, Video
from ..schemas import Page, slugify
from ..schemas.admin import (
    DocumentAdminOut,
    DocumentCreate,
    DocumentUpdate,
    VideoAdminOut,
    VideoCreate,
    VideoUpdate,
)
from ..serializers import document_admin, video_admin
from ..services import audit
from ._helpers import paginate, resolve_category

router = APIRouter(prefix="/admin/resources", tags=["admin: resources"])

ResourceUser = Annotated[User, Depends(require_roles("author"))]
AdminUser = Annotated[User, Depends(require_roles("admin"))]


async def _unique_slug(session: AsyncSession, model, base: str) -> str:
    candidate = base
    counter = 2
    while True:
        exists = (
            await session.execute(select(model.id).where(model.slug == candidate))
        ).scalar_one_or_none()
        if exists is None:
            return candidate
        candidate = f"{base}-{counter}"
        counter += 1


# --------------------------------------------------------------------------- documents


@router.get("/documents", response_model=Page[DocumentAdminOut])
async def list_documents(
    session: SessionDep,
    user: ResourceUser,
    q: str | None = Query(default=None, min_length=2, max_length=120),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = 1,
    page_size: int = Query(default=20, alias="pageSize"),
) -> Page[DocumentAdminOut]:
    statement = select(Document)
    if status_filter:
        statement = statement.where(Document.status == status_filter)
    if q:
        statement = statement.where(Document.title.ilike(f"%{q.strip()}%"))
    statement = statement.order_by(Document.updated_at.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[DocumentAdminOut](
        items=[document_admin(d) for d in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


@router.post("/documents", response_model=DocumentAdminOut, status_code=201)
async def create_document(
    payload: DocumentCreate, session: SessionDep, user: ResourceUser
) -> DocumentAdminOut:
    category = await resolve_category(
        session, category_id=payload.category_id, category=payload.category
    )
    document = Document(
        slug=await _unique_slug(session, Document, slugify(payload.title)),
        title=payload.title.strip(),
        description=payload.description.strip(),
        format=payload.format,
        size_bytes=payload.size_bytes,
        pages=payload.pages,
        category_id=category.id,
        cover=payload.cover,
        publisher=payload.publisher,
        licence=payload.licence,
        version=payload.version,
        downloadable=payload.downloadable,
        file_key=payload.file_key,
        status=payload.status,
        published_at=datetime.now(timezone.utc) if payload.status == "Ready" else None,
    )
    session.add(document)
    await session.flush()
    audit.record(
        session,
        actor=user,
        action="document.create",
        entity_type="document",
        entity_id=document.id,
        detail={"title": document.title, "status": document.status},
    )
    await session.commit()
    await session.refresh(document)
    return document_admin(document)


@router.patch("/documents/{document_id}", response_model=DocumentAdminOut)
async def update_document(
    document_id: int, payload: DocumentUpdate, session: SessionDep, user: ResourceUser
) -> DocumentAdminOut:
    document = await session.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    data = payload.model_dump(exclude_unset=True)
    if "category_id" in data or "category" in data:
        category = await resolve_category(
            session, category_id=data.pop("category_id", None), category=data.pop("category", None)
        )
        document.category_id = category.id

    previous_status = document.status
    for field, value in data.items():
        setattr(document, field, value)

    if document.status == "Ready" and previous_status != "Ready":
        document.published_at = document.published_at or datetime.now(timezone.utc)
        document.processing_error = None
    if document.status == "Failed" and previous_status != "Failed":
        document.processing_error = document.processing_error or "Processing failed; retry the upload."

    audit.record(
        session,
        actor=user,
        action="document.update",
        entity_type="document",
        entity_id=document.id,
        detail={"fields": sorted(payload.model_fields_set)},
    )
    await session.commit()
    await session.refresh(document)
    return document_admin(document)


@router.post("/documents/{document_id}/retry", response_model=DocumentAdminOut)
async def retry_document(document_id: int, session: SessionDep, user: ResourceUser) -> DocumentAdminOut:
    document = await session.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    if document.status not in {"Failed", "Processing", "Queued"}:
        raise HTTPException(status_code=409, detail="Only unfinished or failed documents can be retried")
    document.status = "Processing"
    document.processing_error = None
    audit.record(
        session,
        actor=user,
        action="document.retry",
        entity_type="document",
        entity_id=document.id,
    )
    await session.commit()
    await session.refresh(document)
    return document_admin(document)


@router.delete("/documents/{document_id}", status_code=204)
async def delete_document(
    document_id: int, session: SessionDep, user: AdminUser
) -> None:
    document = await session.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    audit.record(
        session,
        actor=user,
        action="document.delete",
        entity_type="document",
        entity_id=document.id,
        detail={"title": document.title},
    )
    await session.delete(document)
    await session.commit()


@router.post("/uploads/presign", summary="Issue a direct-to-storage upload slot")
async def presign_upload(user: ResourceUser, filename: str, content_type: str = "application/pdf") -> dict:
    """Production signs a PUT/POST URL for S3/R2. This is an explicit stub."""
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive account")
    safe_name = slugify(filename.rsplit(".", 1)[0]) or "upload"
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    key = f"uploads/{datetime.now(timezone.utc):%Y/%m}/{safe_name}.{extension}"
    return {
        "key": key,
        "contentType": content_type,
        "expiresIn": 900,
        "uploadUrl": None,
        "note": "Storage is not configured in this environment. Wire S3/R2 credentials to enable uploads.",
    }


# --------------------------------------------------------------------------- videos


@router.get("/videos", response_model=Page[VideoAdminOut])
async def list_videos(
    session: SessionDep,
    user: ResourceUser,
    q: str | None = Query(default=None, min_length=2, max_length=120),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = 1,
    page_size: int = Query(default=20, alias="pageSize"),
) -> Page[VideoAdminOut]:
    statement = select(Video)
    if status_filter:
        statement = statement.where(Video.status == status_filter)
    if q:
        statement = statement.where(Video.title.ilike(f"%{q.strip()}%"))
    statement = statement.order_by(Video.updated_at.desc())

    rows, total, pages = await paginate(session, statement, page=page, page_size=page_size)
    return Page[VideoAdminOut](
        items=[video_admin(v) for v in rows],
        total=total,
        page=page,
        page_size=min(page_size, 50),
        pages=pages,
    )


@router.post("/videos", response_model=VideoAdminOut, status_code=201)
async def create_video(payload: VideoCreate, session: SessionDep, user: ResourceUser) -> VideoAdminOut:
    category = await resolve_category(
        session, category_id=payload.category_id, category=payload.category
    )
    video = Video(
        slug=await _unique_slug(session, Video, slugify(payload.title)),
        title=payload.title.strip(),
        description=payload.description.strip(),
        provider=payload.provider,
        duration_seconds=payload.duration_seconds,
        category_id=category.id,
        cover=payload.cover,
        embeddable=payload.embeddable,
        embed_url=payload.embed_url,
        chapters=[chapter.model_dump() for chapter in payload.chapters],
        transcript=payload.transcript,
        status=payload.status,
        published_at=datetime.now(timezone.utc) if payload.status == "Ready" else None,
    )
    session.add(video)
    await session.flush()
    audit.record(
        session,
        actor=user,
        action="video.create",
        entity_type="video",
        entity_id=video.id,
        detail={"title": video.title, "status": video.status},
    )
    await session.commit()
    await session.refresh(video)
    return video_admin(video)


@router.patch("/videos/{video_id}", response_model=VideoAdminOut)
async def update_video(
    video_id: int, payload: VideoUpdate, session: SessionDep, user: ResourceUser
) -> VideoAdminOut:
    video = await session.get(Video, video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    data = payload.model_dump(exclude_unset=True)
    if "category_id" in data or "category" in data:
        category = await resolve_category(
            session, category_id=data.pop("category_id", None), category=data.pop("category", None)
        )
        video.category_id = category.id
    if "chapters" in data and data["chapters"] is not None:
        data["chapters"] = [chapter.model_dump() for chapter in payload.chapters or []]

    previous_status = video.status
    for field, value in data.items():
        setattr(video, field, value)

    if video.status == "Ready" and previous_status != "Ready":
        video.published_at = video.published_at or datetime.now(timezone.utc)

    audit.record(
        session,
        actor=user,
        action="video.update",
        entity_type="video",
        entity_id=video.id,
        detail={"fields": sorted(payload.model_fields_set)},
    )
    await session.commit()
    await session.refresh(video)
    return video_admin(video)


@router.post("/videos/{video_id}/retry", response_model=VideoAdminOut)
async def retry_video(video_id: int, session: SessionDep, user: ResourceUser) -> VideoAdminOut:
    video = await session.get(Video, video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.status not in {"Failed", "Processing", "Queued", "Uploading"}:
        raise HTTPException(status_code=409, detail="Only unfinished or failed videos can be retried")
    video.status = "Processing"
    audit.record(
        session,
        actor=user,
        action="video.retry",
        entity_type="video",
        entity_id=video.id,
    )
    await session.commit()
    await session.refresh(video)
    return video_admin(video)


@router.delete("/videos/{video_id}", status_code=204)
async def delete_video(
    video_id: int, session: SessionDep, user: AdminUser
) -> None:
    video = await session.get(Video, video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    audit.record(
        session,
        actor=user,
        action="video.delete",
        entity_type="video",
        entity_id=video.id,
        detail={"title": video.title},
    )
    await session.delete(video)
    await session.commit()
