"""Configuration, read from environment variables."""
import os
from datetime import timedelta

from dotenv import load_dotenv

# Reads .env in development. In production there is no .env file and the
# variables come from the host's environment, so this does nothing.
load_dotenv()


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def normalize_db_url(url: str) -> str:
    """Make sure SQLAlchemy uses the psycopg (v3) driver."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def get_database_uri() -> str:
    """The running app connects as app_user (restricted).

    Migrations connect as app_owner, only when RUN_MIGRATIONS is set.
    """
    if os.environ.get("RUN_MIGRATIONS"):
        return normalize_db_url(require_env("MIGRATION_DATABASE_URL"))
    return normalize_db_url(require_env("DATABASE_URL"))


IS_PROD = os.environ.get("FLASK_ENV") == "production"


class Config:
    IS_PROD = IS_PROD
    SECRET_KEY = require_env("SECRET_KEY")

    # --- Database ---
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 5,
        "pool_recycle": 1800,
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- Session cookie ---
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = IS_PROD   # False locally (plain http://localhost)
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = timedelta(hours=8)

    # --- Rate limiter (use Redis in production with several workers) ---
    RATELIMIT_STORAGE_URI = os.environ.get("RATELIMIT_STORAGE_URI", "memory://")