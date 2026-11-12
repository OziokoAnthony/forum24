# FORUM24

An independent Nigerian digital publication: news, the Learning Centre
(documents + video lessons) and an editorial desk. The design system and product
rules live in [`AGENT.md`](./AGENT.md).

```
FORUM24/
  AGENT.md        # product, design system, rules and architecture
  backend/        # FastAPI + SQLAlchemy/Alembic + PostgreSQL
  frontend/       # Vite + React 19 + TypeScript + Tailwind v4
```

## Run it

### 1. API

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows; source .venv/bin/activate elsewhere
python -m pip install -e ".[dev]"
python -m app.seed              # SQLite + demo content
uvicorn app.main:app --reload --port 8000
```

Or use PostgreSQL + the API together:

```bash
cd backend
docker compose up --build
```

Demo sign-in: `admin@forum24.example` / `Forum24!demo`.
Full reference: [`backend/README.md`](./backend/README.md).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # VITE_API_URL=http://localhost:8000
npm run dev                     # http://localhost:5173
```

Without `VITE_API_URL` the frontend uses its bundled demo content, so it still runs
offline. With it, `/login` signs in for real and the editorial desk lists, edits,
approves, schedules and unschedules articles against the API.
Full reference: [`frontend/README.md`](./frontend/README.md).

## Verify

```bash
cd backend && python -m pytest -q        # 40 tests
cd frontend && npm run build             # tsc + vite
cd frontend && npm run smoke             # 32 routes, 0 runtime errors
```

`npm run lint` (oxlint) is blocked by the OS Application Control policy in this
environment; `npm run build` is the check.

## Non-negotiable rules

- Ads never gate content or downloads, and are always labelled and separated.
- Nothing publishes without human editorial approval; AI output can only be a draft.
- One action colour (`sky-600`); status is never conveyed by colour alone.
- Public content is server-driven; the bundled demo data is only a fallback.
