from __future__ import annotations

import re

import httpx

API = "/api/v1"


async def test_health(client: httpx.AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


async def test_bootstrap_matches_the_public_shell(client: httpx.AsyncClient):
    response = await client.get(f"{API}/bootstrap")
    assert response.status_code == 200
    data = response.json()

    assert len(data["categories"]) >= 10
    assert len(data["articles"]) == 8
    assert len(data["documents"]) == 6
    assert len(data["videos"]) == 6

    first = data["articles"][0]
    assert {"slug", "title", "standfirst", "category", "author", "date", "body"} <= set(first)
    assert first["body"][0]["type"] == "p"
    assert first["body"][1]["type"] == "h2"

    document = data["documents"][0]
    assert re.fullmatch(r"\d+(\.\d+)? (MB|KB)", document["size"])


async def test_article_detail_and_drafts_stay_private(client: httpx.AsyncClient):
    slug = "nigeria-ai-startups-african-infrastructure"
    response = await client.get(f"{API}/articles/{slug}")
    assert response.status_code == 200
    article = response.json()
    assert article["slug"] == slug
    assert article["reviewedBy"] == "Emeka Nwosu"
    assert len(article["body"]) >= 8

    draft = await client.get(f"{API}/articles/what-the-draft-ai-policy-changes")
    assert draft.status_code == 404

    missing = await client.get(f"{API}/articles/does-not-exist")
    assert missing.status_code == 404


async def test_article_list_filters_and_pagination(client: httpx.AsyncClient):
    page = await client.get(f"{API}/articles", params={"pageSize": 3, "page": 2})
    assert page.status_code == 200
    body = page.json()
    assert body["total"] == 8
    assert body["page"] == 2
    assert body["pageSize"] == 3
    assert len(body["items"]) == 3

    tech = await client.get(f"{API}/articles", params={"category": "tech"})
    assert tech.status_code == 200
    assert {item["category"] for item in tech.json()["items"]} == {"Technology & AI"}

    trending = await client.get(f"{API}/articles", params={"trending": True})
    assert all(item["trending"] for item in trending.json()["items"])

    by_views = await client.get(f"{API}/articles", params={"sort": "views"})
    views = [item["views"] for item in by_views.json()["items"]]
    assert views == sorted(views, reverse=True)

    bad_sort = await client.get(f"{API}/articles", params={"sort": "sideways"})
    assert bad_sort.status_code == 422


async def test_search_across_content_types(client: httpx.AsyncClient):
    response = await client.get(f"{API}/search", params={"q": "python"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("Python" in doc["title"] for doc in data["documents"])

    too_short = await client.get(f"{API}/search", params={"q": "a"})
    assert too_short.status_code == 422


async def test_documents_and_real_pdf_download(client: httpx.AsyncClient):
    listing = await client.get(f"{API}/documents")
    assert listing.status_code == 200
    assert listing.json()["total"] == 6

    slug = "beginners-guide-python"
    before = (await client.get(f"{API}/documents/{slug}")).json()["downloads"]

    download = await client.get(f"{API}/documents/{slug}/download")
    assert download.status_code == 200
    assert download.headers["content-type"] == "application/pdf"
    assert 'filename="forum24-beginners-guide-python.pdf"' in download.headers["content-disposition"]
    assert download.headers["cache-control"] == "no-store"
    assert download.content.startswith(b"%PDF-1.4")
    assert download.content.endswith(b"%%EOF\n")

    after = (await client.get(f"{API}/documents/{slug}")).json()["downloads"]
    assert after == before + 1


async def test_view_only_documents_never_download(client: httpx.AsyncClient):
    response = await client.get(f"{API}/documents/cv-writing-for-graduates/download")
    assert response.status_code == 403
    assert "view only" in response.json()["detail"].lower()


async def test_videos_and_blocked_embed_fallback(client: httpx.AsyncClient):
    response = await client.get(f"{API}/videos/afrobeats-production-breakdown")
    assert response.status_code == 200
    video = response.json()
    assert video["embeddable"] is False
    assert video["provider"] == "Vimeo"
    assert video["duration"] == "16:05"
    assert len(video["chapters"]) == 3

    filtered = await client.get(f"{API}/videos", params={"provider": "YouTube"})
    assert all(item["provider"] == "YouTube" for item in filtered.json()["items"])


async def test_ads_are_placement_metadata_only(client: httpx.AsyncClient):
    response = await client.get(f"{API}/ads", params={"pageType": "document", "device": "mobile"})
    assert response.status_code == 200
    placements = response.json()
    assert len(placements) == 1
    assert placements[0]["slotId"] == "document-below-preview"
    assert placements[0]["consentRequired"] is True
    assert "creative" not in placements[0]


async def test_author_archive(client: httpx.AsyncClient):
    response = await client.get(f"{API}/authors/adaeze-okonkwo")
    assert response.status_code == 200
    data = response.json()
    assert data["author"]["name"] == "Adaeze Okonkwo"
    assert all(item["author"] == "Adaeze Okonkwo" for item in data["articles"])

    missing = await client.get(f"{API}/authors/nobody-here")
    assert missing.status_code == 404


async def test_newsletter_is_idempotent_and_consent_aware(client: httpx.AsyncClient):
    payload = {"email": "New.Reader@Example.com", "consent": True}
    first = await client.post(f"{API}/newsletter", json=payload)
    assert first.status_code == 201
    assert first.json() == {"email": "new.reader@example.com", "status": "subscribed"}

    second = await client.post(f"{API}/newsletter", json=payload)
    assert second.status_code == 201
    assert second.json()["status"] == "already-subscribed"

    invalid = await client.post(f"{API}/newsletter", json={"email": "not-an-email"})
    assert invalid.status_code == 422

    no_consent = await client.post(
        f"{API}/newsletter", json={"email": "reader@example.com", "consent": False}
    )
    assert no_consent.status_code == 422


async def test_contact_honeypot_and_validation(client: httpx.AsyncClient):
    valid = {
        "name": "Ada Reader",
        "email": "ada@example.com",
        "subject": "A correction",
        "message": "The second paragraph gives the wrong date for the policy.",
    }
    created = await client.post(f"{API}/contact", json=valid)
    assert created.status_code == 201
    assert re.fullmatch(r"F24-[0-9A-F]{6}", created.json()["reference"])

    trapped = await client.post(f"{API}/contact", json={**valid, "company": "spam co"})
    assert trapped.status_code == 201
    assert trapped.json()["received"] is True

    bad = await client.post(f"{API}/contact", json={**valid, "message": "short"})
    assert bad.status_code == 422


async def test_comments_enter_moderation_before_appearing(client: httpx.AsyncClient):
    slug = "nigeria-ai-startups-african-infrastructure"
    before = await client.get(f"{API}/articles/{slug}/comments")
    assert before.status_code == 200
    assert all(item["status"] == "Approved" for item in before.json())

    created = await client.post(
        f"{API}/articles/{slug}/comments",
        json={"authorName": "New Commenter", "email": "new@example.com", "body": "Worth reading twice."},
    )
    assert created.status_code == 201
    assert created.json()["status"] == "Pending"

    after = await client.get(f"{API}/articles/{slug}/comments")
    assert all(item["authorName"] != "New Commenter" for item in after.json())


async def test_unknown_public_paths_are_404(client: httpx.AsyncClient):
    assert (await client.get(f"{API}/documents/nope")).status_code == 404
    assert (await client.get(f"{API}/videos/nope")).status_code == 404
