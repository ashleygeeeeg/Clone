# AppCreator24 / AppMaker24 — link maligeeAi (Clone)

Use **[AppCreator24](https://www.appcreator24.com)** (often called *appmaker24* / *Android app creator 24*) as the **Android shell**, and this repo as the **web app** inside WebView menus.

## 1. Deploy the web app (required)

AppCreator24 needs **HTTPS** URLs (not `localhost`).

| Piece | Where | Env |
|--------|--------|-----|
| Frontend | Vercel → import `ashleygeeeeg/Clone`, root **`frontend`** | `REACT_APP_BACKEND_URL` = your API origin (no `/api`) |
| API | Railway / Render / VPS / `docker compose` | `PUBLIC_WEB_URL`, `PUBLIC_API_URL`, `CORS_ORIGINS` |

**Vercel (frontend):**

1. [vercel.com/new](https://vercel.com/new) → GitHub → **Clone**
2. **Root Directory:** `frontend`
3. **Environment variables:**
   - `REACT_APP_BACKEND_URL` = `https://your-api.example.com`
   - `REACT_APP_PUBLIC_WEB_URL` = `https://your-app.vercel.app`
   - `REACT_APP_APPCREATOR24_APP_URL` = your published AppCreator24 link (see step 3)
4. Deploy → copy the production URL into backend `PUBLIC_WEB_URL`.

**Backend CORS** (in `.env`):

```env
CORS_ORIGINS=https://your-app.vercel.app,https://www.appcreator24.com
PUBLIC_WEB_URL=https://your-app.vercel.app
PUBLIC_API_URL=https://your-api.example.com
APPCREATOR24_APP_URL=https://www.appcreator24.com/appXXXXXXXX
```

## 2. API config for your mobile menus

```http
GET /api/integrations/appmaker24
```

Returns `webview_menus` with ready-made URLs for each app section.

## 3. Configure AppCreator24

In the [AppCreator24](https://www.appcreator24.com) editor:

1. Create or open your app.
2. Add a **Website / WebView / Link** section (wording varies by template).
3. Set URLs from `GET /api/integrations/appmaker24` or manually:

| Menu label | URL |
|-------------|-----|
| Home | `https://YOUR_WEB_URL/` |
| Sign in | `https://YOUR_WEB_URL/auth` |
| Dashboard | `https://YOUR_WEB_URL/dashboard` |
| AI Chat | `https://YOUR_WEB_URL/chat` |

4. **Publish** the Android app and copy the public link (`https://www.appcreator24.com/app…`).
5. Put that link in:
   - `APPCREATOR24_APP_URL` (backend)
   - `REACT_APP_APPCREATOR24_APP_URL` (Vercel frontend)

The site footer **Get Android app** button uses `REACT_APP_APPCREATOR24_APP_URL`.

## 4. Auth inside WebView

JWT is stored in the browser **localStorage** for your web origin. Users should sign in inside the WebView on the same domain as `PUBLIC_WEB_URL`. Do not mix two different HTTPS domains for auth unless you reconfigure cookies (not supported out of the box).

## 5. Checklist

- [ ] Frontend on HTTPS
- [ ] API on HTTPS + `REACT_APP_BACKEND_URL` set on Vercel
- [ ] `CORS_ORIGINS` includes your Vercel URL
- [ ] AppCreator24 menus point at `/`, `/auth`, `/dashboard`, `/chat`
- [ ] Published app URL in env vars
- [ ] Test signup → dashboard → chat on a real Android device

## Related

- Builder: https://www.appcreator24.com
- This repo: https://github.com/ashleygeeeeg/Clone
