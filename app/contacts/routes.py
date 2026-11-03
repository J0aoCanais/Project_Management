from flask import Blueprint

contacts_bp = Blueprint("contacts", __name__, template_folder="../templates/contacts")

@contacts_bp.get("/")
def dashboard():
    return None