import logging
from datetime import datetime, timezone
from decimal import Decimal
from http import HTTPStatus

from flask import Blueprint, jsonify, request
from flask_login import current_user
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Contact, Opportunity, Phase, Property, Lead, PhaseHistory
from ..schemas.opportunity_schema import (
    OpportunityCreateSchema,
    OpportunityResponseSchema,
)
from ..security import owner_required

logger = logging.getLogger(__name__)

opportunities_bp = Blueprint("opportunities", __name__)

opportunity_create_schema = OpportunityCreateSchema()
opportunity_response_schema = OpportunityResponseSchema()

# Every opportunity starts here. Phases are lookup data: seed this row in a
# migration so the id is guaranteed in every environment (dev, test, prod).
INITIAL_PHASE_ID = 1


def _to_money(value) -> Decimal:
    """Normalise to a 2-decimal Decimal (works whether the Property price
    columns are Numeric or still Float)."""
    return Decimal(str(value)).quantize(Decimal("0.01"))


def _fail(errors: dict, status: HTTPStatus):
    """Return an error and release the property row lock taken below."""
    db.session.rollback()
    return jsonify({"errors": errors}), status


def enter_phase(opportunity: Opportunity, phase: Phase, note: str=None):
    now = datetime.now(timezone.utc)

    opportunity.phase_id = phase.id
    opportunity.last_activity_at = now
    opportunity.phase_histories.append(
        PhaseHistory(phase_id=phase.id, changed_at=now, note=note)
    )


@opportunities_bp.post("/")
@owner_required
def create_opportunity():
    """Open an opportunity on a property.

    Body: property_id, contact_id, lead_id (+ optional costs and percentages).
    Server-set: phase (initial), purchase_price (= property asking price),
    expected_sale_price (= property VVR), last_activity_at (= now).
    """
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"errors": {"body": ["Request body must be a JSON object"]}}), HTTPStatus.BAD_REQUEST

    try:
        data = opportunity_create_schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    lead_id = data.pop("lead_id")

    # Lock the lead row for the rest of the transaction. Since lead_id is
    # no longer unique in the database, this serialises concurrent creates for
    # the same property so the duplicate check below cannot be raced.
    lead = db.session.get(Lead, lead_id, with_for_update=True)
    if lead is None:
        return _fail({"lead_id": ["Lead not found"]}, HTTPStatus.BAD_REQUEST)

    
    if lead.opportunity is not None:
        return _fail(
            {"lead_id": ["This lead already has an opportunity"]}, HTTPStatus.CONFLICT
        )

    phase = db.session.get(Phase, INITIAL_PHASE_ID)
    if phase is None:
        # Not the client's fault: the lookup data is missing.
        logger.error("Initial phase (id=%s) does not exist; seed the phase table", INITIAL_PHASE_ID)
        return _fail({"server": ["Internal server error"]}, HTTPStatus.INTERNAL_SERVER_ERROR)

    prop = lead.property

    # Server-controlled values go last so they always win.
    data = {
        **data,
        "purchase_price": _to_money(prop.asking_price),
        "expected_sale_price": _to_money(prop.vvr),
        "contact_id": lead.contact_id,
        "property_id": prop.id
    }
    opportunity = Opportunity(**data)
    opportunity.lead = lead

    enter_phase(opportunity, phase)

    try:
        db.session.add(opportunity)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        logger.warning("Integrity error creating opportunity for property %s", data["property_id"])
        return jsonify(
            {"errors": {"opportunity": ["Conflicts with existing data"]}}
        ), HTTPStatus.CONFLICT
    except Exception:
        db.session.rollback()
        logger.exception("Failed to create opportunity for property %s", data["property_id"])
        return jsonify(
            {"errors": {"server": ["Internal server error"]}}
        ), HTTPStatus.INTERNAL_SERVER_ERROR

    logger.info(
        "Opportunity %s created for property %s by user %s",
        opportunity.id, prop.id, current_user.id,
    )
    return jsonify(opportunity_response_schema.dump(opportunity)), HTTPStatus.CREATED

@opportunities_bp.delete("/<int:opportunity_id>")
@owner_required
def delete_opportunity(opportunity_id):
    #TODO: make this a clean soft/hard delete (To be Decided)
    """Naive delete of opportunity from db"""
    try:
        opportunity = db.session.get(Opportunity, opportunity_id)
        db.session.delete(opportunity)
        db.session.commit()
        return "", HTTPStatus.NO_CONTENT
    except Exception:
        db.session.rollback()
        return jsonify(
                    {"errors": {"server": ["Internal server error"]}}
                ), HTTPStatus.INTERNAL_SERVER_ERROR
        
