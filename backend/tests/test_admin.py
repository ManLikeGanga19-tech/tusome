"""Tests for /api/v1/admin/* endpoints."""
import uuid
import pytest
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD, STUDENT_EMAIL


# ── Admin auth ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_login_success(client: AsyncClient, seeded_admin):
    resp = await client.post("/api/v1/admin/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["admin"]["role"] == "super_admin"
    assert data["admin"]["email"] == ADMIN_EMAIL


@pytest.mark.asyncio
async def test_admin_login_wrong_password(client: AsyncClient, seeded_admin):
    resp = await client.post("/api/v1/admin/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": "WrongPass!",
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_admin_me(client: AsyncClient, admin_headers):
    resp = await client.get("/api/v1/admin/auth/me", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == ADMIN_EMAIL


@pytest.mark.asyncio
async def test_admin_token_rejected_on_student_endpoint(client: AsyncClient, admin_headers):
    """Admin JWT must NOT work on student endpoints."""
    resp = await client.get("/api/v1/users/me", headers=admin_headers)
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_student_token_rejected_on_admin_endpoint(client: AsyncClient, auth_headers):
    """Student JWT must NOT work on admin endpoints."""
    resp = await client.get("/api/v1/admin/auth/me", headers=auth_headers)
    assert resp.status_code == 401


# ── Dashboard ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_dashboard_stats(client: AsyncClient, admin_headers):
    resp = await client.get("/api/v1/admin/dashboard/stats", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    for key in ("total_users", "active_subscribers", "total_lessons",
                "total_subjects", "revenue_this_month_ksh", "new_users_this_week"):
        assert key in data


@pytest.mark.asyncio
async def test_dashboard_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/admin/dashboard/stats")
    assert resp.status_code in (401, 403)


# ── User management ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_users(client: AsyncClient, admin_headers, registered_user):
    resp = await client.get("/api/v1/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data and "total" in data
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_list_users_search(client: AsyncClient, admin_headers, registered_user):
    resp = await client.get("/api/v1/admin/users?search=tusome", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert any(STUDENT_EMAIL in u["email"] for u in data["results"])


@pytest.mark.asyncio
async def test_override_subscription_to_active(client: AsyncClient, admin_headers, registered_user):
    user_id = registered_user["user"]["id"]
    resp = await client.patch(
        f"/api/v1/admin/users/{user_id}/subscription",
        json={"subscription_status": "active"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["subscription_status"] == "active"


@pytest.mark.asyncio
async def test_override_subscription_invalid_value(client: AsyncClient, admin_headers, registered_user):
    user_id = registered_user["user"]["id"]
    resp = await client.patch(
        f"/api/v1/admin/users/{user_id}/subscription",
        json={"subscription_status": "vip_gold"},
        headers=admin_headers,
    )
    assert resp.status_code == 422


# ── Content management ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_list_subjects(client: AsyncClient, admin_headers, seeded_content):
    resp = await client.get("/api/v1/admin/content/subjects", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and len(data) >= 1


@pytest.mark.asyncio
async def test_admin_list_lessons(client: AsyncClient, admin_headers, seeded_content):
    slug = seeded_content["subject"].slug
    resp = await client.get(f"/api/v1/admin/content/subjects/{slug}/lessons", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_toggle_lesson_publish(client: AsyncClient, admin_headers, seeded_content):
    lesson_id = str(seeded_content["lesson1"].id)
    # Unpublish
    resp = await client.patch(
        f"/api/v1/admin/content/lessons/{lesson_id}/publish",
        json={"is_published": False},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["is_published"] is False
    # Re-publish
    resp = await client.patch(
        f"/api/v1/admin/content/lessons/{lesson_id}/publish",
        json={"is_published": True},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["is_published"] is True


@pytest.mark.asyncio
async def test_toggle_subject_active(client: AsyncClient, admin_headers, seeded_content):
    subject_id = str(seeded_content["subject"].id)
    resp = await client.patch(
        f"/api/v1/admin/content/subjects/{subject_id}/active",
        json={"is_active": False},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False


# ── Admin CRUD ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_admins(client: AsyncClient, admin_headers):
    resp = await client.get("/api/v1/admin/admins", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(a["email"] == ADMIN_EMAIL for a in data)


@pytest.mark.asyncio
async def test_create_content_editor(client: AsyncClient, admin_headers):
    resp = await client.post("/api/v1/admin/admins", json={
        "name": "Content Editor",
        "email": "editor@tusome.co.ke",
        "password": "EditorPass123!",
        "role": "content_editor",
    }, headers=admin_headers)
    assert resp.status_code == 201
    assert resp.json()["role"] == "content_editor"


@pytest.mark.asyncio
async def test_create_admin_duplicate_email(client: AsyncClient, admin_headers):
    payload = {
        "name": "Dup",
        "email": "dup@tusome.co.ke",
        "password": "DupPass123!",
        "role": "support_agent",
    }
    await client.post("/api/v1/admin/admins", json=payload, headers=admin_headers)
    resp = await client.post("/api/v1/admin/admins", json=payload, headers=admin_headers)
    assert resp.status_code == 400


# ── Audit log ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_audit_log_populated(client: AsyncClient, admin_headers, seeded_admin):
    # Login creates an audit entry
    await client.post("/api/v1/admin/auth/login", json={
        "email": ADMIN_EMAIL, "password": ADMIN_PASSWORD
    })
    resp = await client.get("/api/v1/admin/audit", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and len(data) >= 1
    assert "action" in data[0]
    assert "admin_name" in data[0]


# ── RBAC ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_content_editor_cannot_list_admins(client: AsyncClient, db: AsyncSession):
    from app.models.admin import AdminUser
    from app.core.security import hash_password

    editor = AdminUser(
        id=uuid.uuid4(),
        name="Editor",
        email="editor_rbac@tusome.co.ke",
        password_hash=hash_password("EditorPass123!"),
        role="content_editor",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(editor)
    await db.commit()

    login = await client.post("/api/v1/admin/auth/login", json={
        "email": "editor_rbac@tusome.co.ke",
        "password": "EditorPass123!",
    })
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    resp = await client.get("/api/v1/admin/admins", headers=headers)
    assert resp.status_code == 403
