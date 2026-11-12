from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import AuditLog, User


def record(
    session: AsyncSession,
    *,
    actor: User | None,
    action: str,
    entity_type: str,
    entity_id: str | int | None = None,
    detail: dict[str, Any] | None = None,
) -> AuditLog:
    """Stage an audit entry. The caller owns the commit so it lands atomically."""
    entry = AuditLog(
        actor_id=actor.id if actor else None,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        detail=detail or {},
    )
    session.add(entry)
    return entry
