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

@auth_bp.get("/api/me")
def me():
    """Utilizador da sessão. O frontend chama-o ao abrir: sem sessão, o pedido é
    redirecionado para /login (como qualquer página privada) antes de mostrar a aplicação."""
    return jsonify(_user_json(current_user))


def _authenticate(username: str, password: str):
    """Devolve o utilizador se as credenciais estiverem certas, senão None.
    Corre sempre uma verificação, mesmo para utilizadores que não existem (timing)."""
    user = db.session.execute(
        db.select(User).filter_by(email=username)
    ).scalar_one_or_none()
    stored = user.password_hash if user else DUMMY_HASH
    if not (verify_password(stored, password) and user is not None):
        return None
    if ph.check_needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)
        db.session.commit()
    return user


def _start_session(user) -> None:
    session.clear()           # avoid session fixation
    session.permanent = True
    login_user(user)


def _user_json(user):
    return {"id": user.id, "email": user.email, "access_level": user.access_level}


@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("5 per minute", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("demos.dashboard"))

    if request.method == "POST":
        user = _authenticate(request.form.get("username", "").strip(), request.form.get("password", ""))
        if user:
            _start_session(user)
            nxt = request.args.get("next")
            return redirect(nxt if is_safe_next(nxt) else url_for("demos.dashboard"))

        # Same message whether the username or the password was wrong.
        flash("Invalid username or password.")

    return render_template("login.html")


@auth_bp.post("/api/auth/login")
@limiter.limit("5 per minute")
def api_login():
    """Login da página React: JSON in, JSON out. Mesmas regras que /login."""
    body = request.get_json(silent=True) or {}
    username = str(body.get("username", "")).strip()
    password = str(body.get("password", ""))
    if not username or not password:
        return jsonify({"error": {"message": "Indique o email e a palavra-passe."}}), 400
    user = _authenticate(username, password)
    if not user:
        # A mesma mensagem quer o email quer a palavra-passe estejam errados.
        return jsonify({"error": {"message": "Email ou palavra-passe incorretos."}}), 401
    _start_session(user)
    return jsonify(_user_json(user))


@auth_bp.post("/api/auth/logout")
def api_logout():
    logout_user()
    session.clear()
    return "", 204


@auth_bp.post("/logout")
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("auth.login"))