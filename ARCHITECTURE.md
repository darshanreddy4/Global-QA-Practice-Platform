# Global QA Practice Platform — Architecture & Implementation Plan

> Status: **Living document.** Version 1 (hardcoded, configuration-driven) is being implemented incrementally.
> This document is the single source of truth for architecture decisions. Update it whenever the
> architecture changes — do not let the code and this document drift apart.

**Delivery status:** Phase 1 ✅ delivered (Basic UI Actions, Input Controls, Dropdowns, Buttons,
Authentication, Error Handling). Phase 2 ✅ delivered (Links & Navigation, Mouse Actions, Drag & Drop,
Tables & Grids, Lists & Cards, Tabs, Accordions, Modals & Dialogs, Alerts & Notifications, Tooltips &
Hover Elements). Phase 3 ✅ delivered (Date & Time Controls, File Upload, File Download, Images &
Media, Sliders & Carousels, Scroll Behaviors). Phase 4 ✅ delivered (Dynamic Elements, Dynamic XPath
Challenges, Moving Elements, Ajax/Async, Wait & Synchronization, Virtualized Lists). Phase 5 ✅
delivered (Browser Windows & Tabs, Iframe Laboratory incl. nested iframes, Shadow DOM incl. nested
shadow roots, Cookies, Browser Storage, Popups). Phase 6 ✅ delivered (Network/API Testing full CRUD
playground, API Interception & Mocking against a real interception target, expanded API-Driven UI).
Phase 7 ✅ delivered (MFA/OTP login, role-based access control, session-expiry testing, client-side
progress tracking on the Dashboard, global Search & Discovery). Post-Phase-7 hardening added 138+
challenges live across ~40+ categories, plus real self-service user accounts (email or phone
registration, bcrypt-hashed passwords), an automation-friendly API-login → session-link bootstrap
flow (`/api/auth/session-link`, see §6), and access-tier/monetization extension points that are
defined but not yet enforced anywhere (see §6a). Phase 10 ✅ partially delivered (Real-World Mini
Applications: E-Commerce checkout, Banking OTP fund transfer, Travel flight booking — each a full
multi-step journey via the new `mission` engine component; HR/Education/Healthcare mini-apps and the
Framework Lab category remain planned). Phase 8 and 9 remain on the roadmap below.

---

## 0. Guiding Principle

The system is **not** organized around "pages." It is organized around three composable layers:

```
┌───────────────────────────────────────────────────────────┐
│  ENTERPRISE UI SHELL                                       │
│  Header / Sidebar / Breadcrumb / Form / Table / Modal      │
└───────────────────────────┬───────────────────────────────┘
                            │ renders
                            ▼
┌───────────────────────────────────────────────────────────┐
│  COMPONENT ENGINE                                          │
│  Dropdown / Input / Table / Iframe / Upload / ...          │
│  Each is a single reusable React component driven entirely │
│  by a "variant" prop — no per-challenge component forks.   │
└───────────────────────────┬───────────────────────────────┘
                            │ configured by
                            ▼
┌───────────────────────────────────────────────────────────┐
│  CHALLENGE ENGINE                                          │
│  ChallengeDefinition = Component + Behavior + Data +       │
│  Environment + Difficulty + Validation + Guidance          │
└───────────────────────────────────────────────────────────┘
```

A single `Dropdown` component + a `ChallengeDefinition` describing
`{behavior: "dependent+api", data: "geo/india", environment: "iframe"}`
produces one of 30+ distinct practice challenges without forking the component.
This is the core extensibility mechanism for the entire platform, including future
database-driven and AI-generated challenges (they only ever need to emit new
`ChallengeDefinition` JSON, never new component code).

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│ Client (Browser)                                                    │
│  apps/web  — React 18 + TypeScript + Vite + React Router + Tailwind │
└───────────────┬──────────────────────────────────────────────────--┘
                │ HTTPS / JSON (REST), WebSocket (live-data lab)
┌───────────────▼──────────────────────────────────────────────────--┐
│ API Gateway layer (Express, apps/api)                               │
│  - /api/challenges  /api/categories  /api/components                │
│  - /api/geo (countries/states/cities) /api/lab/* (simulation APIs)  │
│  - /api/auth (session/JWT)  /api/progress /api/admin                │
└───────────────┬──────────────────────────────────────────────────--┘
                │
      ┌─────────┼──────────────┬───────────────┐
      ▼         ▼              ▼               ▼
  Postgres   In-memory     File storage    WebSocket
  (or SQLite  simulation    (uploads/       gateway (chat,
  in dev)     engine        downloads,      live status,
              (delay/       generated       notifications)
              failure/      reports)
              random modes)
```

Two deployable services (`apps/web`, `apps/api`) + one shared library
(`packages/shared`) containing types, challenge schema, and validation
rules used by both. This lets the same `ChallengeDefinition` type be
validated identically on client and server — required once the
database-driven / AI-generated phases start writing definitions that
the frontend must trust.

---

## 2. Frontend Architecture

```
apps/web/src/
  app/                 # App shell: providers, router, layout composition
  design-system/       # Pure, story-boarded UI primitives (no business logic)
  components-engine/   # "Component Engine" — one folder per component family
    dropdown/
    input/
    table/
    ...
  challenges/          # Challenge registry (config, not components)
    registry.ts        # aggregates all category definitions
    basic-ui-actions/
    input-controls/
    dropdowns/
    ...
  features/
    guidance/          # Guidance panel renderer (reads ChallengeDefinition)
    validation/        # Reusable validation engine (client-side assertions)
    challenge-runner/  # Start/Pause/Reset/Hint/Complete/Retry experience
    dashboard/
    admin/
  layouts/             # AppShell, AuthLayout, LabLayout, PrintableLayout
  pages/               # Route-level composition only (thin)
  hooks/
  services/            # API clients (fetch wrappers per resource)
  store/               # Global state (auth, theme, progress) — Zustand
  utils/
  types/
  styles/
```

Rules:
- **`design-system/`** never imports from `challenges/`.
- **`components-engine/`** components accept a typed `variant`/`behavior` prop; they
  never import a specific challenge's data.
- **`challenges/`** contains only data/config (`ChallengeDefinition[]`), never JSX.
- **`pages/`** only compose layout + guidance + the engine component for a given
  challenge id; no business logic lives there.

## 3. Backend Architecture

```
apps/api/src/
  server.ts
  config/
  modules/
    auth/            # login, session, roles, MFA-simulated
    challenges/       # CRUD over hardcoded registry (v1) → DB (v2)
    categories/
    geo/              # countries/states/cities (dependent-dropdown demo)
    lab/               # simulation endpoints: delay, failure, retry, flaky
      delay.ts         # /api/lab/delay/:ms
      failure.ms       # /api/lab/failure/:mode
      files.ts         # upload/download simulation
    progress/          # attempts, scores, analytics (stubbed v1)
    admin/             # challenge activation toggles
  middleware/
    errorHandler.ts
    requestLogger.ts
    auth.ts
  websocket/           # live-data lab (order status, chat, notifications)
  db/
    schema.sql | prisma schema (v2)
    seed/              # seed data mirrors hardcoded frontend registry
```

Backend is REST-first, versionless in v1 (`/api/...`), documented with an
OpenAPI-style contract file per module (`*.contract.md`) — see §8 API Contracts.

## 4. Database ER Diagram (target state — v2/v3)

Version 1 uses in-memory/hardcoded data (see §14) with the exact same shape as
these tables, so migrating to a real DB later is a data-source swap only.

```
users ──< user_roles >── roles ──< role_permissions >── permissions
users ──< user_progress >── challenges
users ──< attempts >── challenges
attempts ──< attempt_results
challenges ──< challenge_steps
challenges ──< challenge_hints
challenges ──< challenge_validations
challenges >── components
challenges >── component_variants
challenges >── behaviors
challenges >── difficulty_levels
challenges >── frameworks
challenges ──< challenge_api_dependencies >── api_endpoints
challenges ──< test_data_bindings >── test_data
categories ──< challenges
missions ──< mission_steps >── challenges
organizations ──< org_members >── users        (future: team accounts)
achievements ──< user_achievements >── users
audit_logs >── users
```

Key tables (columns abbreviated):

| Table | Purpose |
|---|---|
| `users` | id, email, password_hash, display_name, created_at |
| `roles` / `permissions` | RBAC (admin, qa_lead, learner, org_owner) |
| `categories` | id, slug, title, parent_id (self-referencing tree, matches §73 nav tree) |
| `components` | id, slug, title, family (dropdown/table/input/...) |
| `component_variants` | id, component_id, variant_key, config_schema |
| `behaviors` | id, key (static/api/dependent/delayed/random/...) |
| `difficulty_levels` | beginner..nightmare, ordinal |
| `frameworks` | selenium/playwright/cypress/webdriverio/puppeteer/appium/rest-assured/postman/karate |
| `challenges` | id, category_id, component_id, variant, behavior_id, difficulty_id, framework_id[], environment (iframe/shadow-dom/new-tab/none), api_dependency, expected_result (jsonb), guidance (jsonb), validation_rules (jsonb), is_active |
| `challenge_steps` | ordered sub-tasks for missions |
| `challenge_hints` | ordered, revealable hints |
| `challenge_validations` | machine-checkable assertions (see §67) |
| `api_endpoints` | simulated endpoint catalog + docs (request/response/errors) |
| `test_data` | fixture sets, deterministic vs random flag |
| `attempts` / `attempt_results` | per-user run history, scoring |
| `user_progress` | rollup per category/framework/difficulty |
| `achievements` / `user_achievements` | gamification (future) |
| `organizations` / `org_members` | team/enterprise accounts (future) |
| `audit_logs` | admin + security-relevant actions |

## 5. API Architecture

- Style: REST, JSON, resource-oriented, documented per-module contract files.
- Base path: `/api`.
- Versioning strategy: unversioned in v1; `/api/v2/...` reserved once DB-backed.
- Pagination: `?page=&pageSize=` cursor-free for v1 (dataset sizes are small/simulated);
  cursor-based reserved for `/api/lab/virtualized` large-dataset endpoints.
- Errors: RFC7807-style problem JSON — `{ type, title, status, detail, requestId }`.
- All lab/simulation endpoints are **predictable and documented** (see §8), each with
  a deterministic mode (`?mode=deterministic`, default) and a random/chaos mode
  (`?mode=random`) — satisfies "deterministic first, random mode for advanced practice."

## 6. Authentication Architecture

- v1: real self-service registration (`POST /api/auth/register`) with EITHER an email
  or a phone number + bcrypt-hashed password, alongside a fixed set of seeded demo
  accounts (plaintext passwords, intentionally — they exist only to power the
  deterministic Authentication challenge category and must stay reproducible).
  Session: JWT (short-lived, 1h), httpOnly `qa_session` cookie. Roles: `admin`,
  `manager`, `learner`.
- Simulated MFA/OTP flow lives entirely in the **Auth Lab challenge category**, isolated
  from the real platform login (so practicing "wrong OTP" never breaks real login).
- **Automation session bootstrap (`GET /api/auth/session-link`)**: the login/register
  response body includes the raw JWT (`data.token`), specifically so an automation
  script can capture it without ever touching cookies. The script then opens
  `/api/auth/session-link?token=...&redirect=/challenge/XYZ` directly in the browser
  under test; the server verifies the token, sets the real session cookie, and
  redirects straight to the target page — fully authenticated, zero manual UI login.
  This is the core automation-friendliness requirement: "log in via API, then jump
  straight to doing the actual UI action." `redirect` is restricted to internal
  relative paths only (open-redirect guard). See `auth.contract.md` for the full flow
  and the production-hardening caveats of putting a session token in a URL (this
  pattern is scoped to a practice/test environment, not prescribed for real end-user
  auth as-is).
- Future: real MFA/email verification, SSO (SAML/OIDC) for org accounts, per-org RBAC.
- Cookies used for real session (`qa_session`, httpOnly, SameSite=Lax, Secure in prod) —
  separate from **Cookie Lab** challenge cookies, which are namespaced
  (`qalab_*`) so students can freely inspect/delete them without breaking the app.

## 6a. Access Tier & Monetization Architecture (future extension point)

Per the product plan: some component categories will remain free after login, the rest
unlock via a **one-time lifetime payment** (no subscription). The v1 architecture adds
the extension points now without implementing payment processing yet:

- `EnterpriseUser.hasLifetimeAccess: boolean` (shared domain type) — false for every new
  registration; the future payment-success webhook is the only thing that should ever
  flip it to true.
- `CategoryNode.accessTier?: "free" | "premium"` (shared registry type, via
  `getAccessTier()` helper defaulting to `"free"`) — every category today is
  unspecified/`"free"`, so **nothing is actually gated in v1**. When a payment
  provider is chosen, categories get flipped to `"premium"` individually.
- Deliberately NOT implemented yet: payment gateway integration (Stripe/Razorpay/PayPal
  — provider undecided), a pricing page, invoicing, or an `UpgradePrompt` UI. Building
  these without a chosen provider/pricing would be speculative; the clean extension
  point above is what lets them be added later without reworking the category/challenge
  model, consistent with the "hardcoded/free first, dynamic/paid later" principle
  already used throughout this document.
- When implemented, the natural integration point is a `PaymentProvider` webhook →
  `POST /api/billing/webhook` → sets `hasLifetimeAccess=true` on the paying user →
  an `AccessGate` component (rendered exactly like `ChallengePage`'s existing
  guidance/runner composition) checks `getAccessTier(category) === "premium" &&
  !user.hasLifetimeAccess` and shows an upgrade CTA instead of the practice component.

## 7. Challenge Architecture (the core model)

```ts
type ChallengeDefinition = {
  id: string;                 // "DROPDOWN-014"
  title: string;
  categoryId: string;         // matches nav tree in §73
  component: ComponentKey;    // "dropdown" | "input" | "table" | ...
  variant: string;            // component-specific variant key
  behavior: BehaviorTag[];    // ["dependent","api","delayed"]
  environment: EnvironmentTag[]; // ["iframe","shadow-dom","new-tab"]
  data: DataBindingKey;       // "geo/india" | "users/enterprise" | ...
  difficulty: Difficulty;     // beginner..nightmare
  frameworks: FrameworkTag[]; // informational, not enforced
  guidance: GuidanceContent;  // see §58
  validation: ValidationRule[];
  mode: { deterministic: boolean; randomAvailable: boolean };
  resettable: true;           // always true, enforced by type
};
```

This is why the dropdown example in the prompt works: **one** `<Dropdown>` component
+ many `ChallengeDefinition`s (static, searchable, dependent-country-state-city,
iframe-hosted, dynamic-id) = 30 distinct catalog entries, zero component forks.

## 8. Component Architecture

Each component family exposes ONE engine component with a typed variant surface:

```ts
<Dropdown
  variant="dependent"
  dataSource="geo/india"
  behavior={{ api: true, delayedMs: 800 }}
  dynamicId={false}          // stable id unless challenge says otherwise
  testIds={{ root: "country-select" }}
/>
```

Rules enforced by lint/convention:
1. No component reads `window.location` challenge id to branch logic — all branching
   comes from explicit props derived from `ChallengeDefinition`.
2. Components emit `data-testid` (stable) by default; only components whose
   `ChallengeDefinition.behavior` includes `"dynamic-id"` regenerate ids/classes.
3. All async component states (loading/error/empty/success) are first-class variants,
   not ad hoc conditionals scattered in pages.

## 9. Configuration Architecture

```
packages/shared/src/challenge-schema/   # zod schemas — single source of truth
apps/web/src/challenges/**/*.ts         # ChallengeDefinition[] (hardcoded v1)
apps/api/src/db/seed/**/*.json          # mirrors the above for server-side validation
```

`zod` schemas validate every hardcoded definition at build time (a script fails CI if
a definition doesn't match the schema) — this is what makes the swap to a real DB in
v2 safe: the DB rows must satisfy the same schema.

## 10. Folder Structure (monorepo)

```
Ai_generater/
  ARCHITECTURE.md
  package.json                 # npm workspaces root
  packages/
    shared/                    # types, zod schemas, validation engine core
  apps/
    web/                        # frontend (Vite + React + TS)
    api/                        # backend (Express + TS)
```

## 11. Data Model — summarized

See §4 ER diagram. Frontend mirrors it with TypeScript types in
`packages/shared/src/types`.

## 12. API Contracts

Each backend module ships a `*.contract.md` next to its route file describing:
request shape, response shape, status codes, error cases, example payloads —
required by the prompt for every API challenge. Example: [apps/api/src/modules/geo/geo.contract.md](apps/api/src/modules/geo/geo.contract.md).

## 13. State-Management Strategy

- Server cache/state: lightweight fetch-wrapper + React Query-style hook
  (`useApiResource`) — avoids overkill dependency in v1, upgradeable to TanStack Query
  later without API changes.
- Client/global state: Zustand store, split by slice (`authSlice`, `themeSlice`,
  `progressSlice`, `challengeRunnerSlice`).
- Local component state: React `useState`/`useReducer` only.
- Challenge runner state (Start/Pause/Reset/Hint/Complete) is a dedicated state
  machine (`useChallengeRunner`) reused by every challenge page.

## 14. Error-Handling Strategy

- Frontend: `ErrorBoundary` per route + per lab-panel (an error in one practice
  component must never crash the whole app) + typed API error surface
  (`ApiError { status, code, message, requestId }`) rendered via a reusable
  `ErrorState` design-system component.
- Backend: central `errorHandler` middleware emitting problem-JSON with a
  `requestId` (propagated via `X-Request-Id`), mapped to the dedicated
  Error-Handling Lab (§44) status codes (400/401/403/404/408/409/429/500/502/503/504).

## 15. Logging Strategy

- Backend: structured JSON logs (pino) — `requestId`, `route`, `duration`, `status`.
- Frontend: dev-only console logger gated by `VITE_DEBUG`; challenge attempts emit
  analytics events through a single `trackEvent()` hook (stubbed in v1, wired to
  `/api/progress` later).

## 16. Security Architecture

- OWASP-aligned from day one: parameterized queries (once DB is added), input
  validation via shared zod schemas on both client and server, output encoding
  (React default escaping; explicit `dangerouslySetInnerHTML` banned outside the
  dedicated, isolated XSS-safety-demo challenge which sandboxes injected content in
  an `iframe sandbox` with no same-origin privileges), CSRF token for state-changing
  requests, secure/httpOnly/SameSite cookies, rate limiting middleware on auth routes,
  helmet-style security headers, least-privilege RBAC.
- **Security Testing Practice category (§45)** is entirely simulated against the
  app's own sandboxed endpoints — never targets third-party systems, never performs
  real exploitation, always isolated + non-destructive + resettable.

## 17. Accessibility Strategy

- Design-system primitives are WCAG 2.1 AA by default (semantic HTML, labeled
  controls, focus rings, keyboard operability, color-contrast-checked palette).
- Every challenge's `ChallengeDefinition.accessibility` field is one of
  `"expected-accessible"` or `"intentional-defect"`; intentional-defect challenges are
  visually badged so learners know the defect is the exercise, not a platform bug.
- Automated axe-core smoke checks run in CI against `expected-accessible` pages only.

## 18. Testing Strategy

- Unit: Vitest for shared/frontend logic (validation engine, challenge registry schema).
- Component: React Testing Library for design-system + engine components.
- E2E (dogfooding): Playwright suite that itself exercises deterministic-mode
  challenges — proves the platform's own challenges are solvable by automation,
  and doubles as regression protection.
- Backend: supertest against Express routes.
- Contract: zod schema validation of every `ChallengeDefinition` in CI.

## 19. Deployment Architecture

- v1: two independent Node processes (`apps/web` static build served by any static
  host/CDN; `apps/api` as a Node service), CORS-configured for local/dev split.
- Environment config via `.env` per app; secrets never committed.
- Future: containerize both apps, add Postgres + object storage (S3-compatible) for
  uploads, background worker for async report generation, WebSocket-capable
  ingress for the live-data lab.

## 20. Future Dynamic-Generation Architecture

```
Challenge Engine
 ├─ Component Generator     (pick component family)
 ├─ Behavior Generator      (pick behavior tags)
 ├─ Data Generator          (deterministic seed or faker-based random)
 ├─ DOM Generator           (stable vs dynamic id/class/hierarchy)
 ├─ API Generator           (latency/failure/pagination profile)
 ├─ Delay Generator
 ├─ Failure Generator
 ├─ Authentication Generator
 └─ Validation Generator
```

All generators emit a `ChallengeDefinition` conforming to the §7/§9 schema — meaning
the entire rendering/guidance/validation pipeline built in v1 requires **zero changes**
when v3/v4 (dynamic + AI generation) are introduced. This is the extension point the
whole v1 architecture is built to protect.

Future capability checklist (clean extension points only, not implemented now):
DB-driven components • dynamic generator • random generation • AI-generated challenges
• AI-generated test data • learning paths • skill assessment • automated scoring •
leaderboards • certifications • org/team accounts • enterprise subscriptions • private
challenges • custom challenge creation • API challenge creation • framework packs •
CI/CD integration • webhooks • automation-result ingestion • git integration • test
report ingestion.

---

## 21. Category → Roadmap Mapping (all 73 categories accounted for)

Every category from the spec is mapped to a phase. Nothing is dropped, merged silently,
or renamed. "Sim" = safe simulated version documented with its technical limitation.

| # | Category | Phase | Notes |
|---|---|---|---|
| 1 | Basic UI Actions | Phase 1 | first component category |
| 2 | Input & Form Controls | Phase 1 | first component category |
| 3 | Dropdowns & Selection | Phase 1 | includes dependent country/state/city demo |
| 4 | Buttons & Click Behaviors | Phase 1 | |
| 5 | Links & Navigation | Phase 2 ✅ | delivered |
| 6 | Mouse Actions | Phase 2 ✅ | delivered |
| 7 | Drag & Drop | Phase 2 ✅ | delivered |
| 8 | Tables & Grids | Phase 2 ✅ | delivered |
| 9 | Lists & Cards | Phase 2 ✅ | delivered |
| 10 | Menus & Navigation | Phase 1 | delivered as part of app shell |
| 11 | Tabs | Phase 2 ✅ | delivered |
| 12 | Accordions | Phase 2 ✅ | delivered |
| 13 | Modals & Dialogs | Phase 2 ✅ | delivered |
| 14 | Alerts & Notifications | Phase 2 ✅ | delivered |
| 15 | Tooltips & Hover | Phase 2 ✅ | delivered |
| 16 | Date & Time Controls | Phase 3 ✅ | delivered |
| 17 | File Upload | Phase 3 ✅ | delivered |
| 18 | File Download | Phase 3 ✅ | delivered |
| 19 | Images & Media | Phase 3 ✅ | delivered |
| 20 | Sliders & Carousels | Phase 3 ✅ | delivered |
| 21 | Scroll Behaviors | Phase 3 ✅ | delivered |
| 22 | Dynamic Elements | Phase 4 ✅ | delivered — Dynamic DOM Lab |
| 23 | Dynamic XPath Challenges | Phase 4 ✅ | delivered — Dynamic DOM Lab |
| 24 | Moving Elements | Phase 4 ✅ | delivered — Dynamic DOM Lab |
| 25 | Ajax/Async Elements | Phase 4 ✅ | delivered — uses lab delay/failure sim endpoints |
| 26 | Wait & Synchronization | Phase 4 ✅ | delivered |
| 27 | Browser Windows & Tabs | Phase 5 ✅ | delivered — Browser Lab |
| 28 | Iframe Laboratory | Phase 5 ✅ | delivered — Browser Lab, nested A→B→C |
| 29 | Shadow DOM | Phase 5 ✅ | delivered — Browser Lab |
| 30 | Network / API Testing | Phase 6 ✅ | delivered — API Lab, full CRUD playground |
| 31 | API Interception & Mocking | Phase 6 ✅ | delivered — API Lab (documented as client-side mock; real MITM out of scope, sim documented) |
| 32 | API-Driven UI | Phase 1/6 ✅ | delivered — dependent dropdown (Phase 1) + category-filtered grid & widget states (Phase 6) |
| 33 | Authentication | Phase 1 (basic) / Phase 7 (MFA/roles) | |
| 34 | Cookies | Phase 5 ✅ | delivered — Browser Lab |
| 35 | Browser Storage | Phase 5 ✅ | delivered — Browser Lab |
| 36 | Popups | Phase 5 ✅ | delivered — native dialogs sim documented (browsers block scripted control) |
| 37 | WebSocket/Live Data | Phase 8 | requires WS gateway |
| 38 | Web Workers/Async Processing | Phase 8 | |
| 39 | Infinite Scroll | Phase 3 | |
| 40 | Virtualized Lists | Phase 4 ✅ | delivered — Dynamic DOM Lab |
| 41 | Responsive Design | Cross-cutting | design system + every phase |
| 42 | Mobile Web Behaviors | Phase 9 | sim: touch events via pointer events, documented limitation for real touch/gesture hardware |
| 43 | Accessibility | Cross-cutting | design system + `intentional-defect` badge system from Phase 1 |
| 44 | Error Handling | Phase 1 (foundation) / Phase 9 (full status-code gallery) | |
| 45 | Security Testing Practice | Phase 9 | isolated, non-destructive, sandboxed |
| 46 | Performance Testing Practice | Phase 9 | |
| 47 | Visual Testing | Phase 9 | |
| 48 | Cross-Browser Practice | Cross-cutting | documented in Testing Strategy §18 |
| 49 | Real-World Mini Applications | Phase 10 ✅ | delivered — E-Commerce checkout, Banking OTP transfer, Travel flight booking (multi-step `mission` engine component); HR/Education/Healthcare remain planned |
| 50 | Framework-Specific Practice | Phase 10 ✅ | delivered since Phase 1 — every challenge already carries a `frameworks[]` tag (selenium/playwright/cypress) shown in its guidance panel |
| 51 | Practice Modes | Phase 2 | Learn/Practice/Challenge/Real Project/Random/Interview |
| 52 | Difficulty System | Phase 1 | part of core schema |
| 53 | Challenge Metadata | Phase 1 | part of core schema |
| 54 | Everything-in-One-Page Challenge | Phase 11 | after enough components exist |
| 55 | Nightmare DOM | Phase 11 | |
| 56 | QA Mission System | Phase 11 | Missions |
| 57 | Ultimate E-Commerce Mission | Phase 11 | |
| 58 | Component Guidance System | Phase 1 | core, built first |
| 59 | Enterprise UI Design | Phase 1 | design system |
| 60 | Frontend Architecture | Phase 1 | this document + scaffold |
| 61 | Backend Architecture | Phase 1 | this document + scaffold |
| 62 | Database Architecture | Phase 1 (design) / Phase 12 (real DB) | hardcoded v1 mirrors schema |
| 63 | Hardcoded-First, Dynamic-Later | Phase 1 | governing rule |
| 64 | Dynamic Challenge Engine | Phase 13 | extension point only in v1 |
| 65 | Behavior Matrix | Phase 1 | core schema (`behavior[]`, `environment[]`) |
| 66 | Random Data Generation | Phase 1 (hooks) / Phase 4 (broad use) | deterministic vs random mode flag in schema from day one |
| 67 | Validation Engine | Phase 1 | core, built first |
| 68 | Admin Platform | Phase 12 | |
| 69 | User Dashboard | Phase 7 ✅ | delivered — client-side (localStorage) progress; backend-persisted attempts remain Phase 12 |
| 70 | Search & Discovery | Phase 7 ✅ | delivered — global header search across challenges/categories/frameworks/difficulty |
| 71 | Challenge Execution Experience | Phase 2 | Start/Pause/Reset/Hint/Complete/Retry runner |
| 72 | Analytics & Reporting | Phase 12 | |
| 73 | Global Enterprise QA Lab (nav tree) | Phase 1 | sidebar/nav scaffolds every branch now, content fills in per phase |

## 22. Implementation Phases (execution order)

- **Phase 1 — Foundation (this session):** design system, app shell/routing/nav tree,
  challenge schema + guidance + validation engine, hardcoded registry, backend
  foundation (Express + geo + lab-delay endpoints), auth stub, Basic UI Actions,
  Input & Form Controls, Dropdowns (static/searchable/API/dependent/iframe-ready),
  Buttons.
- **Phase 2:** Links, Mouse Actions, Drag & Drop, Tables, Lists/Cards, Tabs,
  Accordions, Modals, Alerts/Toasts, Tooltips, Practice Modes, Challenge Runner UX.
- **Phase 3:** Date/Time, Upload, Download, Media, Sliders/Carousels, Scroll, Infinite Scroll.
- **Phase 4:** Dynamic DOM Lab (dynamic elements, XPath challenges, moving elements,
  virtualized lists), Ajax/Async lab, Wait/Sync lab.
- **Phase 5:** Browser Lab (windows/tabs, iframes incl. nested, shadow DOM, cookies, storage, popups).
- **Phase 6:** API Lab (REST CRUD, interception/mocking, API-driven UI expansion).
- **Phase 7:** Full auth (MFA/roles/permissions), dashboard, search/discovery.
- **Phase 8:** WebSocket live-data lab, web workers/async processing.
- **Phase 9:** Mobile/responsive deep dive, accessibility deep dive, error-handling
  gallery, security practice, performance practice, visual testing.
- **Phase 10:** Real-world mini apps, framework-specific practice packs.
- **Phase 11:** Everything-in-one-page, Nightmare DOM, mission system.
- **Phase 12:** Real database migration, admin platform, analytics.
- **Phase 13:** Dynamic challenge generator, AI-generated challenges/data.

Each phase must leave all previous phases working — enforced via the E2E dogfooding
suite (§18) run before merging each phase.
