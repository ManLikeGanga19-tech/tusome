"""Tests for /api/v1/content/* endpoints."""
import uuid
import pytest
from httpx import AsyncClient


# ── Subjects ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_subjects_authenticated(client: AsyncClient, auth_headers, seeded_content):
    resp = await client.get("/api/v1/content/subjects", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and len(data) >= 1
    s = data[0]
    assert all(k in s for k in ("id", "name", "slug", "grade_category"))


@pytest.mark.asyncio
async def test_list_subjects_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/content/subjects")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_subjects_filtered_by_grade(client: AsyncClient, auth_headers, seeded_content):
    resp = await client.get("/api/v1/content/subjects?grade_category=junior", headers=auth_headers)
    assert resp.status_code == 200
    for subject in resp.json():
        assert subject["grade_category"] == "junior"


# ── Lessons ───────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_lessons_for_subject(client: AsyncClient, auth_headers, seeded_content):
    slug = seeded_content["subject"].slug
    resp = await client.get(f"/api/v1/content/subjects/{slug}/lessons", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and len(data) == 2


@pytest.mark.asyncio
async def test_list_lessons_unknown_subject(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/content/subjects/no-such-subject/lessons", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_lesson_detail_free_preview(client: AsyncClient, auth_headers, seeded_content):
    lesson_id = str(seeded_content["lesson1"].id)
    resp = await client.get(f"/api/v1/content/lessons/{lesson_id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Intro to Algebra"
    assert "content" in data


@pytest.mark.asyncio
async def test_get_lesson_detail_paid_lesson_trial_user(client: AsyncClient, auth_headers, seeded_content):
    # Trial users can access paid lessons during trial period
    lesson_id = str(seeded_content["lesson2"].id)
    resp = await client.get(f"/api/v1/content/lessons/{lesson_id}", headers=auth_headers)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_lesson_detail_invalid_id(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/content/lessons/not-a-uuid", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_lesson_detail_unknown_uuid(client: AsyncClient, auth_headers):
    resp = await client.get(f"/api/v1/content/lessons/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_search_content(client: AsyncClient, auth_headers, seeded_content):
    resp = await client.get("/api/v1/content/search?q=algebra", headers=auth_headers)
    assert resp.status_code == 200
