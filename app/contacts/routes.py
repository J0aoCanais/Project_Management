from flask import flash, jsonify, render_template, request, session, url_for, Blueprint
from datetime import datetime
from sqlalchemy import or_, and_
from sqlalchemy import selectinload
from marshmallow import ValidationError
from flask_login import current_user
from http import HTTPStatus

from ..extensions import db
from ..models import Contact, Role
from ..security import owner_required
from ..schemas.contacts_schema import (
    ContactCreateSchema,
    ContactResponseSchema,
    ContactSearchSchema,
    ContactListSchema,
    ContactUpdateSchema,
    RoleResponseSchema
)

# Schema Instances
contact_list_schema = ContactListSchema()
contact_create_schema = ContactCreateSchema()
contact_response_schema = ContactResponseSchema()
search_schema = ContactSearchSchema()
contact_update_schema = ContactUpdateSchema()
role_response_schema = RoleResponseSchema()

contacts_bp = Blueprint("contacts", __name__)


#==============================
#  1.Auxiliary Endpoints
#==============================

@contacts_bp.route("/roles", methods=["GET"])
@owner_required
def get_roles():
    """Return the list of roles to populate da frontend dropdown."""
    roles = db.session.execute(db.select(Role).order_by(Role.name.asc())).scalars().all()
    return jsonify(role_response_schema.dump(roles, many=True)), HTTPStatus.OK


#========================================
#  2.Contact Read Endpoints (GET)
#========================================

@contacts_bp.get("/")
@owner_required
def get_contacts():
    """Lists contacts with pagination."""
    try:
        params = contact_list_schema.load(request.args)
    except ValidationError as error:
        return jsonify({"errors": error.messages}), HTTPStatus.BAD_REQUEST
    
    page = params["page"]
    per_page = params["per_page"]
    
    stmt = (
        db.select(Contact)
        .options(selectinload(Contact.roles))
        .where(Contact.type != "investor")
        .order_by(Contact.name.asc())
    )
    
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


@contacts_bp.get("/<int:contact_id>")
@owner_required
def get_contact(contact_id: int):
    """Returns the detailts of a specific contact."""
    contact = db.session.get(Contact, contact_id)
    if contact is None:
        return jsonify({"errors": {"id": ["Contact not found"]}}), HTTPStatus.NOT_FOUND
    return jsonify(contact_response_schema.dump(contact)), HTTPStatus.OK


@contacts_bp.route("/search", methods=["GET"])
@owner_required
def search_contacts():
    """Searches contacts by name, email, phone, or NIF."""
    try:
        # Validate query parameters
        params = search_schema.load(request.args)
        
        stmt = (
            db.select(Contact)
            .options(selectinload(Contact.roles))
            .where(Contact.type != "investor")
        )

        search_term = params.get("q")
        if search_term and len(search_term.strip()) >= 2:
            search_term = (
                search_term.strip()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_")
            )
            pattern = f"%{search_term}%"
            
            conditions = or_(
                Contact.name.ilike(pattern, escape="\\"),
                Contact.email.ilike(pattern, escape="\\"),
                Contact.phone_number.ilike(pattern, escape="\\"),
                Contact.nif.ilike(pattern, escape="\\")
            )
            stmt = stmt.where(conditions)
        
        consent_param = params.get("consent")
        if consent_param is not None:
            stmt = stmt.where(Contact.consent_given == consent_param)
        
        role_id_param = params.get("role_id")
        if role_id_param is not None:
            stmt = stmt.join(Contact.roles).where(Role.id == role_id_param)
        
        stmt = stmt.order_by(Contact.name.asc())

        # Paginate results
        pagination = db.paginate(
            stmt,
            page=params["page"],
            per_page=params["per_page"],
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

    except Exception:
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


#===============================================
#  2.Contact Write Endpoints (POST/PATCH)
#===============================================

@contacts_bp.route("/add", methods=["POST"])
@owner_required
def create_contact():
    """Creates a new contact"""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST
    
    try:
        data = contact_create_schema.load(payload)
        
        role_ids = data.pop("role_ids", [])

        contact = Contact(**data)
        
        if role_ids:
            roles = db.session.execute(db.select(Role).where(Role.id.in_(role_ids))).scalars().all()
            contact.roles = roles

        db.session.add(contact)
        db.session.commit()

        return jsonify(contact_response_schema.dump(contact)), HTTPStatus.CREATED

    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


@contacts_bp.route("/<int:contact_id>", methods=["PATCH"])
@owner_required
def edit_contact(contact_id):
    """Partially updates an existing contact."""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST
    
    contact = db.session.get(Contact, contact_id)
    if not contact:
        return jsonify({"errors": {"id": ["Contact not found"]}}), HTTPStatus.NOT_FOUND
    
    try:
        data = contact_update_schema.load(payload, partial=True)
    except ValidationError as error:
        return jsonify({"errors": error.messages}), HTTPStatus.BAD_REQUEST
    
    try:
        role_ids = data.pop("role_ids", None)
        
        for key, value in data.items():
            setattr(contact, key, value)
        
        if role_ids is not None:
            roles = db.session.execute(db.select(Role).where(Role.id.in_(role_ids))).scalars().all()
            contact.roles = roles
            
        db.session.commit()
        return jsonify(contact_response_schema.dump(contact)), HTTPStatus.OK
    
    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR