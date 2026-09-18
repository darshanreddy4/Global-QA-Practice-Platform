# API Lab — Products CRUD, Auth, Interception Targets

Backs the Network/API Testing, API Interception & Mocking, and API-Driven UI categories.
Per-session in-memory store (keyed by `X-Session-Key`), reset via `POST /api/lab/reset`.

## `GET /api/lab/categories`
- 200: `{ data: string[] }` — `["Electronics","Furniture","Apparel"]`.

## `GET /api/lab/products?category=Electronics`
- 200: `{ data: Product[] }`. `category` query param is optional; filters when present.

## `POST /api/lab/products`
Body: `{ name: string; price: number; category?: string }`
- 201: `{ data: Product }`, `Location: /api/lab/products/:id` header set.
- 400: missing/invalid `name` or `price`.

## `GET /api/lab/products/:id`
- 200: `{ data: Product }`
- 404: unknown id.

## `PUT /api/lab/products/:id`
Body: full resource `{ name, price, category }` (all required — PUT replaces entirely).
- 200: `{ data: Product }`
- 400: missing a required field.
- 404: unknown id.

## `PATCH /api/lab/products/:id`
Body: any subset of `{ name, price, category }`.
- 200: `{ data: Product }` (merged).
- 404: unknown id.

## `DELETE /api/lab/products/:id`
- 204: no body. Subsequent `GET` on the same id returns 404.
- 404: unknown id.

## `GET /api/lab/secure-report`
Requires header `Authorization: Bearer qa-lab-token`.
- 200: `{ data: { report, generatedFor } }`
- 401: missing/incorrect bearer token.

## `GET /api/lab/stock-price`
Deterministic real response `{ data: { symbol: "QALB", price: 142.5 } }`. This endpoint is the
designated **interception target** for the API Interception & Mocking category — the exercise is to
override its response using your test framework's network-mocking capability (Playwright `route.fulfill`,
Cypress `cy.intercept`, etc.) and confirm the UI reflects the mocked value instead of `142.5`.

## `GET /api/lab/admin-report`
Backs AUTH-004 (role-based access control). Requires an authenticated session via `requireRole("admin")`.
- 200: `{ data: { report, restrictedTo: "admin" } }`
- 401: no session cookie at all.
- 403: valid session, but role is not `admin`.

## Possible errors
| status | cause |
|---|---|
| 400 | invalid/missing required parameter |
| 401 | missing/incorrect Authorization header, or no session cookie |
| 403 | authenticated but wrong role (see `/admin-report`) |
| 404 | unknown product id |
