
#!/usr/bin/env bash
set -Eeuo pipefail

# Create roles and database.
psql \
  --username "$POSTGRES_USER" \
  --dbname postgres \
  --set ON_ERROR_STOP=1 \
  --set app_owner_password="$APP_OWNER_PASSWORD" \
  --set app_user_password="$APP_USER_PASSWORD" <<'SQL'

CREATE ROLE app_owner LOGIN PASSWORD :'app_owner_password';
CREATE ROLE app_user LOGIN PASSWORD :'app_user_password';

CREATE DATABASE propdb OWNER app_owner;

SQL

# Configure permissions in the project database.
psql \
  --username "$POSTGRES_USER" \
  --dbname propdb \
  --set ON_ERROR_STOP=1 <<'SQL'

REVOKE ALL ON DATABASE propdb FROM PUBLIC;
GRANT CONNECT ON DATABASE propdb TO app_user;

GRANT USAGE ON SCHEMA public TO app_user;

ALTER DEFAULT PRIVILEGES FOR ROLE app_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES FOR ROLE app_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

SQL
