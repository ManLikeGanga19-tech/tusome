# Tusome — CBC E-Learning Platform

> **Status:** Active development. No PRs accepted without prior written approval from the project owner.
> **Plagiarism notice:** This project and all its code are the original work of the project owner. Unauthorised copying, redistribution, or derivative works are strictly prohibited.

---

## What is Tusome?

Tusome is a subscription-based e-learning SaaS platform built for Kenyan students following the Competency-Based Curriculum (CBC) — Grades 4–12. It delivers structured lesson content and quizzes for Primary, Junior Secondary, and Senior Secondary tiers, with integrated M-Pesa payments, a gamification system, and a full multi-role admin panel.

---

## Architecture

```text
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
| --- | --- |
| Frontend (web + admin) | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4 |
| UI Components | Shadcn UI, Radix UI, Lucide Icons, Framer Motion |
| Backend API | FastAPI, SQLAlchemy (async), Alembic, Pydantic v2 |
| Database | PostgreSQL 16 |
| Auth | JWT (HS256), Argon2id password hashing, separate student/admin token namespaces |
| Payments | M-Pesa Daraja API (STK Push + webhook) |
| Email | HTML templates built; delivery pending email provider setup |
| Monorepo tooling | Turborepo + pnpm workspaces |

---

## Current Features (as of March 2026)

### Student Web App (`apps/web`)

#### Authentication

- Registration with grade-level selection (Grade 4–12)
- JWT login with 7-day free trial on signup
- Refresh token rotation (stored and validated server-side)
- Forgot password / reset password flow (email token)
- Email verification flow

#### Learning

- Grade-filtered subject and lesson browser (Primary / Junior / Senior dashboards)
- Full lesson content viewer with Markdown rendering
- Lesson completion tracking — marks lesson as complete on scroll/time threshold
- Quiz player at the end of each lesson (instant auto-grading, no waiting)
- Quiz hub (`/dashboard/quizzes`) — browse all available quizzes with status, scores, and lock state
- Quizzes locked until the linked lesson is completed (enforced server-side)

#### Gamification & Progress

- XP earned on first quiz pass and lesson completion
- Level system (level name + number calculated from total XP)
- Daily streaks tracked server-side
- Achievement badges (e.g. first lesson, first quiz pass, 7-day streak)
- Leaderboard across grade peers
- Progress dashboard at `/dashboard/progress`

#### Subscription & Payments

- M-Pesa STK Push payment integration
- Subscription status gating: trial → active → expired → cancelled
- Subscription management page with tier pricing (Primary: KSh 499, Junior: KSh 899, Senior: KSh 1,499/month)

#### Preferences & Settings

- Subject preferences (which subjects to show prominently)
- Account settings (name, email, password change)

#### Public CMS Pages

- Blog (`/blog`) — articles pulled from admin-managed CMS
- Success Stories (`/success-stories`)
- FAQs (`/faqs`)
- Announcement banner shown site-wide when active announcements exist

---

### Admin Panel (`apps/admin`)

#### Authentication & Roles

- Completely separate authentication from student accounts (different JWT namespace)
- Three roles with fine-grained nav + page access:
  - `super_admin` — full access to all sections, can manage other admins
  - `content_editor` — manages subjects, lessons, quizzes, blog, stories, announcements, FAQs
  - `support_agent` — manages users, payments, blog, announcements, FAQs
- Post-login redirect to role-appropriate dashboard
- Full audit log of every admin mutation (who, what, when, from which IP)

#### Role-Aware Dashboard

- `super_admin`: platform-wide stats (users, revenue, subscriptions, trials expiring, failed payments), subscription breakdown chart
- `content_editor`: content stats (lessons, subjects, active students), quick-action links
- `support_agent`: user health summary (expiring trials, failed payments today) with direct action links

#### Content Management

- Subject CRUD: create, edit, delete, activate/deactivate per grade category
- Lesson CRUD: create, edit, delete, publish/unpublish; linked to parent subject

#### Quiz Management

- Quiz CRUD: create, edit, delete, publish/unpublish
- Cascading subject → lesson selector when creating/editing quizzes
- Anti-cheat controls per quiz:
  - Randomise question and choice order
  - Daily attempt cap (configurable per quiz)
  - Show or hide correct answers after submission
- Question editor: add/edit/delete questions with type (MCQ / True-False), points, explanation
- Choice editor: add/edit/delete choices, toggle correct answer

#### User Management

- Search and browse all student accounts
- View per-user profile: subscription status, grade, activity, payments, progress stats, badges

#### Payments

- Full transaction log with status (pending, success, failed), amount, phone, timestamp

#### CMS Management

- Blog posts: create, edit, publish/unpublish, rich text content
- Success Stories: create, edit, publish/unpublish
- FAQs: create, edit, reorder, publish/unpublish
- Announcements: create, edit, set active/inactive (drives banner on student site)

#### Analytics (super_admin only)

- Content gap report (subjects/grades with low lesson counts)
- Daily metrics chart
- Grade breakdown

#### Security & Ops (super_admin only)

- Admin Sessions — active admin login sessions
- Suspicious Activity — flagged events (too many failed logins, unusual patterns)
- Admin Account Management — create, edit, deactivate admin users
- Audit Log — searchable full history of all admin actions

---

### Backend API (`/api/v1/`)

| Route prefix | Module | Description |
| --- | --- | --- |
| `/auth` | auth.py | Register, login, refresh, logout, verify email, forgot/reset password |
| `/content` | content.py | List subjects, list lessons (grade-filtered), lesson detail (subscriber-gated) |
| `/quizzes` | quiz.py | List quizzes (with attempt + lock status), get quiz, submit attempt, attempt history |
| `/progress` | progress.py | Mark lesson complete, fetch stats, XP/level/streak, badges, leaderboard |
| `/payments` | payments.py | M-Pesa STK push initiation, payment webhook callback, subscription status |
| `/cms` | public_cms.py | Public blog, stories, FAQs, announcements (no auth required) |
| `/admin/auth` | admin/auth.py | Admin login, refresh, me |
| `/admin/dashboard` | admin/dashboard.py | Platform stats |
| `/admin/users` | admin/users.py | Full user management |
| `/admin/content` | admin/content.py | Subject + lesson CRUD |
| `/admin/quizzes` | admin/quizzes.py | Quiz + question + choice CRUD |
| `/admin/payments` | admin/payments.py | Payment transaction log |
| `/admin/analytics` | admin/analytics.py | Content gaps, daily metrics, grade breakdown |
| `/admin/cms` | admin/cms.py | Blog, stories, FAQs, announcements CRUD |
| `/admin/admins` | admin/admins.py | Admin user CRUD (super_admin only) |
| `/admin/sessions` | admin/sessions.py | Admin session management |
| `/admin/suspicious` | admin/suspicious.py | Suspicious event log |
| `/admin/audit` | admin/audit.py | Audit log search |

---

### Quiz Anti-Cheat System

The quiz system includes server-enforced anti-cheat measures:

1. **Lesson completion gate** — a quiz linked to a lesson cannot be started until `UserProgress.completed = True` for that lesson. Enforced in the backend; cannot be bypassed by manipulating the frontend.
2. **Randomised order** — when enabled, question order and choice order are shuffled server-side per attempt. Students never see the same order twice.
3. **Minimum time enforcement** — submissions faster than 3 seconds per question are rejected with an error. Prevents copy-paste and scripted submissions.
4. **Daily attempt cap** — configurable per quiz. Once the daily limit is reached, the student cannot submit again until the next UTC day.
5. **Answer reveal control** — admins can disable the per-question breakdown in the result, so students see their score but not which specific answers were wrong.

---

### Email System

HTML email templates are built and ready:

| Template | Trigger |
| --- | --- |
| `welcome.html` | After successful registration |
| `email_verify.html` | Email verification link |
| `password_reset.html` | Password reset link |
| `trial_expiry_warning.html` | Sent before trial expires |
| `trial_expired.html` | Sent when trial ends |
| `payment_confirmed.html` | After successful M-Pesa payment |

> **Note:** Email delivery is not yet wired — pending purchase of email provider (Resend / SendGrid). Wiring in is a small task once the provider is live.

---

### Test Suite

```text
65 tests passing — 0 failures
  test_auth.py       — registration, login, refresh, password reset, email verify
  test_content.py    — subjects, lessons, subscriber gating
  test_admin.py      — admin auth, RBAC, user management, content, audit log
  test_progress.py   — lesson completion, XP, streaks, badges, leaderboard
```

Both frontend apps (`apps/web` and `apps/admin`) pass TypeScript type checks with 0 errors.

---

## Database Migration History

```text
1a96d618053e — Initial schema (users, sessions, content, payments, admin)
130d24550bae — Admin users + audit logs
a7c2e5f8b1d3 — CMS tables (blog, stories, FAQs, announcements)
b3d9f1a4c7e2 — Admin sessions + suspicious activity
c4f7a2b8d3e1 — Progress + gamification (XP, streaks, badges, leaderboard)
d1e8f4a2c9b3 — User preferences
f4a2e9c3b1d7 — Quiz system (quizzes, questions, choices, attempts, answers)
e2b5f8a1c3d9 — Quiz anti-cheat fields (randomise_order, max_attempts_per_day, show_correct_answers)
```

---

## Project Structure — Backend

```text
backend/
├── app/
│   ├── api/v1/
│   │   ├── auth.py             ← Student auth endpoints
│   │   ├── content.py          ← Subjects + lessons
│   │   ├── quiz.py             ← Quiz player endpoints
│   │   ├── progress.py         ← Progress + gamification
│   │   ├── payments.py         ← M-Pesa
│   │   ├── public_cms.py       ← Public CMS (blog, stories, FAQs, announcements)
│   │   └── admin/
│   │       ├── auth.py
│   │       ├── dashboard.py
│   │       ├── users.py
│   │       ├── content.py
│   │       ├── quizzes.py
│   │       ├── payments.py
│   │       ├── analytics.py
│   │       ├── cms.py
│   │       ├── admins.py
│   │       ├── sessions.py
│   │       ├── suspicious.py
│   │       └── audit.py
│   ├── models/
│   │   ├── user.py             ← User, RefreshToken, tokens
│   │   ├── content.py          ← Subject, Lesson
│   │   ├── payment.py          ← PaymentTransaction
│   │   ├── admin.py            ← AdminUser, AuditLog, AdminSession, SuspiciousEvent
│   │   ├── progress.py         ← UserProgress, UserStats, Badge, Streak, Leaderboard
│   │   ├── quiz.py             ← Quiz, QuizQuestion, QuizChoice, QuizAttempt, QuizAnswer
│   │   └── cms.py              ← BlogPost, SuccessStory, FAQ, Announcement
│   ├── services/               ← Business logic layer
│   │   ├── auth_service.py
│   │   ├── content_service.py
│   │   ├── quiz_service.py
│   │   ├── progress_service.py
│   │   ├── payment_service.py
│   │   └── admin_service.py
│   ├── schemas/                ← Pydantic request/response models
│   ├── email_templates/        ← HTML email templates + renderer
│   └── core/                   ← Security, exceptions, config
├── migrations/                 ← Alembic migration files
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_content.py
│   ├── test_admin.py
│   └── test_progress.py
├── seed.py                     ← Seeds all CBC subjects + lessons
├── seed_demo_users.py          ← Seeds demo student accounts
└── seed_admin.py               ← Interactive super admin creation
```

---

## Getting Started (Development)

### Prerequisites

- Python 3.12
- Node.js 20+
- pnpm 10+
- PostgreSQL 16

### Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env               # edit with your DB credentials

# Run migrations
.venv/bin/alembic upgrade head

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

.venv/bin/python -m pytest tests/ -v
```

---

## Demo Accounts (development only)

### Student accounts — password: `Demo1234!`

| Email | Grade | Status |
| --- | --- | --- |
| `alice@demo.com` | Grade 5 (Primary) | trial |
| `bob@demo.com` | Grade 8 (Junior) | active |
| `carol@demo.com` | Grade 11 (Senior) | active |
| `dan@demo.com` | Grade 7 (Junior) | expired |

### Admin account

| Email | Role |
| --- | --- |
| `admin@tusome.co.ke` | super_admin |

> Admin password stored privately — never committed to the repo.

---

## Security

- Passwords hashed with Argon2id
- JWT access tokens (24h) + refresh tokens (30d), stored and rotated server-side
- Admin JWTs carry `iss: tusome-admin` — student endpoints reject admin tokens and vice versa
- All admin mutations written to `audit_logs` with actor, IP, and change details
- Quiz anti-cheat enforced entirely server-side — no frontend-only checks
- CORS restricted to known frontend origins
- `.env` is git-ignored — **no secrets are ever committed to this repo**
- Rate limiting on all auth endpoints

---

## Roadmap

### Done

- [x] Student auth (register, login, refresh, email verify, password reset)
- [x] Grade dashboards (Primary / Junior / Senior)
- [x] Lesson browser + content viewer
- [x] Lesson completion tracking
- [x] Quiz system (instant grading, anti-cheat, hub page)
- [x] Progress + gamification (XP, levels, streaks, badges, leaderboard)
- [x] M-Pesa STK Push payment flow
- [x] Full admin panel (all sections, all roles)
- [x] Subject + lesson CRUD (admin)
- [x] Quiz CRUD with anti-cheat settings (admin)
- [x] Role-aware dashboards (super_admin / content_editor / support_agent)
- [x] Public CMS (blog, stories, FAQs, announcements)
- [x] Email HTML templates (all triggers)
- [x] 65-test backend suite

### Pending

- [ ] Email delivery — wire in provider once purchased (Resend / SendGrid)
- [ ] Live M-Pesa credentials — test STK Push end-to-end with Safaricom sandbox → production
- [ ] File upload for lesson resources (Cloudflare R2 or similar)
- [ ] Production deployment (VPS + domain: tusome.co.ke / admin.tusome.co.ke)

---

## Contributing

**Pull requests are not accepted at this time.** This is a private project under active solo development. If you have questions or legitimate collaboration interest, contact the project owner directly.

---

## License

All rights reserved. This codebase is proprietary. No licence is granted to copy, modify, distribute, or use this software without explicit written permission from the owner.
