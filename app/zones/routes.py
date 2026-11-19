from flask import jsonify, request, Blueprint
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError
from http import HTTPStatus

from ..extensions import db
from ..models import Zone
from ..security import owner_required
from ..schemas.zones_schema import (
   ZoneResponseSchema,
   ZoneCreateSchema
)

# Schema Instances
zone_response_schema = ZoneResponseSchema()
zone_create_schema = ZoneCreateSchema()

zones_bp = Blueprint("zones", __name__)


@zones_bp.get("/")
@owner_required
def get_zones():
    """Return the list of zones to populate the frontend dropdown."""
    zones = db.session.execute(db.select(Zone).order_by(Zone.name.asc())).scalars().all()
    return jsonify(zone_response_schema.dump(zones, many=True)), HTTPStatus.OK


@zones_bp.post("/")
@owner_required
def create_zone():
    """Creates a new zone."""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST

    try:
        data = zone_create_schema.load(payload)

        zone = Zone(**data)
        db.session.add(zone)
        db.session.commit()

        return jsonify(zone_response_schema.dump(zone)), HTTPStatus.CREATED

    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except IntegrityError:
        db.session.rollback()
        return jsonify({"errors": {"name": ["A zone with this name already exists"]}}), HTTPStatus.CONFLICT

    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


@zones_bp.patch("/<int:zone_id>")
@owner_required
def update_zone(zone_id):
    """Updates the name of a zone."""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST

    zone = db.session.get(Zone, zone_id)
    if zone is None:
        return jsonify({"errors": {"id": ["Zone not found"]}}), HTTPStatus.NOT_FOUND

    try:
        data = zone_create_schema.load(payload)

        zone.name = data["name"]
        db.session.commit()

        return jsonify(zone_response_schema.dump(zone)), HTTPStatus.OK

    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except IntegrityError:
        db.session.rollback()
        return jsonify({"errors": {"name": ["A zone with this name already exists"]}}), HTTPStatus.CONFLICT

    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR

@zones_bp.delete("/<int:zone_id>")
@owner_required
def delete_zone(zone_id):
    """Deletes a zone by id."""
    zone = db.session.get(Zone, zone_id)
    if zone is None:
        return jsonify({"errors": {"id": ["Zone not found"]}}), HTTPStatus.NOT_FOUND

    try:
        db.session.delete(zone)
        db.session.commit()
        return "", HTTPStatus.NO_CONTENT
    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR