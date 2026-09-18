# Geo API — Country / State / City (Dependent Dropdown backend)

Backs `DROPDOWN-005` (Country → State → City dependent dropdown). Fictional dataset.

## `GET /api/geo/countries`

**Response 200**
```json
{ "data": [{ "code": "IN", "name": "India" }, ...], "meta": { "requestId": "...", "durationMs": 350 } }
```

## `GET /api/geo/states?country=IN`

**Query params**
| name | type | required | notes |
|---|---|---|---|
| country | string | yes | ISO-like country code, e.g. `IN` |

**Response 200** — same envelope shape, `data: GeoState[]`.
**Response 400** — missing/unknown `country` → problem-JSON with `status: 400`.

Simulated network latency: **~700ms** (deterministic mode).

## `GET /api/geo/cities?state=KA`

**Query params**
| name | type | required | notes |
|---|---|---|---|
| state | string | yes | state code, e.g. `KA` |

**Response 200** — `data: GeoCity[]`, only cities belonging to `state`.
**Response 400** — missing/unknown `state`.

Simulated network latency: **~700ms** (deterministic mode).

## Possible errors
| status | cause |
|---|---|
| 400 | missing or unrecognized `country`/`state` query param |
| 500 | unexpected server error (never expected with seeded data) |
