"""Mainly Demo endpoints usefull for the development effort"""

from flask import current_app, jsonify, redirect, render_template, url_for, Blueprint
from sqlalchemy import text
 
from .extensions import db
from .security import owner_required
from .models import User

demos_bp = Blueprint("demos", __name__)
 
 
@demos_bp.get("/health")
def health():
    """Check that the app can reach Postgres, useful for development."""
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify(status="ok", database="connected")
    except Exception:
        current_app.logger.exception("Database health check failed")
        return jsonify(status="error", database="unreachable"), 503
 
 
@demos_bp.get("/")
def dashboard():
    return redirect(url_for("demos.account"))
 
 
@demos_bp.get("/account")
def account():
    """Demo endpoint to allow session account view and logout."""
    return render_template("account.html")

@demos_bp.get("/admin/investors")
@owner_required
def list_investors():
    """Example of a restricted endpoint accessible only to owner"""
    investors = db.session.execute(
        db.select(User).where(User.access_level == "investor").order_by(User.username)
    ).scalars().all()
    return jsonify([{"id": u.id, "username": u.username} for u in investors])