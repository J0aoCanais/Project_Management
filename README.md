# ImoVentures — Project Management

ImoVentures is a work-in-progress Flask application for managing property
investment projects. The current application is an authentication and data-access
prototype; it is not yet a complete property-management product.

## Current scope

The running application currently provides:

- Login and logout, with no public account registration.
- User roles: `owner` and `investor`.
- A properties endpoint that shows all properties to owners and only invested
  properties to investors.
- An owner-only endpoint for listing investor accounts.
- A database health check.

The active SQLAlchemy models and migrations cover `users`, `properties`, and
`investments`. The broader domain model documented in
[`docs/database/README.md`](docs/database/README.md) and
[`database/schema.sql`](database/schema.sql) is a design reference, not the
schema currently created by the application's migrations. Use migrations for
the running application; do not apply `database/schema.sql` to its database.

## Technology

- Python 3.12
- Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-Login, Flask-WTF
- PostgreSQL 16 with psycopg 3
- Argon2 password hashing
- Docker Compose for local development

## Local setup with Docker

Requirements: Docker Desktop with Docker Compose.

1. Copy the example environment file and replace every placeholder password and
   secret with a local value (See more details in [Configuration](#Configuration)). Do not commit `.env`.

   ```powershell
   Copy-Item .env.example .env
   ```

2. Start PostgreSQL. On its first initialization, Compose creates the
   `propdb` database and its restricted application and migration roles.

   ```powershell
   docker compose up -d db
   ```

3. Apply the application migrations using the database owner role:

   ```powershell
   docker compose run --rm -e RUN_MIGRATIONS=1 web flask db upgrade
   ```

4. Start the web application:

   ```powershell
   docker compose up --build
   ```

   or ,for a detached docker run, use:
   ```powershell
   docker compose up --build -d
   ```
   

   Open [http://localhost:8000](http://localhost:8000). The app redirects to
   login; no user is created automatically.

5. In the terminal, or a new one if docker isn't running detached, create an owner account. The CLI prompts for the
   password without echoing it and requires at least 12 characters.

   ```powershell
   docker compose run --rm web flask --app app create-user username owner
   ```

   Where `username` is the username and `owner` is the role.To create an investor, replace `owner` with `investor`.

The Compose setup mounts the project into the web container and enables
Gunicorn's development reload. This setup is intended for development. The Dockerfile's default Gunicorn command is intended for deployment; configure production secrets, database access, rate-limit storage, and HTTPS at deployment time.

## Configuration

`.env.example` lists the supported local settings:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Flask session and CSRF signing key; set a unique secret. |
| `POSTGRES_ADMIN_PASSWORD` | PostgreSQL administrator password used by Compose. |
| `APP_OWNER_PASSWORD` | Database owner password used for schema migrations. |
| `APP_USER_PASSWORD` | Restricted database password used by the running app. |
| `DATABASE_URL` | Application database URL. |
| `MIGRATION_DATABASE_URL` | Owner database URL, selected when `RUN_MIGRATIONS` is set. |
| `RATELIMIT_STORAGE_URI` | Optional shared Flask-Limiter storage URI; defaults to in-memory. |
| `FLASK_ENV` | Set to `production` to enable production cookie and proxy settings. |

The variables `SECRET_KEY`, `POSTGRES_ADMIN_PASSWORD`, `APP_OWNER_PASSWORD` and  `APP_USER_PASSWORD` must be changed, the remaining variables are setup to work accordingly.

Compose overrides the database host to `db` for containers. When running Flask
on the host, the example URLs use `127.0.0.1`. The in-memory rate-limit store is
for development only; use shared storage such as Redis when deploying multiple
workers.

## Useful commands

```powershell
# Start PostgreSQL (detached)
docker compose up -d

#Start and build if needed
docker compose up --build -d

# Check running containers
docker compose ps

# Check application and database connectivity
Invoke-RestMethod http://localhost:8000/health

# View application logs
docker compose logs -f web

# Stop services (keeps the database volume)
docker compose down

# Stop services and remove the local database volume
docker compose down --volumes

# Migrations, as app_owner
docker compose run --rm -e RUN_MIGRATIONS=1 web flask db upgrade
```

The last command permanently deletes the local Compose database data.

## Development guidelines

- Keep application behavior in the `app` package. Define new persisted entities
  in `app/models.py` and ensure they are loaded for Flask-Migrate.
- Change the active database schema through Alembic/Flask-Migrate revisions.
  Review generated migrations before applying them. Keep the domain reference
  SQL and its documentation clearly distinguished from active migrations.
- Treat routes as private by default. Add an endpoint to `PUBLIC_ENDPOINTS` only
  when it is intentionally public. For role-restricted functionality, follow
  the existing `owner_required` pattern.
- Enforce data visibility in database queries, not only in templates or
  responses. Use the existing property visibility query as the current example.
- Keep authentication protections in place: CSRF on forms, Argon2 password
  hashes, the minimum password length for CLI-created users, login rate
  limiting, and safe handling of post-login redirects.
- Never add credentials, `.env`, or real personal/financial data to source
  control. Use fictional data in examples and mocks.
- Add tests for new routes, authorization boundaries, and model constraints.
  There is currently no test suite in the repository.
- Update this README and the database documentation when setup steps, routes,
  active models, or schema status change.
- Update the requirements.txt when adding new dependencies. This will require building the docker image.

## Project layout

```text
app/                    Flask application, models, CLI, and templates
database/schema.sql     Domain-schema reference SQL
docs/database/          Database model documentation and diagrams
migrations/             Active Flask-Migrate/Alembic revisions
docker/init/            First-run PostgreSQL role and database setup
docker-compose.yml      Local PostgreSQL and web services
Dockerfile              Container image and Gunicorn entry point
```
