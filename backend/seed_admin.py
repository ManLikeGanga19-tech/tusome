"""
Create the initial super_admin account.
Run once after first deployment:
    python seed_admin.py

Set env vars or pass via prompt:
    ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.admin import AdminUser
from app.core.security import hash_password


async def seed():
    email = os.getenv("ADMIN_EMAIL") or input("Super admin email: ").strip()
    name = os.getenv("ADMIN_NAME") or input("Super admin name: ").strip()
    password = os.getenv("ADMIN_PASSWORD") or input("Super admin password (min 8 chars): ").strip()

    if len(password) < 8:
        print("❌ Password must be at least 8 characters.")
        return

    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(AdminUser).where(AdminUser.email == email.lower()))
        if existing.scalar_one_or_none():
            print(f"⚠️  Admin with email '{email}' already exists. Skipping.")
            return

        admin = AdminUser(
            name=name,
            email=email.lower().strip(),
            password_hash=hash_password(password),
            role="super_admin",
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)

    print(f"\n✅ Super admin created!")
    print(f"   Name:  {admin.name}")
    print(f"   Email: {admin.email}")
    print(f"   Role:  {admin.role}")
    print(f"   ID:    {admin.id}")


if __name__ == "__main__":
    asyncio.run(seed())
