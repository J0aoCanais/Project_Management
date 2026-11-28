from http import HTTPStatus
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import LeadSource
from ..security import owner_required
from ..schemas.leads_schema import (
    LeadSourceResponseSchema,
    LeadSourceCreateSchema,
    LeadSourceUpdateSchema
)

lead_source_response_schema = LeadSourceResponseSchema()
lead_source_create_schema = LeadSourceCreateSchema()
lead_source_update_schema = LeadSourceUpdateSchema()

configs_bp = Blueprint("configs", __name__)


#########################
# Lead sources endpoints
########################

@configs_bp.get("/lead-sources")
@configs_bp.route("/lead-sources/", methods=["GET"])
@owner_required
def get_lead_sources():
    stmt = (
        db.select(LeadSource)
        .where(LeadSource.is_active.is_(True))
        .order_by(LeadSource.name.asc())
    )
    sources = db.session.execute(stmt).scalars().all()
    return jsonify(lead_source_response_schema.dump(sources, many=True)), HTTPStatus.OK


@configs_bp.post("/lead-sources")
@configs_bp.route("/lead-sources/", methods=["GET"])
@owner_required
def create_lead_source():
    """Creates a new lead source."""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST

    try:
        data = lead_source_create_schema.load(payload)

        lead_source = LeadSource(**data)
        db.session.add(lead_source)
        db.session.commit()

        return jsonify(lead_source_response_schema.dump(lead_source)), HTTPStatus.CREATED

    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except IntegrityError:
        db.session.rollback()
        return jsonify({"errors": {"name": ["A lead source with this name already exists"]}}), HTTPStatus.CONFLICT

    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR

@configs_bp.post("/lead-sources")
@configs_bp.route("/lead-sources/", methods=["POST"])
@owner_required
def update_lead_source(lead_source_id: int):
    """Updates an existing lead source."""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"errors": {"body": ["Request body must be valid JSON"]}}), HTTPStatus.BAD_REQUEST

    lead_source = db.session.get(LeadSource, lead_source_id)
    if lead_source is None:
        return jsonify({"errors": {"lead_source": ["Lead source not found"]}}), HTTPStatus.NOT_FOUND

    try:
        data = lead_source_update_schema.load(payload)

        for field, value in data.items():
            setattr(lead_source, field, value)

        db.session.commit()

        return jsonify(lead_source_response_schema.dump(lead_source)), HTTPStatus.OK

    except ValidationError as err:
        db.session.rollback()
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except IntegrityError:
        db.session.rollback()
        return jsonify({"errors": {"name": ["A lead source with this name already exists"]}}), HTTPStatus.CONFLICT

    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR