"""
Seed demo/test users for development.
Run: python seed_demo_users.py
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import hash_password

DEMO_USERS = [
    {
        "first_name": "Alice",
        "last_name": "Primary",
        "email": "alice@demo.com",
        "password": "Demo1234!",
        "grade": "grade-5",
        "grade_category": "primary",
        "grade_tier": "Primary CBC",
        "subscription_status": "trial",
    },
    {
        "first_name": "Bob",
        "last_name": "Junior",
        "email": "bob@demo.com",
        "password": "Demo1234!",
        "grade": "grade-8",
        "grade_category": "junior",
        "grade_tier": "Junior Secondary",
        "subscription_status": "active",
    },
    {
        "first_name": "Carol",
        "last_name": "Senior",
        "email": "carol@demo.com",
        "password": "Demo1234!",
        "grade": "grade-11",
        "grade_category": "senior",
        "grade_tier": "Senior Secondary",
        "subscription_status": "active",
    },
    {
        "first_name": "Dan",
        "last_name": "Expired",
        "email": "dan@demo.com",
        "password": "Demo1234!",
        "grade": "grade-7",
        "grade_category": "junior",
        "grade_tier": "Junior Secondary",
        "subscription_status": "expired",
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        created = 0
        now = datetime.now(timezone.utc)
        for data in DEMO_USERS:
            existing = await db.execute(select(User).where(User.email == data["email"]))
            if existing.scalar_one_or_none():
                print(f"  ⏭  Skipped (exists): {data['email']}")
                continue

            user = User(
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                password_hash=hash_password(data["password"]),
                grade=data["grade"],
                grade_category=data["grade_category"],
                grade_tier=data["grade_tier"],
                subscription_status=data["subscription_status"],
                trial_start_date=now,
                trial_end_date=now + timedelta(days=7),
                is_active=True,
                email_verified=True,
            )
            db.add(user)
            created += 1
            print(f"  ✅ Created: {data['email']} ({data['grade_category']}, {data['subscription_status']})")

        await db.commit()
        print(f"\n🎉 Done. {created} demo users created.")
        print("\nLogin credentials (all use password: Demo1234!)")
        print("  alice@demo.com  — Primary  / trial")
        print("  bob@demo.com    — Junior   / active")
        print("  carol@demo.com  — Senior   / active")
        print("  dan@demo.com    — Junior   / expired")


asyncio.run(seed())
