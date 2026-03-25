"""Tests for /api/v1/auth/* endpoints."""
import pytest
from httpx import AsyncClient
from tests.conftest import STUDENT_EMAIL, STUDENT_PASSWORD


# ── Registration ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "first_name": "Test",
        "last_name": "Student",
        "email": STUDENT_EMAIL,
        "grade_level": "grade-8",
        "password": STUDENT_PASSWORD,
        "confirm_password": STUDENT_PASSWORD,
        "agree_terms": True,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == STUDENT_EMAIL
    assert data["user"]["grade_category"] == "junior"
    assert data["user"]["subscription_status"] == "trial"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/auth/register", json={
        "first_name": "Another",
        "last_name": "User",
        "email": STUDENT_EMAIL,
        "grade_level": "grade-7",
        "password": STUDENT_PASSWORD,
        "confirm_password": STUDENT_PASSWORD,
        "agree_terms": True,
    })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_terms_not_agreed(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "first_name": "No",
        "last_name": "Terms",
        "email": "noterms@test.com",
        "grade_level": "grade-7",
        "password": STUDENT_PASSWORD,
        "confirm_password": STUDENT_PASSWORD,
        "agree_terms": False,
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_register_invalid_grade(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "first_name": "Bad",
        "last_name": "Grade",
        "email": "badgrade@test.com",
        "grade_level": "grade-99",
        "password": STUDENT_PASSWORD,
        "confirm_password": STUDENT_PASSWORD,
        "agree_terms": True,
    })
    assert resp.status_code == 400


# ── Login ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/auth/login", json={
        "email": STUDENT_EMAIL,
        "password": STUDENT_PASSWORD,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/auth/login", json={
        "email": STUDENT_EMAIL,
        "password": "WrongPassword!",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email(client: AsyncClient):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "ghost@nobody.com",
        "password": STUDENT_PASSWORD,
    })
    assert resp.status_code == 401


# ── Token refresh ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": registered_user["refresh_token"]
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_refresh_invalid_token(client: AsyncClient):
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": "garbage.token"})
    assert resp.status_code == 401


# ── Profile ───────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_profile(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == STUDENT_EMAIL
    assert "subscription_status" in data


@pytest.mark.asyncio
async def test_get_profile_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code in (401, 403)  # FastAPI HTTPBearer returns 403 for missing header


# ── Forgot / reset password ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_forgot_password_unknown_email(client: AsyncClient):
    # Must return 200 even for unknown email (prevent enumeration)
    resp = await client.post("/api/v1/auth/forgot-password", json={"email": "nobody@nowhere.com"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_forgot_password_known_email(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/auth/forgot-password", json={"email": STUDENT_EMAIL})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_reset_password_invalid_token(client: AsyncClient):
    resp = await client.post("/api/v1/auth/reset-password", json={
        "token": "invalidtoken123",
        "new_password": "NewPass456!",
    })
    assert resp.status_code == 400


# ── User lookup ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_user_lookup_known(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/auth/user-lookup", json={"email": STUDENT_EMAIL})
    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["grade_category"] == "junior"


@pytest.mark.asyncio
async def test_user_lookup_unknown(client: AsyncClient):
    resp = await client.post("/api/v1/auth/user-lookup", json={"email": "nobody@test.com"})
    assert resp.status_code == 200
    assert resp.json()["user"] is None
