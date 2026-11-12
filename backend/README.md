# FORUM24 API

FastAPI + SQLAlchemy 2 + Alembic backend for the FORUM24 public site, Learning
Centre and editorial desk. It serves the same content shapes the React frontend
already uses, so the UI can run on live data without changing its types.

- **API prefix:** `/api/v1` (interactive docs at `/docs` outside production)
- **Health:** `GET /health`
- **Database:** PostgreSQL in deployed environments; SQLite for local development
- **Auth:** bearer tokens (HS256), hashed with `hashlib.scrypt`

## Quick start (SQLite, no services)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
python -m pip install -e ".[dev]"

copy .env.example .env          # Windows (cp on macOS/Linux)
python -m app.seed              # creates forum24.db and demo content
uvicorn app.main:app --reload --port 8000
```

If you already have a database, apply migrations instead of seeding a fresh
one:

```bash
python -m alembic upgrade head
```

Demo sign-in: `admin@forum24.example` / `Forum24!demo`.
Every seeded staff account (`editor@`, `reviewer@`, `author@`, …) uses the same
password. Seeded accounts are for development only.

## Docker Compose (PostgreSQL + API)

```bash
cd backend
docker compose up --build
```

This starts PostgreSQL 17 with a persistent volume and the API on
<http://localhost:8000>. The container entrypoint runs `alembic upgrade head`
before starting uvicorn, and `SEED_ON_STARTUP=true` fills an empty database with
demo content.

Override `SECRET_KEY` (and the database password) before using this outside a
local machine:

```bash
SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')" docker compose up --build
```

## Configuration

Settings are read from environment variables or `backend/.env` (see
`.env.example`).

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite+aiosqlite:///./forum24.db` | Use `postgresql+psycopg://…` for PostgreSQL |
| `SECRET_KEY` | `dev-only-change-me` | **Must** be replaced in production |
| `ACCESS_TOKEN_TTL_MINUTES` | `480` | Lifetime of issued bearer tokens |
| `CORS_ORIGINS` | localhost dev origins | JSON list of allowed frontend origins |
| `SEED_ON_STARTUP` | `false` | Seed demo content when the database is empty |
| `SCHEDULER_ENABLED` | `true` | Auto-publish approved articles when their slot passes |
| `SCHEDULER_INTERVAL_SECONDS` | `60` | How often the background publisher checks for due articles |
| `PUBLIC_BASE_URL` | `http://localhost:8000` | Used to build absolute download links |

## Migrations

```bash
python -m alembic revision --autogenerate -m "describe the change"
python -m alembic upgrade head
python -m alembic downgrade -1
```

`alembic/env.py` reads `DATABASE_URL` from the app settings, so the same command
works against SQLite and PostgreSQL. The initial migration is
`alembic/versions/b425cdefea7c_initial_schema.py`.

## Seeding

```bash
python -m app.seed           # seed only when the database is empty
python -m app.seed --reset   # drop and rebuild all data (development only)
```

The seed includes categories, articles, documents, videos, demo ads, AI desk
tasks, users and a few comments/newsletter records.

## Scheduling

Approved articles can be scheduled with
`POST /admin/articles/{id}/schedule` (`{"scheduledFor": "2026-11-13T07:00:00Z"}`) and
returned to the approved queue with `POST /admin/articles/{id}/unschedule`.
A background task checks every `SCHEDULER_INTERVAL_SECONDS` and moves due articles
from `Scheduled` to `Published`, setting `publishedAt` to the intended slot and
writing an `article.auto_publish` audit entry. Only articles that already passed the
human `approve` gate can be scheduled, so the worker never promotes drafts or AI
output on its own. Set `SCHEDULER_ENABLED=false` to move scheduling to an external
cron/queue instead; the transition logic lives in `app/services/publisher.py`.

## Endpoints

All paths below are relative to `/api/v1`.

### Public

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/bootstrap` | Single payload for the public shell (categories, articles, documents, videos, ads) |
| `GET` | `/categories`, `/tags` | Taxonomy lists |
| `GET` | `/articles` | Paginated article list (`category`, `tag`, `q`, `page`, `pageSize`) |
| `GET` | `/articles/{slug}` | Full article with body blocks |
| `GET` | `/articles/{slug}/related` | Related articles |
| `GET`/`POST` | `/articles/{slug}/comments` | Read or submit comments (moderated) |
| `GET` | `/search` | Cross-content search |
| `GET` | `/documents`, `/documents/{slug}` | Learning Centre documents |
| `GET` | `/documents/{slug}/download` | Generated PDF download (never ad-gated) |
| `GET` | `/videos`, `/videos/{slug}` | Video library |
| `GET` | `/authors/{slug}` | Author profile and archive |
| `GET` | `/ads` | Ad placements (`slot`, `pageType`, `device`) |
| `POST` | `/newsletter`, `/contact` | Newsletter signup and contact form |

### Auth

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | JSON sign-in → bearer token |
| `POST` | `/auth/token` | OAuth2 password form (for Swagger UI) |
| `GET` | `/auth/me` | Current user |

### Admin

All admin routes require a bearer token; the required role is noted per area.

| Area | Path | Role |
| --- | --- | --- |
| Dashboard | `GET /admin/stats` | author+ |
| Analytics | `GET /admin/analytics` | editor+ |
| Articles | `/admin/articles` CRUD | author+ (delete: admin) |
| Workflow | `POST /admin/articles/{id}/submit-review` | author+ |
| Workflow | `POST /admin/articles/{id}/approve` `/reject` | reviewer+ |
| Workflow | `POST /admin/articles/{id}/publish` `/schedule` `/archive` | editor+ |
| Resources | `/admin/documents`, `/admin/videos` | author+ (delete: admin) |
| Uploads | `POST /admin/uploads/presign` | author+ (stub slot) |
| Ads | `/admin/ads` | editor+ |
| AI desk | `/admin/ai/*` | editor+ (provider settings: admin) |
| Users | `/admin/users` | admin |
| Audit / comments | `/admin/audit-log`, `/admin/comments` | editor+ |

Role order: `reader < author < reviewer < editor < admin`.

## Editorial rules enforced by the API

- Publishing requires a human `approve` step first; `publish` returns `409` if
  the article has not been approved. Writing for the AI desk never publishes.
- Status is stored explicitly (`draft`, `pending_review`, `approved`,
  `scheduled`, `published`, `archived`) and serialised with a human label; colour
  is never the only signal.
- Adverts are returned by separate endpoints and never gate article text or
  downloads.
- Every editorial transition is written to `audit_log` with the acting user.

## Tests

```bash
python -m pytest -q
```

Coverage includes public content shapes, the approval gate, RBAC, token
handling and PDF generation. Tests run against an isolated SQLite database.

## Frontend

Point the React app at the API with `VITE_API_URL=http://localhost:8000` (see
`frontend/.env.example`). Without it the frontend keeps using its local mock
data, which is useful for design work and offline demos.

## Security notes

This is a development-oriented baseline, not a finished production deployment:

- Tokens are signed HS256 JWTs implemented in `app/security.py`; rotate
  `SECRET_KEY` and keep it out of source control.
- Tokens are stored by the client and sent as `Authorization: Bearer …`.
  Consider httpOnly cookies, refresh tokens and revocation for production.
- There is no rate limiting on login, comments, newsletter or contact forms.
  Put a gateway/WAF in front of the API before public launch.
- Password reset, email verification and 2FA are not implemented.
- Uploads are stubbed: `presign` returns a placeholder and documents are served
  from generated PDFs. Wire a real object store and virus scanning.
- CORS is restricted to the configured frontend origins; tighten it per
  environment.
