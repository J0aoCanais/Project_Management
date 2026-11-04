"""Password hashing, permission decorators and app-wide security hooks."""

from functools import wraps
 
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from flask import abort, request
from flask_login import current_user
 
from .extensions import login_manager


# ----------------------------------------------------------------------------
# Password hashing
# ----------------------------------------------------------------------------

ph = PasswordHasher()  # Argon2id with sensible defaults


def hash_password(plain: str) -> str:
    return ph.hash(plain)

def verify_password(stored_hash: str, plain: str) -> bool:
    try:
        return ph.verify(stored_hash, plain)
    except (VerificationError, InvalidHashError):
        return False

# Create a real hash of a random string, verified against when the username doesn't
# exist, so response time doesn't reveal which usernames are valid.
DUMMY_HASH = hash_password("not-a-real-password")

# ----------------------------------------------------------------------------
# Permissions
# ----------------------------------------------------------------------------

def owner_required(view):
    """Wrapper function for endpoint that require owner level permissions"""
    from functools import wraps

    @wraps(view)
    def wrapper(*args, **kwargs):
        if current_user.access_level != "owner":
            abort(403)
        return view(*args, **kwargs)

    return wrapper

#Everything not listed here requires login, so a new blueprint is private by default
PUBLIC_ENDPOINTS = {"auth.login", "demos.health", "static", "auth.get_csrf_token"}
 

# Hooks applied to the entirety of the app (every Blueprint) 
def register_security_hooks(app):
    @app.before_request
    def require_login_everywhere():
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
