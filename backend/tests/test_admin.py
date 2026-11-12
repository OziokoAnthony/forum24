from __future__ import annotations

import httpx

API = "/api/v1"


async def test_sign_in_does_not_leak_accounts(client: httpx.AsyncClient):
    wrong_password = await client.post(
        f"{API}/auth/login",
        json={"email": "admin@forum24.example", "password": "wrong-password"},
    )
    unknown_email = await client.post(
        f"{API}/auth/login",
        json={"email": "nobody@forum24.example", "password": "wrong-password"},
    )
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json()["detail"] == unknown_email.json()["detail"]


async def test_me_requires_a_bearer_token(client: httpx.AsyncClient, admin_headers):
    assert (await client.get(f"{API}/auth/me")).status_code == 401

    me = await client.get(f"{API}/auth/me", headers=admin_headers)
    assert me.status_code == 200
    assert me.json()["role"] == "admin"
    assert "password" not in me.text.lower()


async def test_author_sees_only_their_own_articles(client: httpx.AsyncClient, author_headers, editor_headers):
    author_list = await client.get(f"{API}/admin/articles", headers=author_headers)
    assert author_list.status_code == 200
    items = author_list.json()["items"]
    assert items and all(item["author"] == "Adaeze Okonkwo" for item in items)

    editor_list = await client.get(f"{API}/admin/articles", headers=editor_headers)
    assert editor_list.json()["total"] > author_list.json()["total"]


async def test_publishing_requires_approval_and_the_right_role(
    client: httpx.AsyncClient, admin_headers, editor_headers, author_headers
):
    created = await client.post(
        f"{API}/admin/articles",
        headers=author_headers,
        json={
            "title": "A test story about the Lagos tech corridor",
            "standfirst": "A short standfirst for the test story.",
            "category": "tech",
            "tags": ["Lagos", "Startups"],
            "body": [{"type": "p", "text": "The body of the test story."}],
            "readingTime": 3,
        },
    )
    assert created.status_code == 201, created.text
    article = created.json()
    assert article["status"] == "Draft"
    assert article["tags"] == ["Lagos", "Startups"]
    article_id = article["id"]

    # Authors cannot publish at all.
    forbidden = await client.post(f"{API}/admin/articles/{article_id}/publish", headers=author_headers)
    assert forbidden.status_code == 403

    # Editors cannot skip the approval gate either.
    too_early = await client.post(f"{API}/admin/articles/{article_id}/publish", headers=editor_headers)
    assert too_early.status_code == 409

    submitted = await client.post(
        f"{API}/admin/articles/{article_id}/submit-review", headers=author_headers
    )
    assert submitted.status_code == 200
    assert submitted.json()["status"] == "Pending Review"

    approved = await client.post(f"{API}/admin/articles/{article_id}/approve", headers=editor_headers)
    assert approved.status_code == 200
    assert approved.json()["status"] == "Approved"

    published = await client.post(f"{API}/admin/articles/{article_id}/publish", headers=editor_headers)
    assert published.status_code == 200
    assert published.json()["status"] == "Published"
    assert published.json()["publishedAt"]

    public = await client.get(f"{API}/articles/{article['slug']}")
    assert public.status_code == 200
    assert public.json()["title"] == "A test story about the Lagos tech corridor"

    audit = await client.get(f"{API}/admin/audit-log", headers=admin_headers)
    actions = [entry["action"] for entry in audit.json()["items"]]
    assert "article.publish" in actions


async def test_scheduling_rejects_past_dates(client: httpx.AsyncClient, editor_headers):
    created = await client.post(
        f"{API}/admin/articles",
        headers=editor_headers,
        json={"title": "Scheduling test article", "category": "news"},
    )
    article_id = created.json()["id"]
    await client.post(f"{API}/admin/articles/{article_id}/submit-review", headers=editor_headers)
    await client.post(f"{API}/admin/articles/{article_id}/approve", headers=editor_headers)

    past = await client.post(
        f"{API}/admin/articles/{article_id}/schedule",
        headers=editor_headers,
        json={"scheduledFor": "2020-01-01T09:00:00Z"},
    )
    assert past.status_code == 422

    future = await client.post(
        f"{API}/admin/articles/{article_id}/schedule",
        headers=editor_headers,
        json={"scheduledFor": "2030-01-01T09:00:00Z"},
    )
    assert future.status_code == 200
    assert future.json()["status"] == "Scheduled"

    unscheduled = await client.post(
        f"{API}/admin/articles/{article_id}/unschedule", headers=editor_headers
    )
    assert unscheduled.status_code == 200
    assert unscheduled.json()["status"] == "Approved"
    assert unscheduled.json()["scheduledFor"] is None

    again = await client.post(
        f"{API}/admin/articles/{article_id}/unschedule", headers=editor_headers
    )
    assert again.status_code == 409


async def test_article_validation_and_ownership(client: httpx.AsyncClient, editor_headers):
    short_title = await client.post(
        f"{API}/admin/articles", headers=editor_headers, json={"title": "No", "category": "news"}
    )
    assert short_title.status_code == 422

    bad_category = await client.post(
        f"{API}/admin/articles",
        headers=editor_headers,
        json={"title": "A valid title for validation", "category": "not-a-category"},
    )
    assert bad_category.status_code == 422

    unknown_article = await client.get(f"{API}/admin/articles/99999", headers=editor_headers)
    assert unknown_article.status_code == 404


async def test_delete_is_admin_only(client: httpx.AsyncClient, admin_headers, editor_headers):
    created = await client.post(
        f"{API}/admin/articles",
        headers=editor_headers,
        json={"title": "An article that will be deleted", "category": "news"},
    )
    article_id = created.json()["id"]

    denied = await client.delete(f"{API}/admin/articles/{article_id}", headers=editor_headers)
    assert denied.status_code == 403

    deleted = await client.delete(f"{API}/admin/articles/{article_id}", headers=admin_headers)
    assert deleted.status_code == 204
    assert (await client.get(f"{API}/admin/articles/{article_id}", headers=admin_headers)).status_code == 404


async def test_resource_manager_documents(client: httpx.AsyncClient, admin_headers):
    created = await client.post(
        f"{API}/admin/resources/documents",
        headers=admin_headers,
        json={
            "title": "Working with spreadsheets",
            "description": "A test workbook.",
            "format": "PDF",
            "sizeBytes": 2048,
            "pages": 4,
            "category": "business",
            "downloadable": True,
            "status": "Processing",
        },
    )
    assert created.status_code == 201, created.text
    document = created.json()
    assert document["status"] == "Processing"
    assert document["size"] == "2 KB"
    assert document["published"] == ""

    ready = await client.patch(
        f"{API}/admin/resources/documents/{document['id']}",
        headers=admin_headers,
        json={"status": "Ready"},
    )
    assert ready.status_code == 200
    assert ready.json()["published"]

    retry = await client.post(
        f"{API}/admin/resources/documents/{document['id']}/retry", headers=admin_headers
    )
    assert retry.status_code == 409  # only unfinished documents can be retried

    presign = await client.post(
        f"{API}/admin/resources/uploads/presign?filename=My%20Slide%20Deck.pptx",
        headers=admin_headers,
    )
    assert presign.status_code == 200
    assert presign.json()["key"].startswith("uploads/")
    assert presign.json()["key"].endswith(".pptx")


async def test_ad_placements_crud_and_slot_uniqueness(client: httpx.AsyncClient, admin_headers):
    duplicate = await client.post(
        f"{API}/admin/ads",
        headers=admin_headers,
        json={
            "name": "Duplicate leaderboard",
            "slotId": "home-leaderboard",
            "pageType": "home",
        },
    )
    assert duplicate.status_code == 409

    created = await client.post(
        f"{API}/admin/ads",
        headers=admin_headers,
        json={
            "name": "Search results unit",
            "slotId": "search-results-1",
            "pageType": "resource-list",
            "device": "all",
            "minHeight": 250,
        },
    )
    assert created.status_code == 201

    updated = await client.patch(
        f"{API}/admin/ads/{created.json()['id']}", headers=admin_headers, json={"enabled": False}
    )
    assert updated.status_code == 200
    assert updated.json()["enabled"] is False

    deleted = await client.delete(f"{API}/admin/ads/{created.json()['id']}", headers=admin_headers)
    assert deleted.status_code == 204


async def test_ai_desk_queues_tasks_and_masks_keys(client: httpx.AsyncClient, admin_headers):
    task = await client.post(
        f"{API}/admin/ai/tasks",
        headers=admin_headers,
        json={"kind": "draft", "prompt": {"topic": "Lagos transport"}},
    )
    assert task.status_code == 202
    assert task.json()["status"] == "queued"
    assert task.json()["prompt"]["topic"] == "Lagos transport"

    queued_task_id = task.json()["id"]
    retried = await client.post(f"{API}/admin/ai/tasks/{queued_task_id}/retry", headers=admin_headers)
    assert retried.status_code == 200

    settings = await client.patch(
        f"{API}/admin/ai/settings",
        headers=admin_headers,
        json={"temperature": 0.2, "apiKey": "sk-live-abcdef1234"},
    )
    assert settings.status_code == 200
    body = settings.json()
    assert body["temperature"] == 0.2
    assert body["apiKeyLast4"] == "1234"
    assert "sk-live-abcdef1234" not in settings.text
    assert body["usage"]["totalTasks"] >= 1

    trends = await client.get(f"{API}/admin/ai/trends", headers=admin_headers)
    assert trends.status_code == 200
    assert trends.json()["items"]


async def test_user_management_guards(client: httpx.AsyncClient, admin_headers):
    duplicate = await client.post(
        f"{API}/admin/users",
        headers=admin_headers,
        json={
            "name": "Another Admin",
            "email": "admin@forum24.example",
            "role": "admin",
            "password": "long-enough-password",
        },
    )
    assert duplicate.status_code == 409

    created = await client.post(
        f"{API}/admin/users",
        headers=admin_headers,
        json={
            "name": "Demo Reviewer",
            "email": "reviewer2@forum24.example",
            "role": "reviewer",
            "title": "Standards",
            "password": "long-enough-password",
        },
    )
    assert created.status_code == 201
    assert created.json()["role"] == "reviewer"

    me = await client.get(f"{API}/auth/me", headers=admin_headers)
    self_deactivate = await client.patch(
        f"{API}/admin/users/{me.json()['id']}", headers=admin_headers, json={"active": False}
    )
    assert self_deactivate.status_code == 409


async def test_moderation_approves_a_comment(client: httpx.AsyncClient, admin_headers):
    pending = await client.get(f"{API}/admin/comments", headers=admin_headers, params={"status": "Pending"})
    assert pending.status_code == 200
    assert pending.json()["items"]
    comment = pending.json()["items"][0]

    approved = await client.patch(
        f"{API}/admin/comments/{comment['id']}", headers=admin_headers, json={"status": "Approved"}
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "Approved"


async def test_dashboard_and_analytics(client: httpx.AsyncClient, editor_headers):
    stats = await client.get(f"{API}/admin/stats", headers=editor_headers)
    assert stats.status_code == 200
    body = stats.json()
    assert len(body["cards"]) == 6
    assert body["aiTaskHealth"]["failed"] >= 1

    analytics = await client.get(f"{API}/admin/analytics", headers=editor_headers)
    assert analytics.status_code == 200
    assert len(analytics.json()["daily"]) == 14
    assert analytics.json()["totals"]["views"] > 0
