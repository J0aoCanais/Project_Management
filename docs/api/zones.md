# Zones API

Base URL (local development): `http://localhost:8000`
All zone endpoints live under **`/api/zones`**. Requests and responses are JSON.

---

## Authentication

Every zones endpoint requires a logged-in user with the **owner** access level. Authentication is session-cookie based, so your HTTP client must store and resend cookies (`credentials: "include"` in `fetch`).

1. **Get a CSRF token**: `GET /csrf-token`. Also starts the session cookie.
2. **Log in**: `POST /login` as form data (`application/x-www-form-urlencoded`, not JSON) with fields `username` and `password`, and the header `X-CSRFToken: <token>`. Success is a `302` redirect to `/` and a new session cookie. A wrong username or password returns `200` with the login page again.
3. **Fetch a fresh CSRF token after logging in** (the session changed).
4. **Send `X-CSRFToken: <token>` on every `POST`, `PATCH` and `DELETE`.** `GET` requests don't need it.

Requests without a valid owner session are rejected and never reach the endpoint.

```bash
BASE=http://localhost:8000
curl -s -c cookies.txt $BASE/csrf-token
curl -i -b cookies.txt -c cookies.txt -X POST $BASE/login \
  -H "X-CSRFToken: <token>" \
  --data-urlencode "username=<user>" --data-urlencode "password=<pass>"
```

---

## Conventions

**String normalisation.** Leading and trailing whitespace is automatically stripped from string inputs.

**Errors.** Every error uses the `errors` key. Validation errors are `400` with field messages:

```json
{ "errors": { "name": ["Length must be between 1 and 512."] } }
```

Other errors use the same shape, keyed by what went wrong:

```json
{ "errors": { "id": ["Zone not found"] } }
{ "errors": { "name": ["A zone with this name already exists"] } }
{ "errors": { "server": ["Internal server error"] } }
```

---

## The zone object

```json
{
  "id": 1,
  "name": "North Zone"
}
```

---

## Zone endpoints

### List zones

`GET /api/zones/`

Sorted by name, A to Z. Not paginated.

**200**: array of zone objects.

### Create a zone

`POST /api/zones/`

Header `Content-Type: application/json`, plus `X-CSRFToken`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | **yes** | 1 to 512 characters, must be unique |

Unknown fields are rejected.

**201**: the created zone object.
**400**: validation errors (`{ "errors": {...} }`), or body is not JSON (`{ "errors": { "body": ["Request body must be valid JSON"] } }`).
**409**: `{ "errors": { "name": ["A zone with this name already exists"] } }` (the change is rolled back).
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

### Edit a zone

`PATCH /api/zones/<id>`

Header `Content-Type: application/json`, plus `X-CSRFToken`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | **yes** | 1 to 512 characters, must be unique |

Unknown fields are rejected.

**200**: the updated zone object.
**400**: validation errors, or body is not JSON.
**404**: `{ "errors": { "id": ["Zone not found"] } }`
**409**: `{ "errors": { "name": ["A zone with this name already exists"] } }` (the change is rolled back).
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

### Delete a zone

`DELETE /api/zones/<id>`

Header `X-CSRFToken`. No body.

This is a permanent delete: the zone row is removed from the database.

**204**: empty body.
**404**: `{ "errors": { "id": ["Zone not found"] } }`
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).