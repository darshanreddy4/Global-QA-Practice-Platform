# Global QA Practice Platform

A hands-on QA/automation practice platform — 130+ real-world component and end-to-end
challenges (dropdowns, tables, popups, dynamic DOM, API mocking, auth flows, and more)
plus a self-service automation bootstrap flow (API login → session link → land
authenticated on any challenge). See [ARCHITECTURE.md](./ARCHITECTURE.md) for full
architecture details and the category roadmap.

## Local development

```bash
npm install
npm run build:shared      # build the shared package once (types/registry/validation engine)
npm run dev:api            # terminal 1 — API on http://localhost:4000
npm run dev:web             # terminal 2 — frontend on http://localhost:5173 (proxies /api to :4000)
```

Open http://localhost:5173. Seeded demo accounts are documented in
`apps/api/src/modules/auth/auth.contract.md`.

## Environment variables

Copy the `.env.example` file in each app and fill in real values before deploying:

- [`apps/api/.env.example`](./apps/api/.env.example) — `JWT_SECRET` (required in
  production), `WEB_ORIGIN` (comma-separated allowed frontend origins), cookie flags.
- [`apps/web/.env.example`](./apps/web/.env.example) — `VITE_API_BASE_URL` (only needed
  if the API is hosted on a different domain than the frontend).

## Production build

```bash
npm run build   # builds packages/shared, apps/web, and apps/api in order
```

- `apps/web/dist` — static frontend assets.
- `apps/api/dist/server.js` — compiled API; run with `node apps/api/dist/server.js`
  (or `npm run start --workspace apps/api`).

## ⚠️ Important architecture note

The API (`apps/api`) is a **long-running, stateful Express server**. Registered users,
login lockout counters, and every stateful "lab" endpoint (flaky/failure simulators,
the products CRUD store, etc.) are held **in memory in that one process** — there is no
database. This is intentional for a v1 practice platform (see ARCHITECTURE.md), but it
means the API **must run as a single persistent process**, not as stateless serverless
functions — a fresh serverless invocation would not remember users who registered a
moment earlier on a different instance.

## Deploying: Vercel (frontend) + Render/Railway/Fly (API)

This repo is set up for exactly this split — it's the recommended path since it
requires zero backend rewrite and keeps the in-memory state model working correctly
(one persistent process = one shared memory space).

### 1. Deploy the API first (Render, Railway, or Fly — any works the same way)

- Root directory: repo root (this is an npm-workspaces monorepo — `apps/api` depends
  on `packages/shared`, so `npm install`/build must run from the repo root, not from
  inside `apps/api`).
- Build command: `npm install --include=dev && npm run build --workspace packages/shared && npm run build --workspace apps/api`
  - **`--include=dev` is required.** Most hosts (Render included) set `NODE_ENV=production`
    as an environment variable for the whole service — including during the install
    step — which makes plain `npm install` silently skip devDependencies (`typescript`,
    `@types/*`). Since the build needs `tsc` and type declarations, you must force them
    in with `--include=dev` regardless of `NODE_ENV`. (devDependencies are only needed
    for this build step — the compiled output that actually runs afterward doesn't need them.)
- Start command: `npm run start --workspace apps/api` (runs `node dist/server.js`)
- Environment variables (see [`apps/api/.env.example`](./apps/api/.env.example)):
  - `NODE_ENV=production`
  - `JWT_SECRET=<a long random string — the server refuses to start without this in production>`
  - `WEB_ORIGIN=https://your-app.vercel.app` (set this AFTER step 2, once you know the real Vercel URL)
  - `COOKIE_SAME_SITE=none` — **required** because the frontend and API will be on
    different domains; without this the session cookie won't be sent cross-site at all.
  - `COOKIE_SECURE` doesn't need to be set — it's automatically `true` whenever
    `NODE_ENV=production`, which is required for `SameSite=None` cookies to work.
- Health check path: `/api/health`
- Note your API's public URL, e.g. `https://your-api.onrender.com`.

### 2. Deploy the frontend to Vercel

- Import this repo into Vercel. The included [`vercel.json`](./vercel.json) at the repo
  root already configures the install/build commands, output directory
  (`apps/web/dist`), and the SPA rewrite (all routes serve `index.html` so React Router
  handles client-side routing).
- Set one environment variable in the Vercel project:
  - `VITE_API_BASE_URL=https://your-api.onrender.com/api` (the API URL from step 1, with `/api` appended)
- Deploy. Note the resulting Vercel URL, e.g. `https://your-app.vercel.app`.

### 3. Close the loop

- Go back to the API host and set `WEB_ORIGIN=https://your-app.vercel.app` (the real
  Vercel URL from step 2), then redeploy the API so CORS allows it.
- Visit the Vercel URL and confirm: sign up, sign in, and the Automation Access page's
  session-link flow all work end-to-end.

