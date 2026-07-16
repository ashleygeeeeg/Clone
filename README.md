# Geeus AI (Clone)

Full-stack AI product: marketing site, JWT auth, builds & mock billing, dashboard, and **AI Partner in Crime** chat.

**Repository:** https://github.com/ashleygeeeeg/Clone

## Stack

| Layer | Tech |
|--------|------|
| Frontend | React 19, CRA + Craco, Tailwind, shadcn/Radix, React Router |
| Backend | FastAPI (`backend/server.py`), MongoDB |
| Infra | `docker-compose.yml` (API + Mongo) |

## Features (current)

- Landing: showcase, features, stats (API + auto-seed)
- Waitlist (`POST /api/waitlist`)
- Auth: signup, login, `/api/auth/me`
- Builds: first free, then $10 mock pay + deploy
- Chat: `/api/chat` (LLM via Emergent key)
- Routes: `/`, `/auth`, `/dashboard`, `/chat`

## Quick start (local)

### 1. Environment

```bash
cp .env.example .env
# Set MONGO_URL, DB_NAME, JWT_SECRET, EMERGENT_LLM_KEY, CORS_ORIGINS
```

### 2. Backend + Mongo (Docker)

```bash
docker compose up --build
# API: http://localhost:8000
```

Or run Mongo locally and start the API from `backend/` with your venv + `uvicorn`.

### 3. Frontend

```bash
cd frontend
yarn install   # or npm install
yarn start       # http://localhost:3000
```

Point the frontend at the API (see `frontend/src/services/api.js` — default is usually `http://localhost:8000/api`).

## API overview

Documented in [`contracts.md`](./contracts.md). Core groups:

- `GET /api/showcase`, `/features`, `/stats`
- `POST /api/waitlist`, `GET /api/waitlist/count`
- `POST /api/auth/signup`, `/login`, `GET /api/auth/me`
- `POST /api/builds`, `GET /api/builds`, pay/deploy
- `POST /api/chat`, `GET /api/pricing`

## Roadmap

See [Issue #1](https://github.com/ashleygeeeeg/Clone/issues/1): self-hosting, plugin adapters, admin dashboard, config UI.

## Push / collaborate

```bash
git clone https://github.com/ashleygeeeeg/Clone.git
cd Clone
git checkout -b feature/your-change
# ... edit ...
git add -A && git commit -m "your message" && git push -u origin feature/your-change
```

Open a PR on GitHub when ready.

## Related repo

A separate minimal landing starter lives at [product-launch](https://github.com/ashleygeeeeg/product-launch) if you only need a static marketing shell.
