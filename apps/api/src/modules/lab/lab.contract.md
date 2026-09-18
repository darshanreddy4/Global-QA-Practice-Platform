# Lab Simulation API — delay, failure, and API-driven-UI endpoints

All lab endpoints support `?mode=deterministic` (default) or `?mode=random` for
advanced/chaos practice (spec §66). Deterministic mode is what challenge validation
rules assume.

## `GET /api/lab/departments`
Backs `DROPDOWN-004`. ~800ms delay, then returns a fixed department list.
- 200: `{ data: string[] }`
- `?mode=random`: ~15% chance of `503 Service Unavailable`.

## `GET /api/lab/username-availability?username=admin`
Backs `INPUT-006`. ~400ms delay.
- 200: `{ data: { username, available: boolean } }`. Seeded taken usernames: `admin`, `qa_lead`.
- 400: missing `username`.

## `GET /api/lab/assignees`
Backs `DROPDOWN-010`. ~2500ms delay, then a fixed engineer list. Deterministic — always the same delay
and list, so the exercise is purely about waiting for async-loaded options, not data variability.
- 200: `{ data: string[] }`

## `POST /api/lab/process-payment`
Backs `BUTTON-003`. Body: `{}` (payload pre-filled by UI). ~1200ms delay.
- 200: `{ data: { status: "approved" } }`
- `?mode=random`: ~20% chance of `200 { data: { status: "declined" } }`.

## `POST /api/lab/create-order`
Backs `BUTTON-005`. ~600ms delay. Idempotent per session via `Idempotency-Key` header
(if omitted, every call counts as a new order — used to demonstrate the double-submit
bug the button-level disable is meant to prevent).
- 200: `{ data: { orderId } }`

## `GET /api/lab/failure/:code`
Backs the Error Handling category. `:code` in `404|500|429`.
- `404`: always returns 404 problem-JSON.
- `500`: first call per `requestId` cookie session returns 500; subsequent calls return 200.
- `429`: after 3 calls within 10s (per session), returns 429 with `Retry-After` header.

## `GET /api/lab/delay/:ms`
Backs `AJAX-001`. Waits exactly `ms` (capped at 10000) then returns `{ data: { loadedLabel } }`.

## `GET /api/lab/flaky`
Backs `AJAX-002`. Fails with 500 on the first 2 calls per `X-Session-Key`, succeeds on the 3rd with
`{ data: { attemptCount, accountBalance } }`.

## `GET /api/lab/empty-response`
Backs `AJAX-003`. Always returns `{ data: [] }` — a legitimate empty, non-error response.

## `GET /api/lab/chained/step1` + `GET /api/lab/chained/step2?token=`
Backs `WAIT-002`. step1 mints a one-time token (~500ms); step2 requires that token (~500ms) and
returns `{ data: { eta } }`. Calling step2 without a valid token returns 400.

## Possible errors (all endpoints)
| status | meaning |
|---|---|
| 400 | invalid/missing required parameter |
| 429 | rate limited (only `/failure/429` and auth lockout) |
| 500 | simulated failure (deterministic on `/failure/500` first call, `/flaky` first 2 calls, or `?mode=random`) |
| 503 | simulated dependency outage (`?mode=random` only) |
