"""Tests for /api/v1/progress/* endpoints (Phase A: XP, streaks, badges, leaderboard)."""
import uuid
import pytest
import pytest_asyncio
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.progress import Badge, XP_FIRST_COMPLETE, XP_REREAD


# ── Badge fixture ──────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def seeded_badges(db: AsyncSession):
    """Minimal badge set needed for progress tests — mirrors the migration seed."""
    badges = [
        Badge(
            id=uuid.UUID("10000000-0000-0000-0000-000000000001"),
            slug="first_step", name="First Step",
            description="Complete your very first lesson.",
            criteria_type="lessons_completed", criteria_value=1, xp_bonus=5,
            created_at=datetime.now(timezone.utc),
        ),
        Badge(
            id=uuid.UUID("10000000-0000-0000-0000-000000000002"),
            slug="dedicated", name="Dedicated",
            description="Complete 10 lessons.",
            criteria_type="lessons_completed", criteria_value=10, xp_bonus=20,
            created_at=datetime.now(timezone.utc),
        ),
        Badge(
            id=uuid.UUID("10000000-0000-0000-0000-000000000005"),
            slug="week_warrior", name="Week Warrior",
            description="Study every day for 7 days in a row.",
            criteria_type="streak_days", criteria_value=7, xp_bonus=25,
            created_at=datetime.now(timezone.utc),
        ),
        Badge(
            id=uuid.UUID("10000000-0000-0000-0000-000000000009"),
            slug="subject_master", name="Subject Master",
            description="Achieve Master tier in any subject.",
            criteria_type="subjects_mastered", criteria_value=1, xp_bonus=50,
            created_at=datetime.now(timezone.utc),
        ),
        Badge(
            id=uuid.UUID("10000000-0000-0000-0000-000000000011"),
            slug="bingwa", name="Bingwa",
            description="Reach level 5.",
            criteria_type="level_reached", criteria_value=5, xp_bonus=50,
            created_at=datetime.now(timezone.utc),
        ),
    ]
    for b in badges:
        db.add(b)
    await db.commit()
    return badges


# ── Helpers ────────────────────────────────────────────────────────────────────

async def complete_lesson(
    client: AsyncClient, headers: dict, lesson_id: str, time: int = 60
) -> dict:
    resp = await client.post(
        "/api/v1/progress/complete",
        json={"lesson_id": lesson_id, "time_spent_seconds": time},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


# ── Mark complete ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_mark_complete_first_time(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    lesson_id = str(seeded_content["lesson1"].id)
    data = await complete_lesson(client, auth_headers, lesson_id)

    assert data["lesson_id"] == lesson_id
    # XP_FIRST_COMPLETE (10) + streak_bonus min(1*2, 20) = 2
    assert data["xp_earned"] == XP_FIRST_COMPLETE + 2
    # total_xp includes any badge XP bonuses awarded in the same call
    assert data["total_xp"] >= data["xp_earned"]
    assert data["level"] == 1
    assert data["level_name"] == "Mwanzo"
    assert data["current_streak"] == 1
    assert data["next_level_xp"] == 50  # Mwanafunzi threshold


@pytest.mark.asyncio
async def test_mark_complete_first_step_badge(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    """First lesson completion should award the 'first_step' badge."""
    lesson_id = str(seeded_content["lesson1"].id)
    data = await complete_lesson(client, auth_headers, lesson_id)

    badge_slugs = [b["slug"] for b in data["newly_earned_badges"]]
    assert "first_step" in badge_slugs
    # Badge XP bonus (5) should be included in total
    assert data["total_xp"] == XP_FIRST_COMPLETE + 2 + 5


@pytest.mark.asyncio
async def test_mark_complete_idempotent_reread(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    """Second call on a completed lesson awards only re-read XP (2), no badge repeat."""
    lesson_id = str(seeded_content["lesson1"].id)
    first = await complete_lesson(client, auth_headers, lesson_id)
    second = await complete_lesson(client, auth_headers, lesson_id)

    assert second["xp_earned"] == XP_REREAD
    assert second["total_xp"] == first["total_xp"] + XP_REREAD
    assert second["newly_earned_badges"] == []


@pytest.mark.asyncio
async def test_mark_complete_invalid_lesson(
    client: AsyncClient, auth_headers, seeded_badges
):
    resp = await client.post(
        "/api/v1/progress/complete",
        json={"lesson_id": str(uuid.uuid4()), "time_spent_seconds": 0},
        headers=auth_headers,
    )
    assert resp.status_code in (404, 422, 500)


@pytest.mark.asyncio
async def test_mark_complete_unauthenticated(client: AsyncClient, seeded_content):
    resp = await client.post(
        "/api/v1/progress/complete",
        json={"lesson_id": str(seeded_content["lesson1"].id), "time_spent_seconds": 0},
    )
    assert resp.status_code in (401, 403)


# ── Subject mastery ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_subject_mastery_bonus(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    """Completing ALL lessons in a subject awards mastery XP + subject_master badge."""
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    data = await complete_lesson(client, auth_headers, str(seeded_content["lesson2"].id))

    badge_slugs = [b["slug"] for b in data["newly_earned_badges"]]
    assert "subject_master" in badge_slugs
    # XP for lesson2: 10 base + streak_bonus(1*2=2) + 50 mastery = 62
    # Plus subject_master badge XP bonus = 50
    # Plus any other badges earned in this call
    assert data["xp_earned"] >= 62  # at minimum mastery XP


# ── GET /progress/me ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_my_stats_empty(client: AsyncClient, auth_headers):
    """New user has zero XP and level 1."""
    resp = await client.get("/api/v1/progress/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_xp"] == 0
    assert data["level"] == 1
    assert data["level_name"] == "Mwanzo"
    assert data["current_streak"] == 0
    assert data["lessons_completed"] == 0


@pytest.mark.asyncio
async def test_get_my_stats_after_completion(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    resp = await client.get("/api/v1/progress/me", headers=auth_headers)
    data = resp.json()
    assert data["total_xp"] > 0
    assert data["lessons_completed"] == 1
    assert data["current_streak"] == 1


# ── GET /progress/subjects ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_subject_progress_empty(
    client: AsyncClient, auth_headers, seeded_content
):
    resp = await client.get("/api/v1/progress/subjects", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    subj = next(d for d in data if d["subject_id"] == str(seeded_content["subject"].id))
    assert subj["total_lessons"] == 2
    assert subj["completed_lessons"] == 0
    assert subj["percent_complete"] == 0.0
    assert subj["tier"] == "Beginner"


@pytest.mark.asyncio
async def test_get_subject_progress_partial(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    resp = await client.get("/api/v1/progress/subjects", headers=auth_headers)
    subj = next(
        d for d in resp.json()
        if d["subject_id"] == str(seeded_content["subject"].id)
    )
    assert subj["completed_lessons"] == 1
    assert subj["percent_complete"] == 50.0
    assert subj["tier"] == "Learner"


@pytest.mark.asyncio
async def test_get_subject_progress_full(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    await complete_lesson(client, auth_headers, str(seeded_content["lesson2"].id))
    resp = await client.get("/api/v1/progress/subjects", headers=auth_headers)
    subj = next(
        d for d in resp.json()
        if d["subject_id"] == str(seeded_content["subject"].id)
    )
    assert subj["completed_lessons"] == 2
    assert subj["percent_complete"] == 100.0
    assert subj["tier"] == "Master"


# ── GET /progress/calendar ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_streak_calendar_length(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/progress/calendar", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 30


@pytest.mark.asyncio
async def test_streak_calendar_today_marked(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    resp = await client.get("/api/v1/progress/calendar", headers=auth_headers)
    # The last entry should be today and marked completed
    last = resp.json()[-1]
    assert last["completed"] is True


# ── GET /progress/badges ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_my_badges_empty(client: AsyncClient, auth_headers, seeded_badges):
    resp = await client.get("/api/v1/progress/badges", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_get_my_badges_after_completion(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    resp = await client.get("/api/v1/progress/badges", headers=auth_headers)
    data = resp.json()
    assert len(data) >= 1
    slugs = [entry["badge"]["slug"] for entry in data]
    assert "first_step" in slugs
    # All entries have earned_at
    for entry in data:
        assert "earned_at" in entry
        assert "badge" in entry
        assert "name" in entry["badge"]


# ── GET /progress/leaderboard ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_leaderboard_default_grade_category(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    """Leaderboard defaults to the caller's grade_category."""
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    resp = await client.get("/api/v1/progress/leaderboard", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert len(data) <= 10
    top = data[0]
    assert "rank" in top
    assert "total_xp" in top
    assert "display_name" in top
    assert top["rank"] == 1


@pytest.mark.asyncio
async def test_leaderboard_ranks_by_xp(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    await complete_lesson(client, auth_headers, str(seeded_content["lesson2"].id))
    resp = await client.get("/api/v1/progress/leaderboard", headers=auth_headers)
    entries = resp.json()
    xp_values = [e["total_xp"] for e in entries]
    assert xp_values == sorted(xp_values, reverse=True)


@pytest.mark.asyncio
async def test_leaderboard_all_grades(
    client: AsyncClient, auth_headers, seeded_content, seeded_badges
):
    await complete_lesson(client, auth_headers, str(seeded_content["lesson1"].id))
    resp = await client.get(
        "/api/v1/progress/leaderboard?grade_category=all",
        headers=auth_headers,
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_leaderboard_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/progress/leaderboard")
    assert resp.status_code in (401, 403)
