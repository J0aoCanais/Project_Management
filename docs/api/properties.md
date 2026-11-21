# Properties API

Base URL (local development): `http://localhost:8000`
All property endpoints live under **`/api/properties`**. Requests and responses are JSON.

---

## Authentication

Every properties endpoint requires a logged-in user with the **owner** access level. Authentication is session-cookie based, so your HTTP client must store and resend cookies (`credentials: "include"` in `fetch`).

1. **Get a CSRF token**: `GET /csrf-token`. Also starts the session cookie.
2. **Log in**: `POST /login` as form data (`application/x-www-form-urlencoded`, not JSON) with fields `username` and `password`, and the header `X-CSRFToken: <token>`. The `username` field takes the user's **email**. Success is a `302` redirect to `/` and a new session cookie. A wrong username or password returns `200` with the login page again.
3. **Fetch a fresh CSRF token after logging in** (the session changed).
4. **Send `X-CSRFToken: <token>` on every `POST`, `PATCH` and `DELETE`.** `GET` requests don't need it.

Requests without a valid owner session are rejected and never reach the endpoint.

```bash
BASE=http://localhost:8000
curl -s -c cookies.txt $BASE/csrf-token
curl -i -b cookies.txt -c cookies.txt -X POST $BASE/login \
  -H "X-CSRFToken: <token>" \
  --data-urlencode "username=<email>" --data-urlencode "password=<pass>"
```

---

## Conventions

**Soft-deleted properties.** Soft-deleted properties are hidden from the list, search and zones endpoints, and return `404` on edit and delete.

> **Known issue:** `GET /api/properties/<id>` and `GET /api/properties/<id>/links` do not check for soft deletion yet, so they still return a deleted property. Remove this note once fixed.

**Money and areas are decimal strings.** Prices, `profit` and `area_m2` are sent and returned as strings with two decimal places (`"250000.00"`), never as floats, so no rounding error appears between the API and the client. Values sent with more than two decimal places are rounded.

**Errors.** Every error uses the `errors` key. Validation errors are `400` with field messages:

```json
{ "errors": { "asking_price": ["Must be greater than 0 and less than or equal to 1000000000."] } }
```

Other errors use the same shape, keyed by what went wrong:

```json
{ "errors": { "id": ["Property not found"] } }
{ "errors": { "server": ["Internal server error"] } }
```

**Pagination.** List and search accept `page` (default `1`, minimum `1`) and `per_page` (default `20`, `1` to `100`). Invalid values return `400`, e.g. `{ "errors": { "per_page": ["Not a valid integer."] } }`.

Paginated responses look like this:

```json
{
  "success": true,
  "data": [ /* property objects */ ],
  "pagination": {
    "page": 1, "per_page": 20, "total": 1, "pages": 1,
    "has_next": false, "has_prev": false
  }
}
```

---

## The property object

```json
{
  "id": 1,
  "code": "IMO-1",
  "source_url": "https://www.example.com/property/123",
  "address": "Rua Augusta, 100, Lisboa",
  "typology": "T2",
  "zone": "Baixa",
  "area_m2": "85.50",
  "asking_price": "350000.00",
  "vvr": "400000.00",
  "profit": "50000.00",
  "max_proposal": "320000.00",
  "first_proposal": "300000.00",
  "visit_date": "2026-11-10T10:00:00",
  "notes": null,
  "admin_location": null,
  "property_type": null,
  "property_condition": null,
  "construction_year": null,
  "matricial_article": null,
  "predial_description": null,
  "usage_license": null,
  "energy_certificate": null
}
```

`code` is computed by the server (`IMO-<id>`) and is read-only. Sending it in a request is rejected as an unknown field. Unset optional fields come back as `null`.

---

## Property endpoints

### List properties

`GET /api/properties/`

Query: `page`, `per_page` (see Pagination). Sorted by id, lowest first. Soft-deleted properties excluded.

**200**: paginated response (see Conventions).
**400**: invalid `page` / `per_page`.

### Get one property

`GET /api/properties/<id>`

**200**: the property object (not wrapped in `data`).
**404**: `{ "errors": { "id": ["Property not found"] } }`

### Get linked records

`GET /api/properties/<id>/links`

Returns a short summary of the records linked to the property. Only the opportunity is returned for now; the operation and works will be added when those features exist.

```json
{
  "success": true,
  "data": [
    { "type": "opportunity", "id": 1, "code": "OPO-1", "phase": "novo" }
  ]
}
```

`phase` is the name of the opportunity's current phase.

> **Known issue:** if the property has no opportunity, `data` currently contains a single placeholder entry, `{ "type": "opportunity" }`, instead of being empty. Remove this note once fixed.

**200**: the object above.
**404**: `{ "errors": { "id": ["Property not found"] } }`

### Create a property

`POST /api/properties/add`

Header `Content-Type: application/json`, plus `X-CSRFToken`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `address` | string | **yes** | 1 to 512 characters |
| `typology` | string | **yes** | 1 to 512 characters, e.g. `T2` |
| `zone` | string | **yes** | 1 to 512 characters |
| `area_m2` | decimal string | **yes** | greater than 0, up to 1 000 000 |
| `asking_price` | decimal string | **yes** | greater than 0, up to 1 000 000 000 |
| `vvr` | decimal string | **yes** | greater than 0, up to 1 000 000 000 |
| `profit` | decimal string | **yes** | may be negative, from -1 000 000 000 to 1 000 000 000 |
| `max_proposal` | decimal string | **yes** | greater than 0, up to 1 000 000 000. Must be greater than or equal to `first_proposal` |
| `first_proposal` | decimal string | **yes** | greater than 0, up to 1 000 000 000. Must be less than or equal to `max_proposal` |
| `visit_date` | datetime (ISO 8601) | **yes** | no timezone handling yet; send the local date and time |
| `source_url` | string | **yes*** | `http` or `https` URL, max 2048 characters |
| `notes` | string | no | max 10 000 characters |
| `admin_location` | string | no | max 512 characters |
| `property_type` | string | no | max 512 characters |
| `property_condition` | string | no | max 512 characters |
| `construction_year` | integer | no | 1800 or later. Must be a JSON integer, not a string |
| `matricial_article` | string | no | max 512 characters |
| `predial_description` | string | no | max 10 000 characters |
| `usage_license` | string | no | max 512 characters |
| `energy_certificate` | string | no | max 512 characters |

\* The validator treats `source_url` as optional, but the database column is `NOT NULL`, so omitting it or sending `null` currently fails with a `500`. Always send it until this is fixed.

Strings are trimmed. A blank string sent for an optional field is stored as `null`. Unknown fields are rejected.

**201**: the created property object.
**400**: validation errors (`{ "errors": {...} }`), or body is not JSON (`{ "errors": { "body": ["Request body must be valid JSON"] } }`).
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

### Search properties

`GET /api/properties/search`

| Param | Required | Notes |
|---|---|---|
| `q` | no | at least 2 characters, max 512 |
| `zone` | no | exact match on `zone`, case-insensitive |
| `property_condition` | no | exact match on `property_condition`, case-insensitive |
| `page`, `per_page` | no | see Pagination |

Filters combine with AND. `q` is a case-insensitive substring match on `zone`, `address` and `typology`. `%` and `_` in `q` are matched literally, not as wildcards. A blank `q`, `zone` or `property_condition` is ignored, so calling the endpoint with no parameters returns every property, like the list endpoint. Results are sorted by id, lowest first; soft-deleted properties are excluded. Other query parameters are ignored.

> `sort` and `order` are validated (`sort` must be one of `visit_date`, `asking_price`, `profit`, `area_m2`, `address`, `zone`, `id`; `order` must be `asc` or `desc`) but not applied yet. Invalid values return `400`.

**200**: paginated response. No matches gives `"data": []` and `"total": 0`.
**400**: `q` shorter than 2 characters, invalid `sort` / `order`, or invalid pagination values.
**500**: `{ "errors": { "server": ["Internal server error"] } }`

### Edit a property

`PATCH /api/properties/<id>`

Header `Content-Type: application/json`, plus `X-CSRFToken`. Send only the fields you want to change; the rest are untouched. Field rules are the same as for creation, but no field is required. At least one field must be sent.

The rule that `first_proposal` cannot exceed `max_proposal` is checked against the values the property will have after the update (stored plus sent), so sending only `first_proposal` with a value above the stored `max_proposal` is rejected.

**200**: the updated property object.
**400**: validation errors (an empty body returns `{ "errors": { "_schema": ["At least one field must be provided."] } }`), or body is not JSON.
**404**: `{ "errors": { "id": ["Property not found"] } }`
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

### Delete a property

`DELETE /api/properties/<id>`

Header `X-CSRFToken`. No body.

This is a soft delete: the property is marked as deleted and disappears from list, search and zones, but the row stays in the database. There is no restore endpoint.

**204**: empty body.
**404**: `{ "errors": { "id": ["Property not found"] } }` (also returned if the property is already deleted)
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

---

## Zone endpoints

### List zones

`GET /api/properties/zones`

Returns the distinct zone names used by non-deleted properties, sorted A to Z. Useful to fill a filter dropdown for the `zone` search parameter. Not paginated.

```json
["Baixa", "Santo António"]
```

**200**: array of strings.
