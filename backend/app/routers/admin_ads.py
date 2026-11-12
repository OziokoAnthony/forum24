from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from ..deps import SessionDep, require_roles
from ..models import AdPlacement, User
from ..schemas.admin import AdAdminOut, AdCreate, AdUpdate
from ..serializers import ad_admin
from ..services import audit

router = APIRouter(prefix="/admin/ads", tags=["admin: advertising"])

AdsUser = Annotated[User, Depends(require_roles("editor"))]
AdminUser = Annotated[User, Depends(require_roles("admin"))]

COMPLIANCE_NOTE = (
    "Ads must remain labelled and separate from content and controls. "
    "Never gate a download, a player or an article behind an ad click."
)


@router.get("", response_model=list[AdAdminOut])
async def list_placements(session: SessionDep, user: AdsUser) -> list[AdAdminOut]:
    rows = (
        await session.execute(select(AdPlacement).order_by(AdPlacement.page_type, AdPlacement.slot_id))
    ).scalars().all()
    return [ad_admin(ad) for ad in rows]


@router.get("/compliance")
async def compliance(user: AdsUser) -> dict[str, str]:
    return {"note": COMPLIANCE_NOTE}


@router.post("", response_model=AdAdminOut, status_code=201)
async def create_placement(payload: AdCreate, session: SessionDep, user: AdsUser) -> AdAdminOut:
    existing = (
        await session.execute(select(AdPlacement).where(AdPlacement.slot_id == payload.slot_id))
    ).scalars().one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="That slotId is already in use")

    ad = AdPlacement(
        name=payload.name,
        slot_id=payload.slot_id,
        page_type=payload.page_type,
        device=payload.device,
        enabled=payload.enabled,
        consent_required=payload.consent_required,
        min_height=payload.min_height,
        notes=payload.notes,
    )
    session.add(ad)
    await session.flush()
    audit.record(
        session,
        actor=user,
        action="ad.create",
        entity_type="ad_placement",
        entity_id=ad.id,
        detail={"slotId": ad.slot_id},
    )
    await session.commit()
    await session.refresh(ad)
    return ad_admin(ad)


@router.patch("/{placement_id}", response_model=AdAdminOut)
async def update_placement(
    placement_id: int, payload: AdUpdate, session: SessionDep, user: AdsUser
) -> AdAdminOut:
    ad = await session.get(AdPlacement, placement_id)
    if ad is None:
        raise HTTPException(status_code=404, detail="Placement not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ad, field, value)
    audit.record(
        session,
        actor=user,
        action="ad.update",
        entity_type="ad_placement",
        entity_id=ad.id,
        detail={"fields": sorted(payload.model_fields_set)},
    )
    await session.commit()
    await session.refresh(ad)
    return ad_admin(ad)


@router.delete("/{placement_id}", status_code=204)
async def delete_placement(
    placement_id: int, session: SessionDep, user: AdminUser
) -> None:
    ad = await session.get(AdPlacement, placement_id)
    if ad is None:
        raise HTTPException(status_code=404, detail="Placement not found")
    audit.record(
        session,
        actor=user,
        action="ad.delete",
        entity_type="ad_placement",
        entity_id=ad.id,
        detail={"slotId": ad.slot_id},
    )
    await session.delete(ad)
    await session.commit()
