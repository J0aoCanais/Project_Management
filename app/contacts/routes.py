from flask import flash, jsonify, render_template, request, session, url_for, Blueprint
from datetime import datetime
from sqlalchemy import or_
from marshmallow import ValidationError
from flask_login import current_user
from http import HTTPStatus

from ..extensions import db
from ..models import Contact
from ..security import owner_required

from ..schemas.contacts_schema import (
    ContactCreateSchema,
    ContactResponseSchema,
    ContactSearchSchema,
    ContactListSchema
)

contact_list_schema = ContactListSchema()
contact_create_schema = ContactCreateSchema()
contact_response_schema = ContactResponseSchema()
search_schema = ContactSearchSchema()

contacts_bp = Blueprint("contacts", __name__)

@contacts_bp.get("/")
@owner_required
def get_contacts():
    try:
        params = contact_list_schema.load(request.args)
    except ValidationError as error:
        return jsonify({"errors": error.messages}), HTTPStatus.BAD_REQUEST
    
    page = params["page"]
    per_page = params["per_page"]
    
    stmt = db.select(Contact).order_by(Contact.name.asc())
    pagination = db.paginate(
        stmt,
        page=page,
        per_page=per_page,
        error_out=False
    )    
    
    return jsonify({
        "success": True,
        "data": [contact_response_schema.dump(c) for c in pagination.items],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), HTTPStatus.OK


@contacts_bp.route("/add", methods=["POST"])
def create_contact():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST
    
    try:
        data = contact_create_schema.load(payload)

        contact = Contact(**data)
        db.session.add(contact)
        db.session.commit()

        return jsonify(contact_response_schema.dump(contact)), HTTPStatus.CREATED

    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except Exception:
        db.session.rollback()
        return jsonify({"error": "Internal server error"}),HTTPStatus.INTERNAL_SERVER_ERROR


@contacts_bp.route("/search", methods=["GET"])
def search_contacts():
    try:
        # Validate query parameters
        params = search_schema.load(request.args)

        search_term = params["q"].strip()
        page = params["page"]
        per_page = params["per_page"]

        if len(search_term) < 2:
            return jsonify({"error": "Search term must contain at least 2 characters"}), HTTPStatus.BAD_REQUEST

        # Escape SQL LIKE wildcard characters
        search_term = (
            search_term
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_")
        )

        pattern = f"%{search_term}%"

        # Search across contact fields
        conditions = or_(
            Contact.name.ilike(pattern, escape="\\"),
            Contact.email.ilike(pattern, escape="\\"),
            Contact.phone_number.ilike(pattern, escape="\\"),
            Contact.nif.ilike(pattern, escape="\\")
        )

        stmt = (
            db.select(Contact)
            .where(conditions)
            .order_by(Contact.name.asc())
        )

        # Paginate results
        pagination = db.paginate(
            stmt,
            page=page,
            per_page=per_page,
            error_out=False
        )

        return jsonify({
            "success": True,
            "data": [contact_response_schema.dump(c) for c in pagination.items],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }), HTTPStatus.OK

    except ValidationError as error:
        return jsonify({"errors": error.messages}), HTTPStatus.BAD_REQUEST