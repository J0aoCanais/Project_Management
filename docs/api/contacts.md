# Contacts API

Base URL (local development): `http://localhost:8000`
All contact endpoints live under **`/api/contacts`**. Requests and responses are JSON.

---

## Authentication

Every contacts endpoint requires a logged-in user with the **owner** access level. Authentication is session-cookie based, so your HTTP client must store and resend cookies (`credentials: "include"` in `fetch`).

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

**Hidden contacts.** Contacts that have the `investidor` role (matched case-insensitively) and soft-deleted contacts are hidden from the list and search endpoints. Investors can still be fetched or edited by id. Soft-deleted contacts return `404` on get, edit and delete.

**Errors.** Every error uses the `errors` key. Validation errors are `400` with field messages:

```json
{ "errors": { "email": ["Not a valid email address."] } }
```

Other errors use the same shape, keyed by what went wrong:

```json
{ "errors": { "id": ["Contact not found"] } }
{ "errors": { "server": ["Internal server error"] } }
```

**Pagination.** List and search accept `page` (default `1`, minimum `1`) and `per_page` (default `20`, `1` to `100`). Invalid values return `400`, e.g. `{ "errors": { "per_page": ["Not a valid integer."] } }`.

Paginated responses look like this:

```json
{
  "success": true,
  "data": [ /* contact objects */ ],
  "pagination": {
    "page": 1, "per_page": 20, "total": 1, "pages": 1,
    "has_next": false, "has_prev": false
  }
}
```

---

## The contact object

```json
{
  "id": 1,
  "name": "Zzyzx Qwertyuiop",
  "roles": [{ "id": 2, "name": "client" }],
  "email": "zzyzx@qwerty-test.example",
  "phone_number": "999000111",
  "address": null,
  "company_name": null,
  "zone": null,
  "notes": null,
  "nif": "999000111",
  "consent_given": null,
  "consent_date": null,
  "consent_channel": null
}
```

Unset optional fields come back as `null`.

---

## Contact endpoints

### List contacts

`GET /api/contacts/`

Query: `page`, `per_page` (see Pagination). Sorted by name, A to Z. Investors and soft-deleted contacts excluded.

**200**: paginated response (see Conventions).
**400**: invalid `page` / `per_page`.

### Get one contact

`GET /api/contacts/<id>`

**200**: the contact object (not wrapped in `data`).
**404**: `{ "errors": { "id": ["Contact not found"] } }`

### Create a contact

`POST /api/contacts/add`

Header `Content-Type: application/json`, plus `X-CSRFToken`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | **yes** | 1 to 512 characters |
| `role_ids` | integer or array of integers | **yes** | ids of existing roles (see Roles). A single integer is treated as a one-item list |
| `email` | string | no | must be a valid email |
| `phone_number` | string | no | |
| `address` | string | no | |
| `company_name` | string | no | |
| `zone` | string | no | |
| `notes` | string | no | |
| `nif` | string | no | |
| `consent_given` | boolean | no | |
| `consent_date` | datetime (ISO 8601) | no | |
| `consent_channel` | string | no | |

Unknown fields are rejected.

**201**: the created contact object.
**400**: validation errors (`{ "errors": {...} }`), or body is not JSON (`{ "errors": { "body": ["Request body must be valid JSON"] } }`).
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

### Search contacts

`GET /api/contacts/search?q=<text>`

| Param | Required | Notes |
|---|---|---|
| `q` | **yes** | at least 2 characters, max 512 |
| `role_id` | no | only contacts that have this role |
| `consent` | no | boolean, filters on `consent_given` |
| `page`, `per_page` | no | see Pagination |

Case-insensitive substring match on `name`, `email`, `phone_number` and `nif`. `%` and `_` in `q` are matched literally, not as wildcards. Results are sorted by name; investors and soft-deleted contacts are excluded.

**200**: paginated response. No matches gives `"data": []` and `"total": 0`.
**400**: `q` missing or too short, or invalid pagination values.
**500**: `{ "errors": { "server": ["Internal server error"] } }`

### Edit a contact

`PATCH /api/contacts/<id>`

Header `Content-Type: application/json`, plus `X-CSRFToken`. Send only the fields you want to change; the rest are untouched. Field rules are the same as for creation. If you send `role_ids`, it replaces the contact's whole set of roles; omit it to leave roles alone.

**200**: the updated contact object.
**400**: validation errors, or body is not JSON.
**404**: `{ "errors": { "id": ["Contact not found"] } }`
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

### Delete a contact

`DELETE /api/contacts/<id>`

Header `X-CSRFToken`. No body.

This is a soft delete: the contact is marked as deleted and disappears from list and search, but the row stays in the database. There is no restore endpoint.

**204**: empty body.
**404**: `{ "errors": { "id": ["Contact not found"] } }`
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

---

## Role endpoints

A role is `{ "id": 2, "name": "client" }`. Contacts reference roles through `role_ids`.

### List roles

`GET /api/contacts/roles`

Sorted by name, A to Z. Not paginated.

**200**: array of role objects.

### Create a role

`POST /api/contacts/roles`

Header `Content-Type: application/json`, plus `X-CSRFToken`. Body: `{ "name": "supplier" }`.

**201**: the created role object.
**400**: validation errors, or body is not JSON.
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).

### Delete a role

`DELETE /api/contacts/roles/<id>`

Header `X-CSRFToken`. No body.

**204**: empty body.
**404**: `{ "errors": { "id": ["Role not found"] } }`
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the change is rolled back).