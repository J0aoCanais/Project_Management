import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import (
    Flask,
    abort,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from sqlalchemy import text
from werkzeug.middleware.proxy_fix import ProxyFix

from .models import User, db
from .extensions import ph, hash_password, verify_password
from .cli import register_cli
from .contacts.contacts import contacts_bp

# Reads .env in development. In production there is no .env file and the
# variables come from the host's environment, so this does nothing.
load_dotenv()


# ----------------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------------
def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def normalize_db_url(url: str) -> str:
    """Make sure SQLAlchemy uses the psycopg (v3) driver.

    Hosts like Render/Heroku give URLs starting with postgres:// or postgresql://.
    """
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

app = Flask(__name__)
app.config.update(
    SECRET_KEY=require_env("SECRET_KEY"),
    # --- Database connection ---
    SQLALCHEMY_DATABASE_URI=get_database_uri(),
    SQLALCHEMY_ENGINE_OPTIONS={
        "pool_pre_ping": True,   # test connections before use (handles dropped ones)
        "pool_size": 5,
        "max_overflow": 5,
        "pool_recycle": 1800,
    },
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    # --- Session cookie ---
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=IS_PROD,   # False locally: plain http://localhost
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
)

# Behind a reverse proxy (Render, Nginx, ...) so Flask sees the real scheme/IP.
if IS_PROD:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# --- Extensions ---
db.init_app(app)
register_cli(app)
migrate = Migrate(app, db)
csrf = CSRFProtect(app)

login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.session_protection = "strong"

limiter = Limiter(
    get_remote_address,
    app=app,
    # In-memory counters don't work across several workers: use Redis in production,
    # e.g. RATELIMIT_STORAGE_URI=redis://...
    storage_uri=os.environ.get("RATELIMIT_STORAGE_URI", "memory://"),
)


# Create a real hash of a random string, verified against when the username doesn't
# exist, so response time doesn't reveal which usernames are valid.
DUMMY_HASH = hash_password("not-a-real-password")


# ----------------------------------------------------------------------------
# Authentication
# ----------------------------------------------------------------------------
@login_manager.user_loader
def load_user(user_id):
    # Runs on every request: the role always comes from the database, and a
    # deleted user's session stops working immediately.
    return db.session.get(User, int(user_id))


def is_safe_next(target) -> bool:
    return bool(
        target
        and target.startswith("/")
        and not target.startswith("//")
        and "\\" not in target
    )


# Everything requires login by default, so a forgotten decorator can't expose a route.
PUBLIC_ENDPOINTS = {"login", "health", "static"}


@app.before_request
def require_login_everywhere():
    """Validate that an user is authenticated before accessing a private endpoint"""
    
    if request.endpoint is None or request.endpoint in PUBLIC_ENDPOINTS:
        return None
    if not current_user.is_authenticated:
        return login_manager.unauthorized()
    return None


@app.after_request
def no_store_for_private_pages(response):
    # Stops browsers caching logged-in pages (back button after logout).
    if current_user.is_authenticated:
        response.headers["Cache-Control"] = "no-store"
    return response


@app.route("/login", methods=["GET", "POST"])
@limiter.limit("5 per minute", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        user = db.session.execute(
            db.select(User).filter_by(email=username)
        ).scalar_one_or_none()

        # Always run one verification, even for unknown users (timing).
        stored = user.password_hash if user else DUMMY_HASH
        ok = verify_password(stored, password) and user is not None

        if ok:
            if ph.check_needs_rehash(user.password_hash):
                user.password_hash = hash_password(password)
                db.session.commit()
            session.clear()           # avoid session fixation
            session.permanent = True
            login_user(user)
            nxt = request.args.get("next")
            return redirect(nxt if is_safe_next(nxt) else url_for("dashboard"))

        # Same message whether the username or the password was wrong.
        flash("Invalid username or password.")

    return render_template("login.html")


@app.post("/logout")
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("login"))


def owner_required(view):
    """Wrapper function for endpoint that require owner level permissions"""
    from functools import wraps

    @wraps(view)
    def wrapper(*args, **kwargs):
        if current_user.access_level != "owner":
            abort(403)
        return view(*args, **kwargs)

    return wrapper

# ----------------------------------------------------------------------------
# Routes
# ----------------------------------------------------------------------------
@app.get("/health")
def health():
    """Check that the app can reach Postgres, usefull for development."""
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify(status="ok", database="connected")
    except Exception:
        app.logger.exception("Database health check failed")
        return jsonify(status="error", database="unreachable"), 503


@app.get("/")
def dashboard():
    return redirect(url_for("account"))

@app.get("/account")
def account():
    """Demo endpoint to allow session account view and logout"""
    return render_template("account.html")

@app.get("/admin/investors")
@owner_required
def list_investors():
    """Example of a restricted endpoint accessible only to owner"""
    investors = db.session.execute(
        db.select(User).where(User.access_level == "investor").order_by(User.username)
    ).scalars().all()
    return jsonify([{"id": u.id, "username": u.username} for u in investors])

