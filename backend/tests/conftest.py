"""
Test configuration and shared fixtures.
Uses NullPool to avoid asyncpg event-loop binding across tests.
"""
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from sqlalchemy import text

from app.main import app
from app.database import Base, get_db

TEST_DB_URL = "postgresql+asyncpg://postgres:tusome2026@127.0.0.1:5432/tusome_test"

# NullPool: every query gets a fresh connection — no event-loop binding issues
test_engine = create_async_engine(TEST_DB_URL, echo=False, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


# ── One-time schema setup (runs synchronously before pytest collects) ─────────

async def _init_schema():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(_init_schema())

# Disable rate limiting — auth.py has its own limiter instance separate from main.py
app.state.limiter.enabled = False
import app.api.v1.auth as _auth_module
_auth_module.limiter.enabled = False


# ── Per-test isolation: truncate all tables ───────────────────────────────────

@pytest_asyncio.fixture(autouse=True)
async def clean_tables():
    yield
    async with TestSessionLocal() as session:
        tables = [t.name for t in reversed(Base.metadata.sorted_tables)]
        for table in tables:
            await session.execute(text(f'TRUNCATE TABLE "{table}" RESTART IDENTITY CASCADE'))
        await session.commit()


# ── Core fixtures ─────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def db():
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db):
    async def override_db():
        yield db
    app.dependency_overrides[get_db] = override_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ── Constants ─────────────────────────────────────────────────────────────────

STUDENT_EMAIL = "testuser@tusome.co.ke"
STUDENT_PASSWORD = "SecurePass123!"
ADMIN_EMAIL = "testadmin@tusome.co.ke"
ADMIN_PASSWORD = "AdminPass123!"


# ── Student fixtures ──────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def registered_user(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "first_name": "Test",
        "last_name": "Student",
        "email": STUDENT_EMAIL,
        "grade_level": "grade-8",
        "password": STUDENT_PASSWORD,
        "confirm_password": STUDENT_PASSWORD,
        "agree_terms": True,
    })
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest_asyncio.fixture
async def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['access_token']}"}


# ── Content fixtures ──────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def seeded_content(db: AsyncSession):
    import uuid
    from datetime import datetime, timezone
    from app.models.content import Subject, Lesson

    subject = Subject(
        id=uuid.uuid4(),
        name="Mathematics",
        slug="test-mathematics",
        grade_category="junior",
        description="Test maths subject",
        icon="calculator",
        color="#3B82F6",
        order=99,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    db.add(subject)
    await db.flush()

    lesson1 = Lesson(
        id=uuid.uuid4(),
        subject_id=subject.id,
        title="Intro to Algebra",
        slug="test-intro-algebra",
        description="Basic algebra",
        content="# Algebra\nLearn algebra basics.",
        order=1,
        duration_minutes=30,
        is_free_preview=True,
        is_published=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    lesson2 = Lesson(
        id=uuid.uuid4(),
        subject_id=subject.id,
        title="Linear Equations",
        slug="test-linear-equations",
        description="Solving linear equations",
        content="# Linear Equations\nSolve for x.",
        order=2,
        duration_minutes=45,
        is_free_preview=False,
        is_published=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(lesson1)
    db.add(lesson2)
    await db.commit()
    return {"subject": subject, "lesson1": lesson1, "lesson2": lesson2}


# ── Admin fixtures ────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def seeded_admin(db: AsyncSession):
    import uuid
    from datetime import datetime, timezone
    from app.models.admin import AdminUser
    from app.core.security import hash_password

    admin = AdminUser(
        id=uuid.uuid4(),
        name="Test Admin",
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        role="super_admin",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(admin)
    await db.commit()
    return admin


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient, seeded_admin):
    resp = await client.post("/api/v1/admin/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    })
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
