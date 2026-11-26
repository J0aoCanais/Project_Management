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
  "zone": { "id": 1, "name": "Baixa" },
  "property_type": "Apartment",
  "sale_motive": "Investment",
  "contact_owns": false,
  "lead_id": 900,
  "contact_id": 700,
  "address": "Rua Augusta, 100, Lisboa",
  "typology": "T2",
  "area_m2": "85.50",
  "asking_price": "350000.00",
  "vvr": "400000.00",
  "profit": "50000.00",
  "max_proposal": "320000.00",
  "first_proposal": "300000.00",
  "visit_date": "2026-11-10T00:00:00",
  "notes": null,
  "admin_location": null,
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
| `zone_id` | integer | **yes** | ID of an existing zone |
| `property_type` | string | **yes** | max 512 characters |
| `sale_motive` | string | **yes** | max 512 characters |
| `contact_owns` | boolean | **yes** | |
| `lead_id` | integer | **yes** | ID of an existing lead |
| `source_url` | string | no* | `http` or `https` URL, max 2048 characters |
| `address` | string or `null` | no | 1 to 512 characters when provided |
| `typology` | string or `null` | no | 1 to 512 characters, e.g. `T2` |
| `area_m2` | decimal string or `null` | no | greater than 0, up to 1 000 000 |
| `asking_price` | decimal string or `null` | no | greater than 0, up to 1 000 000 000 |
| `vvr` | decimal string or `null` | no | greater than 0, up to 1 000 000 000 |
| `profit` | decimal string or `null` | no | may be negative, from -1 000 000 000 to 1 000 000 000 |
| `max_proposal` | decimal string or `null` | no | greater than 0, up to 1 000 000 000. Must be greater than or equal to `first_proposal` |
| `first_proposal` | decimal string or `null` | no | greater than 0, up to 1 000 000 000. Must be less than or equal to `max_proposal` |
| `visit_date` | date (ISO 8601) or `null` | no | `YYYY-MM-DD` |
| `notes` | string or `null` | no | max 10 000 characters |
| `admin_location` | string or `null` | no | max 512 characters |
| `property_condition` | string or `null` | no | max 512 characters |
| `construction_year` | integer or `null` | no | 1800 or later. Must be a JSON integer, not a string |
| `matricial_article` | string or `null` | no | max 512 characters |
| `predial_description` | string or `null` | no | max 10 000 characters |
| `usage_license` | string or `null` | no | max 512 characters |
| `energy_certificate` | string or `null` | no | max 512 characters |

* The request schema permits omitting `source_url` or sending `null`, but the current model/database may reject it and return `500`; send a URL to avoid this.

Strings are trimmed. Optional fields may be omitted or sent as `null`; a blank string sent for an optional field is stored as `null`. Unknown fields are rejected.

**201**: the created property object.
**400**: validation errors (`{ "errors": {...} }`), or body is not JSON (`{ "errors": { "body": ["Request body must be valid JSON"] } }`).
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

### Search properties

`GET /api/properties/search`

| Param | Required | Notes |
|---|---|---|
| `q` | no | at least 2 characters, max 512 |
| `zone_id` | no | exact match on the zone ID |
| `typology` | no | exact match, case-insensitive |
| `property_type` | no | exact match, case-insensitive |
| `page`, `per_page` | no | see Pagination |

Filters combine with AND. `q` is a case-insensitive substring match on the zone name and address. `%`, `_` and `\` in `q` are matched literally, not as wildcards. A blank `q` is ignored, so calling the endpoint with no effective filters returns every property, like the list endpoint. Results are sorted by id, lowest first; soft-deleted properties are excluded. Unknown query parameters are ignored.

**200**: paginated response. No matches gives `"data": []` and `"pagination": { "total": 0, ... }`.
**400**: `q` is one character, invalid parameter values, or invalid pagination values.
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

Returns the distinct zone names used by non-deleted properties, sorted A to Z. Useful to fill a filter dropdown for the `zone_id` search parameter. Not paginated.

```json
["Baixa", "Santo António"]
```

**200**: array of strings.
