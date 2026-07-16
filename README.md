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
- **AppCreator24 / appmaker24** Android shell → [`docs/APPMAKER24.md`](./docs/APPMAKER24.md)

## AppCreator24 (appmaker24) link

1. Deploy **`frontend`** to Vercel (see `frontend/vercel.json`).
2. Set `PUBLIC_WEB_URL`, `PUBLIC_API_URL`, `APPCREATOR24_APP_URL` in backend `.env`.
3. In [AppCreator24](https://www.appcreator24.com), add WebView menus pointing at your deployed URLs.
4. Call `GET /api/integrations/appmaker24` for the exact menu URLs.

## Quick start (local)

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
docker compose up --build
cd frontend && yarn install && yarn start
```

## API overview

See [`contracts.md`](./contracts.md) and `GET /api/integrations/appmaker24`.

## Roadmap

[Issue #1](https://github.com/ashleygeeeeg/Clone/issues/1) — self-hosting, plugins, admin dashboard.

## Related

[product-launch](https://github.com/ashleygeeeeg/product-launch) — minimal landing starter.
