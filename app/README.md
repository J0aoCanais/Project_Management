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
- `owner` and `investor` access-levels.
- An account page showing the signed-in user's name and role.
- An owner-only JSON endpoint listing investor usernames.
- A public health endpoint that checks the PostgreSQL connection.

These are examples and scaffolding for ongoing development. There is no complete
property, investment, opportunity, or project-management workflow yet.

## Current package structure 

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
`__init__.py`. That is to be changed as the application grows.

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

The database, as shown in the most recent version available at [Database](../docs/database/), is modeled using SQLAlchemy models in `models.py`. Some exaples for this are:

- **User**: unique username and email, password hash, `owner` or `investor` access_level and last access. This table is related to the Audit logs and Contacts table. 
- **Property**: address, typology, zone, area_m2, etc. Related to documents and opportunity.

These models are defined using the conventions for SQLAlchemy. When updated we can update the database using the flask migrate. The necessary commands are:

```powershell
docker compose run --rm -e RUN_MIGRATIONS=1 web flask db migrate -m "message"
docker compose run --rm -e RUN_MIGRATIONS=1 web flask db upgrade
```

Before upgrading the generated migration file should  be reviewd and changed if necessary.

## Examples of database queries

By using SQLAlcuemy, databse queries can be made through predifined methods for the object database, an instance of SQLAlchemy. Some examples follow on how to query the database through this methods:

```
#Returns one user with the provided email
user = db.session.execute(
            db.select(User).filter_by(email=email)
        ).scalar_one_or_none()

#Returns all users with access level equal to investor ordered by username
investors = db.session.execute(
        db.select(User).where(User.access_level == "investor").order_by(User.username)
    ).scalars().all()
```

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
