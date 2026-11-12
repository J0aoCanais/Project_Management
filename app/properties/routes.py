from flask import flash, jsonify, render_template, request, session, url_for, Blueprint
from datetime import datetime
from sqlalchemy import or_, func
from sqlalchemy.orm import selectinload
from marshmallow import ValidationError
from flask_login import current_user
from http import HTTPStatus

from ..extensions import db
from ..models import Property, Role
from ..security import owner_required
from ..schemas.properties_schema import (
    check_proposal_order,
    PropertyCreateSchema,
    PropertyResponseSchema,
    PropertyListSchema,
    PropertySearchSchema,
    PropertyUpdateSchema,
)

# Schema Instances
property_list_schema = PropertyListSchema()
property_create_schema = PropertyCreateSchema()
property_response_schema = PropertyResponseSchema()
search_schema = PropertySearchSchema()
property_update_schema = PropertyUpdateSchema()

properties_bp = Blueprint("properties", __name__)

#==============================
#  1.Auxiliary Endpoints
#==============================
@properties_bp.get("/zones")
@owner_required
def get_zones():
    stmt = (
        db.select(Property.zone)
        .where(Property.deleted_at.is_(None))
        .distinct()
        .order_by(Property.zone.asc())
    )
    
    zones = db.session.execute(stmt).scalars().all()
    
    return jsonify(zones), HTTPStatus.OK


#========================================
#  2.Property Read Endpoints (GET)
#========================================

@properties_bp.get("/")
@owner_required
def get_properties():
    """Lists properties with pagination."""
    try:
        params = property_list_schema.load(request.args)
    except ValidationError as error:
        return jsonify({"errors": error.messages}), HTTPStatus.BAD_REQUEST
    
    page = params["page"]
    per_page = params["per_page"]
    
    stmt = (
        db.select(Property)
        .order_by(Property.id.asc())
        .where(Property.deleted_at.is_(None))
    )
    
    pagination = db.paginate(
        stmt,
        page=page,
        per_page=per_page,
        error_out=False
    )    
    
    return jsonify({
        "success": True,
        "data": [property_response_schema.dump(c) for c in pagination.items],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), HTTPStatus.OK


@properties_bp.get("/<int:property_id>")
@owner_required
def get_property(property_id: int):
    """Returns the detailts of a specific property."""
    property = db.session.get(Property, property_id)
    if property is None:
        return jsonify({"errors": {"id": ["Property not found"]}}), HTTPStatus.NOT_FOUND
   
    return jsonify(property_response_schema.dump(property)), HTTPStatus.OK


@properties_bp.route("/search", methods=["GET"])
@owner_required
def search_properties():
    """Searches properties"""
    #TODO: define search fields. Temp fields are id, zone, address adn typology
    try:
        # Validate query parameters
        params = search_schema.load(request.args)
        
        stmt = (
            db.select(Property)
            .where(Property.deleted_at.is_(None))
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
                #TODO: naming conventions for properties: derive from id or set by user?
                Property.zone.ilike(pattern, escape="\\"),
                Property.address.ilike(pattern, escape="\\"),
                Property.typology.ilike(pattern, escape="\\")
            )
            stmt = stmt.where(conditions)
        
        zone_param = params.get("zone")
        if zone_param is not None:
            stmt = stmt.where(func.lower(Property.zone) == func.lower(zone_param))
        
        property_condition_param = params.get("property_condition")
        if property_condition_param is not None:
            stmt = stmt.where(func.lower(Property.property_condition) == func.lower(property_condition_param))
        
        stmt = stmt.order_by(Property.id.asc())

        # Paginate results
        pagination = db.paginate(
            stmt,
            page=params["page"],
            per_page=params["per_page"],
            error_out=False
        )

        return jsonify({
            "success": True,
            "data": [property_response_schema.dump(c) for c in pagination.items],
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

    except Exception as err:
        print(err)
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


#===============================================
#  2.Property Write Endpoints (POST/PATCH)
#===============================================

@properties_bp.route("/add", methods=["POST"])
@owner_required
def create_property():
    """Creates a new property"""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST
    
    try:
        data = property_create_schema.load(payload)
        
        new_property = Property(**data)
        
        db.session.add(new_property)
        db.session.commit()

        return jsonify(property_response_schema.dump(new_property)), HTTPStatus.CREATED

    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


@properties_bp.route("/<int:property_id>", methods=["PATCH"])
@owner_required
def edit_property(property_id):
    """Partially updates an existing property."""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST
    
    property = db.session.get(Property, property_id)
    if property is None or property.deleted_at is not None:
        return jsonify({"errors": {"id": ["Property not found"]}}), HTTPStatus.NOT_FOUND
   
    try:
        data = property_update_schema.load(payload, partial=True)
    except ValidationError as error:
        return jsonify({"errors": error.messages}), HTTPStatus.BAD_REQUEST
    
    try:        
        for key, value in data.items():
            setattr(property, key, value)
        
        try:
            check_proposal_order(property.first_proposal, property.max_proposal)
        except ValidationError as err:
            db.session.rollback()
            return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST
            
        db.session.commit()
        return jsonify(property_response_schema.dump(property)), HTTPStatus.OK
    
    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR



#===============================================
#  3.Property Delete Endpoint (DELETE)
#===============================================

@properties_bp.delete("/<int:property_id>")
@owner_required
def delete_property(property_id: int):
    """Soft deletes a property by marking it as deleted. 
    This makes the property not appear on search queries."""

    property = db.session.get(Property, property_id)
    if property is None or property.deleted_at is not None:
        return jsonify({"errors": {"id": ["Property not found"]}}), HTTPStatus.NOT_FOUND
 
    try:
        property.deleted_at = datetime.now()
        db.session.commit()
        return "", HTTPStatus.NO_CONTENT
    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


