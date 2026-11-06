from flask import flash, redirect, render_template, request, session, url_for, Blueprint, jsonify
from flask_login import current_user, login_user, logout_user
from flask_wtf.csrf import generate_csrf

from ..extensions import db, limiter, login_manager
from ..models import User
from ..security import DUMMY_HASH, hash_password, ph, verify_password

auth_bp = Blueprint("auth", __name__)


@login_manager.user_loader
def load_user(user_id):
    # Runs on every request: the access level always comes from the database,
    # and a deleted user's session stops working immediately.
    return db.session.get(User, int(user_id))


def is_safe_next(target) -> bool:
    return bool(
        target
        and target.startswith("/")
        and not target.startswith("//")
        and "\\" not in target
    )


@auth_bp.route("/csrf-token", methods=["GET"])
def get_csrf_token():
    return jsonify({
        "csrf_token": generate_csrf()
    })

@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("5 per minute", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("demos.dashboard"))

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
            return redirect(nxt if is_safe_next(nxt) else url_for("demos.dashboard"))

        # Same message whether the username or the password was wrong.
        flash("Invalid username or password.")

    return render_template("login.html")


@auth_bp.post("/logout")
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("auth.login"))