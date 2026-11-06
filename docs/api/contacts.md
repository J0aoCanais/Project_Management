# Contacts API

Base URL (local development): `http://localhost:8000`
All contact endpoints live under **`/api/contacts`**. Requests and responses are JSON.

---

## Authentication

Every contacts endpoint requires a logged-in user with the **owner** access level. Authentication is session-cookie based, so your HTTP client must store and resend cookies (`credentials: "include"` in `fetch`).

1. **Get a CSRF token**: `GET /csrf-token`. Also starts the session cookie.
2. **Log in**: `POST /login` as form data (`application/x-www-form-urlencoded`, not JSON) with fields `username` and `password`, and the header `X-CSRFToken: <token>`. Success is a `302` redirect to `/` and a new session cookie. A wrong username or password returns `200` with the login page again.
3. **Fetch a fresh CSRF token after logging in** (the session changed).
4. **Send `X-CSRFToken: <token>` on every `POST` and `PATCH`.** `GET` requests don't need it.

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

**Contacts of type `investor` are hidden** from the list and search endpoints. (They can still be fetched or edited by id.)

**Errors.** Validation errors are `400` with field messages under `errors`:

```json
{ "errors": { "email": ["Not a valid email address."] } }
```

Other errors use a single message:

```json
{ "error": "Internal server error" }
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
  "type": "client",
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

## Endpoints

### List contacts

`GET /api/contacts/`

Query: `page`, `per_page` (see Pagination). Sorted by name, A to Z. Investors excluded.

**200**: paginated response (see Conventions).
**400**: invalid `page` / `per_page`.

### Get one contact

`GET /api/contacts/<id>`

**200**: the contact object (not wrapped in `data`).
**404**: `{ "error": "Contact not found" }`

### Create a contact

`POST /api/contacts/add`

Header `Content-Type: application/json`, plus `X-CSRFToken`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | **yes** | 1 to 512 characters |
| `type` | string | **yes** | 1 to 512 characters, e.g. `client`, `supplier`, `investor` |
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
**500**: `{ "error": "Internal server error" }` (the change is rolled back).

### Search contacts

`GET /api/contacts/search?q=<text>`

| Param | Required | Notes |
|---|---|---|
| `q` | **yes** | at least 2 characters, max 512 |
| `page`, `per_page` | no | see Pagination |

Case-insensitive substring match on `name`, `email`, `phone_number` and `nif`. `%` and `_` in `q` are matched literally, not as wildcards. Results are sorted by name; investors are excluded.

**200**: paginated response. No matches gives `"data": []` and `"total": 0`.
**400**: `q` missing or too short, or invalid pagination values.

### Edit a contact

`PATCH /api/contacts/<id>`

Header `Content-Type: application/json`, plus `X-CSRFToken`. Send only the fields you want to change; the rest are untouched. Field rules are the same as for creation.

**200**: the updated contact object.
**400**: validation errors, or body is not JSON.
**404**: `{ "errors": { "id": ["Contact not found"] } }`
**500**: `{ "error": "Internal server error" }`

---

## Not available yet

There is no delete endpoint.
