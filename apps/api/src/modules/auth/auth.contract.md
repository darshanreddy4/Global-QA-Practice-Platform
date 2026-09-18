# Auth API

## `POST /api/auth/register`
Real self-service registration with EITHER an email or a phone number.
Body: `{ fullName: string; email?: string; phone?: string; password: string }` (at least one of email/phone required)
- 201: `{ data: { user, token } }` + sets httpOnly `qa_session` cookie. `token` is the raw JWT, returned
  specifically so automation scripts can capture it without reading cookies (see Session Link below).
- 400: missing fullName/email-or-phone, invalid email/phone format, or password under 8 characters.
- 409: an account with that email/phone already exists.

Passwords are bcrypt-hashed (`bcryptjs`) — unlike the seeded demo accounts below, which intentionally
keep plaintext passwords since they exist only to power the fixed practice-login challenges.

## `POST /api/auth/login`
Body: `{ identifier: string; password: string }` — `identifier` is an email OR a phone number.
(`email` is still accepted as an alias for `identifier` for backward compatibility.)
- 200 (no MFA): `{ data: { user, token } }` + sets httpOnly `qa_session` cookie.
- 200 (MFA-enabled account): `{ data: { mfaRequired: true, email, otp } }` — no session yet. `otp` is a
  test-only backdoor field (mirrors the real-world pattern of exposing OTPs in non-prod environments
  since automated tests cannot read SMS/email); call `/api/auth/mfa/verify` next.
- 401: invalid credentials → `{ status: 401, title: "Invalid email/phone or password" }`.
- 423: account locked (after 3 failed attempts for `locked_demo@qaplatform.dev`) → `Locked`, includes `retryAfterSeconds`.

## `POST /api/auth/mfa/verify`
Body: `{ email: string; otp: string }`
- 200: `{ data: { user, token } }` + sets `qa_session` cookie, same shape as a normal login.
- 401: incorrect or expired (60s TTL) code.

Seeded demo accounts (unaffected by real registration):
| email | password | role | notes |
|---|---|---|---|
| learner@qaplatform.dev | Learner123! | learner | |
| admin@qaplatform.dev | Admin123! | admin | |
| manager@qaplatform.dev | Manager123! | manager | |
| locked_demo@qaplatform.dev | Learner123! | learner | locks after 3 failed attempts |
| mfa_demo@qaplatform.dev | Learner123! | learner | requires OTP step |

## `POST /api/auth/logout`
- 200: `{ data: { ok: true } }`, clears session cookie.

## `GET /api/auth/me`
- 200: `{ data: { user } }` if authenticated.
- 401: not authenticated.

## `GET /api/auth/session-link?token=<jwt>&redirect=/challenge/DROPDOWN-005`
**The key automation pattern this platform is built around:** log in via the API (fast, no UI), then
open this URL directly in the browser under test to become authenticated and land straight on the
target page — no manual UI login step required. This is exactly the workflow requested: "log in via
API, then use a session link to jump directly to doing the actual UI action."

Flow for an automation script:
1. `POST /api/auth/login` (or `/register`) → capture `data.token` from the JSON response.
2. Navigate the browser under test to `GET /api/auth/session-link?token=<token>&redirect=/challenge/XYZ`.
3. The server verifies the token, sets the real `qa_session` cookie, and 302-redirects the browser to
   `redirect` on the frontend origin — the browser is now authenticated exactly as if it had logged in
   through the UI.

- 302: sets `qa_session` cookie, redirects to `WEB_ORIGIN + redirect`.
- 400: missing `token`.
- 401: token invalid/expired or user no longer exists.
- `redirect` MUST be an internal relative path (starts with `/`, not `//`, no `://`) — anything else is
  silently replaced with `/` to prevent open-redirect. This endpoint is a deliberate convenience for a
  **practice/test environment**; a production system doing this for real users (not test automation)
  would additionally want single-use, short-TTL tokens and to never place long-lived session tokens in
  a URL (referrer/log leakage risk) — documented here rather than silently glossed over.

## Role-based access control
`requireRole(role)` middleware (exported for other lab routes to reuse) checks the `qa_session` cookie:
- 401 if no session at all.
- 403 if authenticated but the role doesn't match exactly.
- Used by `GET /api/lab/admin-report` (requires `admin`).

## Access tiers (future monetization extension point)
Every user (`toPublicUser`) carries a `hasLifetimeAccess: boolean` flag (seeded `false` for new
registrations, `true` for the admin demo). This is the hook for the planned free-vs-paid model
(some categories free post-login, the rest unlocked by a one-time lifetime payment) — see
ARCHITECTURE.md "Access Tier & Monetization Architecture" for the full design. **No payment gateway is
integrated yet**; today every category/challenge is `accessTier: "free"` so nothing is actually gated.
