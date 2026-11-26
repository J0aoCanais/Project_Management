# Leads API

Base URL (local development): `http://localhost:8000`
All lead endpoints live under **`/api/leads`**. Requests and responses are JSON.

---

## Authentication

Every lead endpoint requires a logged-in user with the **owner** access level. Authentication is session-cookie based; keep and resend cookies (`credentials: "include"` in `fetch`). Get a CSRF token from `GET /csrf-token`, log in with `POST /login`, fetch a fresh token after login, and send `X-CSRFToken` on every `POST` and `PATCH`. `GET` requests do not need the token.

---

## Conventions

**Errors.** Most validation errors return `400` with field messages:

```json
{ "errors": { "lead_source_id": ["Missing data for required field."] } }
```

Not-found errors from individual lead endpoints use `error` (singular), while create and contact-log errors generally use `errors`. List filter validation also uses `error`.

**Pagination.** `GET /api/leads` accepts `page` (default `1`, minimum `1`) and `per_page` (default `20`, `1` to `100`).

```json
{
  "success": true,
  "data": [ /* lead objects */ ],
  "pagination": {
    "page": 1, "per_page": 20, "total": 1, "pages": 1,
    "has_next": false, "has_prev": false
  }
}
```

---

## The lead object

The response schema exposes these fields:

```json
{
  "id": 1,
  "status": "Nova",
  "message": "Interesse num apartamento T2",
  "created_at": "2026-11-26T12:00:00",
  "lead_source_id": 1,
  "contact": {
    "id": 1,
    "name": "João Silva",
    "phone_number": "912345678",
    "zone": null
  },
  "referrer": null,
  "contact_logs": [],
  "property": null
}
```

The `contact` object includes only `id`, `name`, `phone_number` and `zone`. The response schema does not expose `discard_reason` or the lead source name. Although `referrer` is declared in the response schema, the model has no matching `referrer` attribute (it stores the optional reference as `contact_id1` / `contact1`), so the current API does not reliably return the saved referrer.

---

## Lead source endpoints

### List active lead sources

`GET /api/leads/lead-sources`

Returns active sources sorted by name. A lead must use an active source id. There is currently no API endpoint to create, edit or deactivate sources.

```json
[
  { "id": 1, "name": "Idealista", "is_active": true }
]
```

**200**: array of source objects.

---

## Lead endpoints

### Create a lead

`POST /api/leads` (also accepts `/api/leads/`)

Header `Content-Type: application/json`, plus `X-CSRFToken`.

Provide exactly one of `contact_id` or `new_contact`. `new_contact` uses the contact creation fields; `name` and `role_ids` are required, and `role_ids` must reference existing contact roles. An active `lead_source_id` is always required. The server assigns status `Nova` and the creation timestamp.

| Field | Type | Required | Notes |
|---|---|---|---|
| `lead_source_id` | integer | **yes** | id of an active source from the source endpoint |
| `contact_id` | integer | one contact option | id of an existing, non-deleted contact |
| `new_contact` | object | one contact option | contact payload; includes required `name` and `role_ids` |
| `message` | string or null | no | |
| `referrer_contact_id` | integer or null | no | existing contact id; cannot be the lead's contact |

The contact payload supports `name`, `role_ids`, `email`, `phone_number`, `address`, `company_name`, `zone_id`, `notes`, `nif`, `consent_given`, `consent_date` and `consent_channel`, following the [Contacts API](./contacts.md).

Unknown fields are rejected. In particular, `status` cannot be set during creation. `campaign_name`, `ad_name` and `form_name` are accepted by the create schema but are not Lead model fields; supplying them currently fails during persistence. Do not send them.

**201**: the created lead object.
**400**: invalid body, missing/invalid source, invalid contact data or invalid contact selection.
**404**: requested contact or referrer not found.
**500**: `{ "errors": { "server": ["Internal server error"] } }` (the create transaction is rolled back).

### List and filter leads

`GET /api/leads`

| Param | Notes |
|---|---|
| `status` | exact match: `Nova`, `Contactada`, `Qualificada`, `Convertida` or `Descartada` |
| `lead_source_id` | exact source id |
| `zone_id` | exact contact zone id |
| `search` | case-insensitive substring in contact name, email or phone number |
| `show_discarted` | boolean; misspelled parameter name as implemented. Defaults to false, hiding discarded leads |
| `page`, `per_page` | see Pagination |

Filters combine. Results are ordered newest first, and the response includes each lead's status. Invalid pagination, status or filter values return `400`.

**Date filters are not implemented.** Parameters such as `date_from` and `date_to` are ignored, including malformed values.

**200**: paginated response. Discarded leads are excluded unless `show_discarted=true`.

### Get one lead

`GET /api/leads/<id>`

**200**: one lead object (not wrapped in `data`).
**404**: `{ "error": "Lead not found" }`

### Update a lead

`PATCH /api/leads/<id>`

Header `Content-Type: application/json`, plus `X-CSRFToken`. Send one or more recognized fields:

| Field | Type | Notes |
|---|---|---|
| `status` | string | one of the five statuses listed above |
| `discard_reason` | string or null | required and non-blank when setting status to `Descartada` |
| `message` | string or null | |
| `lead_source_id` | integer | assigned without checking that the source is active or exists |
| `contact_id1` | integer or null | reference contact id |
| `campaign_name`, `ad_name`, `form_name` | string or null | schema accepts these, but they are not persisted as Lead model fields |

The API validates allowed status names but does not enforce an ordered transition path; any allowed status can be set directly. A successful response is the updated lead object. The current response schema omits `discard_reason`.

**200**: updated lead object.
**400**: invalid or empty body, invalid field values, or a discard without a non-blank reason.
**404**: `{ "error": "Lead not found" }`

### Record a contact log

`POST /api/leads/<id>/contact-logs`

Header `Content-Type: application/json`, plus `X-CSRFToken`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `channel` | string | **yes** | 1 to 512 characters |
| `responsible` | string | **yes** | 1 to 512 characters |
| `result` | string | **yes** | 1 to 512 characters |
| `notes` | string or null | no | max 10 000 characters |
| `contacted_at` | datetime | no | ISO 8601; defaults to current UTC time; cannot be more than five minutes in the future |

**201**: contact-log object.
**400**: invalid body or field values.
**404**: `{ "errors": { "id": ["Lead not found"] } }`

---
