# Tusome — CBC E-Learning Platform

> **Status:** Active development. No PRs accepted without prior written approval from the project owner.
> **Plagiarism notice:** This project and all its code are the original work of the project owner. Unauthorised copying, redistribution, or derivative works are strictly prohibited.

---

## What is Tusome?

Tusome is a subscription-based e-learning SaaS platform built for Kenyan students following the Competency-Based Curriculum (CBC) — Grades 4–12. It delivers structured lesson content for Primary, Junior Secondary, and Senior Secondary tiers, with integrated M-Pesa payments and a full admin panel.

---

## Architecture

```
tusome/                         ← Turborepo monorepo root
├── apps/
│   ├── web/                    ← Student-facing Next.js app  (port 3000)
│   └── admin/                  ← Admin panel Next.js app     (port 3001)
├── packages/
│   ├── ui/                     ← Shared component utilities (cn, etc.)
│   ├── api-client/             ← Shared TypeScript types
│   └── config/                 ← Shared TypeScript/ESLint configs
├── backend/                    ← FastAPI + SQLAlchemy (Python 3.12)
└── turbo.json
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend (web + admin) | Next.js 15, TypeScript, Tailwind CSS |
| Backend API | FastAPI, SQLAlchemy (async), Alembic |
| Database | PostgreSQL 16 |
| Task queue | Celery + Redis |
| Auth | JWT (access + refresh), Argon2id password hashing |
| Payments | M-Pesa Daraja API (STK Push) |
| Monorepo tooling | Turborepo + pnpm workspaces |

---

## Current Features (as of March 2026)

### Student Web App (`apps/web`)
- Registration with grade-level selection (Grade 4–12)
- JWT login with 7-day free trial on signup
- Refresh token rotation (stored and validated server-side)
- Forgot password / reset password flow (email token)
- Grade-filtered subject and lesson browser
- Full lesson content viewer with Markdown rendering
- Dashboard with subject cards per grade tier (Primary / Junior / Senior)
- Subscription gating (trial → active → expired → cancelled)
- M-Pesa STK Push payment integration

### Admin Panel (`apps/admin`)
- Separate authentication isolated from student accounts
- Role-based access control:
  - `super_admin` — full access, can manage other admins
  - `content_editor` — manages subjects and lessons
  - `support_agent` — can view users and override subscriptions
- Dashboard with live stats (users, revenue, lessons)
- User management: search, view, override subscription status
- Content management: publish/unpublish lessons, activate/deactivate subjects
- Admin CRUD (super_admin only)
- Full audit log of all admin actions

### Backend API
- `/api/v1/auth/*` — register, login, refresh, logout, forgot/reset password, email verify
- `/api/v1/users/*` — profile, update
- `/api/v1/content/*` — subjects, lessons, search
- `/api/v1/payments/*` — M-Pesa initiation and callback
- `/api/v1/admin/*` — all admin endpoints (separate JWT namespace)
- Rate limiting on auth endpoints (slowapi)
- CORS configured for web + admin origins

### Test Suite
- 46 automated tests covering auth, content, and admin endpoints
- Isolated per-test database state (truncate between tests)
- Rate limiting disabled in test mode
- Run with: `python -m pytest tests/ -v`

---

## Project Structure — Backend

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── auth.py             ← Student auth endpoints
│   │   ├── users.py            ← Student profile
│   │   ├── content.py          ← Subjects + lessons
│   │   ├── payments.py         ← M-Pesa
│   │   └── admin/              ← Admin endpoints (RBAC)
│   │       ├── auth.py
│   │       ├── dashboard.py
│   │       ├── users.py
│   │       ├── content.py
│   │       ├── admins.py
│   │       └── audit.py
│   ├── models/
│   │   ├── user.py             ← User, RefreshToken, tokens, activity
│   │   ├── content.py          ← Subject, Lesson, LessonResource
│   │   ├── payment.py          ← PaymentTransaction
│   │   └── admin.py            ← AdminUser, AuditLog
│   ├── services/               ← Business logic layer
│   ├── schemas/                ← Pydantic request/response models
│   ├── core/                   ← Security, exceptions, config
│   └── tasks/                  ← Celery tasks (email, payment verification)
├── migrations/                 ← Alembic migration files
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_content.py
│   └── test_admin.py
├── seed.py                     ← Seeds all CBC subjects + lessons
├── seed_demo_users.py          ← Seeds 4 demo student accounts
└── seed_admin.py               ← Interactive super admin creation
```

---

## Getting Started (Development)

### Prerequisites
- Python 3.12
- Node.js 20+
- pnpm 10+
- PostgreSQL 16
- Redis

### Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env               # edit with your DB credentials

# Run migrations
alembic upgrade head

# Seed content and users
python seed.py
python seed_demo_users.py
python seed_admin.py               # creates super admin interactively

# Start API
uvicorn app.main:app --reload --port 8000
```

### Frontend setup

```bash
# From repo root
pnpm install

# Start student web app
cd apps/web && pnpm dev            # http://localhost:3000

# Start admin panel
cd apps/admin && pnpm dev          # http://localhost:3001
```

### Running tests

```bash
cd backend
source .venv/bin/activate

# Create test database (first time only)
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE tusome_test OWNER postgres;"

python -m pytest tests/ -v
```

---

## Demo Accounts (development only)

### Student accounts — password: `Demo1234!`
| Email | Grade | Status |
|---|---|---|
| alice@demo.com | Grade 5 (Primary) | trial |
| bob@demo.com | Grade 8 (Junior) | active |
| carol@demo.com | Grade 11 (Senior) | active |
| dan@demo.com | Grade 7 (Junior) | expired |

### Admin account
| Email | Role |
|---|---|
| admin@tusome.co.ke | super_admin |

*(Credentials stored privately — never committed to the repo)*

---

## Security

- Passwords hashed with Argon2id
- JWT access tokens (24h) + refresh tokens (30d), stored server-side and rotated on use
- Admin JWTs carry `iss: tusome-admin` — student endpoints reject admin tokens and vice versa
- All admin mutations written to `audit_logs` with IP, actor, and change details
- CORS restricted to known frontend origins
- `.env` is git-ignored — **no secrets are ever committed to this repo**
- Rate limiting on all auth endpoints

---

## Roadmap

### In progress
- [ ] Admin panel frontend (login, dashboard, users, content, audit pages)

### Planned
- [ ] Search UI in student dashboard
- [ ] Progress tracking (lesson completion %, streaks)
- [ ] Payment flow UI (M-Pesa STK Push → confirmation)
- [ ] Email delivery (SMTP / SendGrid integration)
- [ ] File upload for lesson resources (Cloudflare R2)
- [ ] Production deployment
- [ ] Custom domain setup: tusome.co.ke / admin.tusome.co.ke

---

## Contributing

**Pull requests are not accepted at this time.** This is a private project under active solo development. If you have questions or legitimate collaboration interest, contact the project owner directly.

---

## License

All rights reserved. This codebase is proprietary. No licence is granted to copy, modify, distribute, or use this software without explicit written permission from the owner.
