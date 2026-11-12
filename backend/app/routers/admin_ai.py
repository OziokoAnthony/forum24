from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select

from ..constants import DEFAULT_AI_FEATURES
from ..demo import FACT_CHECKS, RESEARCH_SOURCES, TRENDING_TOPICS
from ..deps import SessionDep, require_roles
from ..models import AiSetting, AiTask, User
from ..schemas.admin import AiSettingOut, AiSettingUpdate, AiTaskCreate, AiTaskOut
from ..serializers import ai_task_out
from ..services import audit

router = APIRouter(prefix="/admin/ai", tags=["admin: AI desk"])

DeskUser = Annotated[User, Depends(require_roles("editor"))]
AdminUser = Annotated[User, Depends(require_roles("admin"))]


async def _settings(session: SessionDep) -> AiSetting:
    setting = await session.get(AiSetting, 1)
    if setting is None:
        setting = AiSetting(
            id=1,
            provider="openai",
            model="gpt-4.1-mini",
            temperature=0.4,
            max_tokens=2000,
            features=dict(DEFAULT_AI_FEATURES),
            monthly_budget_usd=150,
        )
        session.add(setting)
        await session.commit()
        await session.refresh(setting)
    return setting


def _setting_out(setting: AiSetting, usage: dict) -> AiSettingOut:
    return AiSettingOut(
        provider=setting.provider,
        model=setting.model,
        temperature=setting.temperature,
        max_tokens=setting.max_tokens,
        features=setting.features or {},
        monthly_budget_usd=setting.monthly_budget_usd,
        api_key_last4=setting.api_key_last4,
        usage=usage,
    )


async def _usage(session: SessionDep) -> dict:
    rows = (
        await session.execute(
            select(AiTask.status, func.count(AiTask.id), func.coalesce(func.sum(AiTask.tokens), 0), func.coalesce(func.sum(AiTask.cost_usd), 0.0))
            .group_by(AiTask.status)
        )
    ).all()
    by_status = {status: {"tasks": count, "tokens": int(tokens), "costUsd": round(float(cost), 4)} for status, count, tokens, cost in rows}
    total_tasks = sum(item["tasks"] for item in by_status.values())
    total_tokens = sum(item["tokens"] for item in by_status.values())
    total_cost = round(sum(item["costUsd"] for item in by_status.values()), 4)
    return {
        "totalTasks": total_tasks,
        "totalTokens": total_tokens,
        "estimatedCostUsd": total_cost,
        "byStatus": by_status,
    }


@router.get("/trends")
async def trends(user: DeskUser) -> dict:
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "demo",
        "items": TRENDING_TOPICS,
        "note": "Demo trend set. Connect a provider to populate this from live signals.",
    }


@router.get("/sources")
async def sources(user: DeskUser) -> dict:
    return {"items": RESEARCH_SOURCES, "note": "Every claim needs a primary source before it reaches the editor."}


@router.get("/fact-checks")
async def fact_checks(user: DeskUser) -> dict:
    return {"items": FACT_CHECKS}


@router.get("/tasks", response_model=list[AiTaskOut])
async def list_tasks(
    session: SessionDep,
    user: DeskUser,
    limit: int = Query(default=20, ge=1, le=100),
) -> list[AiTaskOut]:
    rows = (
        (await session.execute(select(AiTask).order_by(AiTask.created_at.desc()).limit(limit)))
        .scalars()
        .all()
    )
    return [ai_task_out(task) for task in rows]


@router.post("/tasks", response_model=AiTaskOut, status_code=202)
async def create_task(payload: AiTaskCreate, session: SessionDep, user: DeskUser) -> AiTaskOut:
    task = AiTask(
        kind=payload.kind,
        status="queued",
        prompt=payload.prompt,
        requested_by_id=user.id,
    )
    session.add(task)
    await session.flush()
    audit.record(
        session,
        actor=user,
        action="ai.task.create",
        entity_type="ai_task",
        entity_id=task.id,
        detail={"kind": task.kind},
    )
    await session.commit()
    await session.refresh(task)
    return ai_task_out(task)


@router.get("/tasks/{task_id}", response_model=AiTaskOut)
async def get_task(task_id: int, session: SessionDep, user: DeskUser) -> AiTaskOut:
    task = await session.get(AiTask, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return ai_task_out(task)


@router.post("/tasks/{task_id}/retry", response_model=AiTaskOut)
async def retry_task(task_id: int, session: SessionDep, user: DeskUser) -> AiTaskOut:
    task = await session.get(AiTask, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status not in {"failed", "queued"}:
        raise HTTPException(status_code=409, detail="Only queued or failed tasks can be retried")
    task.status = "queued"
    task.error = None
    audit.record(
        session,
        actor=user,
        action="ai.task.retry",
        entity_type="ai_task",
        entity_id=task.id,
    )
    await session.commit()
    await session.refresh(task)
    return ai_task_out(task)


@router.get("/settings", response_model=AiSettingOut)
async def get_settings(session: SessionDep, user: DeskUser) -> AiSettingOut:
    setting = await _settings(session)
    return _setting_out(setting, await _usage(session))


@router.patch("/settings", response_model=AiSettingOut)
async def update_settings(
    payload: AiSettingUpdate, session: SessionDep, user: AdminUser
) -> AiSettingOut:
    setting = await _settings(session)
    data = payload.model_dump(exclude_unset=True)

    api_key = data.pop("api_key", None)
    if api_key is not None:
        # Keys are write-only. Store only the last four characters for display.
        setting.api_key_last4 = api_key[-4:] if len(api_key) >= 4 else None

    for field, value in data.items():
        setattr(setting, field, value)

    audit.record(
        session,
        actor=user,
        action="ai.settings.update",
        entity_type="ai_settings",
        entity_id=1,
        detail={"fields": sorted(payload.model_fields_set)},
    )
    await session.commit()
    await session.refresh(setting)
    return _setting_out(setting, await _usage(session))
