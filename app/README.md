# Application package

This directory contains the first-stage Flask application for ImoVentures. It is
a small working prototype, not yet a complete property-management system. The
current code demonstrates authentication, role-aware property visibility, and
basic access to the database. Some names and boundaries are provisional and may
change as product requirements become clearer.

For repository-wide installation, Docker, and environment setup, see the root
[README](../README.md). This document focuses on the application package.

## Current functionality

The application currently includes:

- Login and logout; users are created through a Flask CLI command, not public
  registration.
- `owner` and `investor` user roles.
- An account page showing the signed-in user's name and role.
- A property JSON endpoint that returns all properties to owners and only
  invested properties to investors.
- An owner-only JSON endpoint listing investor usernames.
- A public health endpoint that checks the PostgreSQL connection.

These are examples and scaffolding for ongoing development. There is no complete
property, investment, opportunity, or project-management workflow yet.

## Package structure today

```text
app/
├── __init__.py          Application creation, configuration, extensions,
│                        authentication, access control, and current routes
├── cli.py               Flask CLI command for creating users
├── extensions.py        Argon2 password hashing and verification
├── models.py            SQLAlchemy models and database extension
├── templates/
│   ├── account.html     Minimal signed-in account page
│   └── login.html       Login form
└── README.md            This package guide
```

The current implementation places most application setup and routes in
`__init__.py`. Keep changes consistent with the existing code for now; avoid
introducing a larger architecture before the application needs it.

## Routes and illustrative mocks

All endpoints require authentication by default except `/login`, `/health`, and
Flask's static-file endpoint. The examples below show response shapes only;
they are not seeded data or a promise that matching records exist.

| Method and path | Access | Behavior |
|---|---|---|
| `GET /health` | Public | Checks that PostgreSQL is reachable. |
| `GET /login` | Public | Displays the login form. |
| `POST /login` | Public | Validates credentials and starts a session. |
| `POST /logout` | Authenticated | Clears the session and redirects to login. |
| `GET /` | Authenticated | Redirects to `/account`. |
| `GET /account` | Authenticated | Displays the current username and role. |
| `GET /properties` | Authenticated | Returns properties visible to the current user. |
| `GET /admin/investors` | Owner only | Lists investor IDs and usernames. |

### `GET /health`

Successful response (`200`):

```json
{
  "status": "ok",
  "database": "connected"
}
```

Database unavailable response (`503`):

```json
{
  "status": "error",
  "database": "unreachable"
}
```

### `GET /properties`

Example response:

```json
[
  {
    "id": 1,
    "name": "Sample apartment",
    "address": "10 Example Street",
    "status": "under_review"
  }
]
```

An empty result is `[]`. The current `Property` model does not validate or
enumerate status values.

### `GET /admin/investors`

Example response:

```json
[
  {
    "id": 2,
    "username": "sample-investor"
  }
]
```

An investor calling this endpoint receives `403`. Requests for protected
endpoints without a valid session are redirected to login. The login form
requires its rendered CSRF token when submitted.

## Data models

The active SQLAlchemy models in `models.py` are intentionally small:

- **User**: unique username, password hash, and `owner` or `investor` role.
- **Property**: name, optional address, and optional status.
- **Investment**: association between an investor and a property, with a
  positive amount. The investor/property pair is the composite primary key.

These models are the application's current ORM schema. The larger domain model
in the repository's database documentation is future design/reference material;
it should not be assumed to be available through this package.

## Authentication and authorization conventions

- Private endpoints are protected centrally by the request hook in
  `__init__.py`; public endpoints must be deliberately added to
  `PUBLIC_ENDPOINTS`.
- Use `owner_required` for endpoints restricted to owners.
- Filter records in the database query according to the current user's role.
  Do not rely on hiding unauthorized records only in a template or response.
- Passwords are hashed with Argon2. Never store or log plaintext passwords.
- User creation requires a password of at least 12 characters.
- Login uses a generic failure message, CSRF protection, and rate limiting.
- Keep post-login redirects local and session handling protected.

These rules describe the existing prototype. Revisit and test them as new roles,
authentication flows, and APIs are introduced.

## Local development notes

Use the root README for environment setup and Docker Compose commands. The
application expects `SECRET_KEY` and a database URL in its environment. Normal
application requests use `DATABASE_URL`; set `RUN_MIGRATIONS` when running
migrations so the app uses `MIGRATION_DATABASE_URL`.

Useful Flask commands when running through the repository's Compose service:

```powershell
docker compose run --rm -e RUN_MIGRATIONS=1 web flask db upgrade
docker compose run --rm web flask --app app create-user username owner
```

There is currently no test suite under `app/`. When adding tests, prioritize
route behavior, authentication and role boundaries, and model constraints.

## Future organization (not implemented)

The package may be reorganized as the feature set grows. As such, a new folder system might be created, separating routes and other functionalities into designated paths. An example follows, not to be considered a final solution:

```text
app/
├── __init__.py             Application factory and extension initialization
├── extensions.py           Shared Flask extension instances
├── auth/                   Login, logout, and account-related routes
├── properties/             Property routes and property-specific logic
├── investments/            Investment routes and business rules
├── models/                 Domain models, if the model set becomes substantial
├── templates/              Templates, optionally grouped by feature
└── services/               Shared business workflows when distinct from routes
```

Make structural changes incrementally and preserve route behavior, access
control, and migration discovery. Avoid creating empty folders or layers solely
to match this illustrative future layout.
