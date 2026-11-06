"""pytest tests, running against a real (throwaway) Postgres database.

Safety: tests only ever touch a database whose name ends in "_test"
(default: propdb_test), created at the start of the run and dropped at the end.
The dev/prod database is never used.

Needs a reachable Postgres. Locally: `docker compose up -d db`.
Connection comes from env vars (loaded from .env if present):
    POSTGRES_ADMIN_PASSWORD   password of the "postgres" admin role (required)
    TEST_DB_HOST              default: localhost
    TEST_DB_PORT              default: 5432
    TEST_DB_ADMIN_USER        default: postgres
    TEST_DB_NAME              default: propdb_test   (must end in "_test")
"""
import os

import pytest
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

load_dotenv()  # no-op in CI, where env vars are set directly

from app import create_app  # noqa: E402  (after load_dotenv: Config reads env)
from app.config import Config  # noqa: E402
from app.extensions import db  # noqa: E402
from app.models import User, Role  # noqa: E402
from app.security import hash_password  # noqa: E402

OWNER_USER = "test-owner@example.test"
INVESTOR_USER = "test-investor@example.test"
TEST_PASSWORD = "fake-test-password-123"  # fake, not a real secret

ROLES = ["investidor", "client", "Filler"]

TEST_DB_NAME = os.environ.get("TEST_DB_NAME", "propdb_test")
assert TEST_DB_NAME.endswith("_test"), "refusing to run: test DB name must end in _test"


def _url(database: str) -> URL:
    return URL.create(
        "postgresql+psycopg",
        username=os.environ.get("TEST_DB_ADMIN_USER", "postgres"),
        password=os.environ["POSTGRES_ADMIN_PASSWORD"],
        host=os.environ.get("TEST_DB_HOST", "127.0.0.1"),
        port=int(os.environ.get("TEST_DB_PORT", "5432")),
        database=database,
    )


class TestConfig(Config):
    TESTING = True
    IS_PROD = False
    SQLALCHEMY_DATABASE_URI = _url(TEST_DB_NAME).render_as_string(hide_password=False)
    SQLALCHEMY_ENGINE_OPTIONS = {}
    WTF_CSRF_ENABLED = False  # we test contacts, not Flask-WTF
    SECRET_KEY = "test-only-secret"
    SESSION_COOKIE_SECURE = False  # test client talks plain http
    REMEMBER_COOKIE_SECURE = False


@pytest.fixture(scope="session", autouse=True)
def test_database():
    """Create a fresh empty test database for the whole run, drop it after."""
    admin = create_engine(_url("postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}" WITH (FORCE)'))
        conn.execute(text(f'CREATE DATABASE "{TEST_DB_NAME}"'))
    yield
    with admin.connect() as conn:
        conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}" WITH (FORCE)'))
    admin.dispose()


@pytest.fixture
def app(test_database):
    app = create_app(TestConfig)
    with app.app_context():
        # Last line of defence: never create/drop tables outside the test DB.
        assert db.engine.url.database == TEST_DB_NAME
        db.create_all()
        for username, level in ((OWNER_USER, "owner"), (INVESTOR_USER, "investor")):
            db.session.add(
                User(
                    username=username,
                    email=username,
                    password_hash=hash_password(TEST_PASSWORD),
                    access_level=level,
                )
            )
        for role in ROLES:
            db.session.add(
                Role(name=role)
            )
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()
        db.engine.dispose()


def _login(app, username):
    c = app.test_client()
    res = c.post("/login", data={"username": username, "password": TEST_PASSWORD})
    assert res.status_code == 302, "test login failed, check conftest/login route"
    return c


@pytest.fixture
def client(app):
    """Logged in as an owner."""
    return _login(app, OWNER_USER)


@pytest.fixture
def investor_client(app):
    """Logged in as a non-owner."""
    return _login(app, INVESTOR_USER)


@pytest.fixture
def anon_client(app):
    """Not logged in."""
    return app.test_client()