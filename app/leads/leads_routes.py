from typing import Any, cast
from datetime import datetime, timezone
from datetime import datetime, time
from http import HTTPStatus
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.extensions import csrf
from sqlalchemy.orm import joinedload
from sqlalchemy.orm import contains_eager, joinedload
from sqlalchemy import or_

from ..extensions import db
from ..models import Lead, Contact, LeadSource, Role
from ..security import owner_required
from ..contacts.routes import validate_contact_payload
from ..schemas.leads_schema import (
    LeadFilterSchema,
    LeadSourceResponseSchema,
    LeadCreateSchema,
    LeadResponseSchema,
    LeadUpdateSchema,
    LeadFilterSchema
)

lead_source_response_schema = LeadSourceResponseSchema()
lead_create_schema = LeadCreateSchema()
lead_response_schema = LeadResponseSchema()
lead_update_schema = LeadUpdateSchema()
lead_filter_schema = LeadFilterSchema()

leads_bp = Blueprint("leads", __name__, url_prefix="/leads")


@leads_bp.route("/lead-sources", methods=["GET"])
@owner_required
def get_lead_sources():
    stmt = (
        db.select(LeadSource)
        .where(LeadSource.is_active.is_(True))
        .order_by(LeadSource.name.asc())
    )
    sources = db.session.execute(stmt).scalars().all()
    return jsonify(lead_source_response_schema.dump(sources, many=True)), HTTPStatus.OK


@leads_bp.post("")
@leads_bp.route("/", methods=["POST"])
@owner_required
def create_lead():
    payload = request.get_json(silent=True)
    if not payload:
        return (
            jsonify({"errors": {"body": ["Request body must be valid JSON"]}}),
            HTTPStatus.BAD_REQUEST,
        )

    try:
        data = cast(dict[str, Any], lead_create_schema.load(payload))

        source_stmt = db.select(LeadSource).where(
            LeadSource.id == data["lead_source_id"], LeadSource.is_active.is_(True)
        )

        source = db.session.execute(source_stmt).scalars().first()
        if not source:
            return (
                jsonify(
                    {"errors": {"lead_source_id": ["Active lead source not found."]}}
                ),
                HTTPStatus.BAD_REQUEST,
            )

        if data.get("contact_id"):
            contact = db.session.get(Contact, data["contact_id"])
            if not contact:
                return (
                    jsonify({"errors": {"contact_id": ["Contact not found."]}}),
                    HTTPStatus.NOT_FOUND,
                )
            final_contact_id = contact.id

        else:
            contact_data = data["new_contact"]

            new_contact = validate_contact_payload(contact_data)

            db.session.add(new_contact)
            db.session.flush()
            final_contact_id = new_contact.id

        referrer_id = data.get("referrer_contact_id")
        if referrer_id is not None:
            referrer = db.session.get(Contact, referrer_id)
            if not referrer:
                db.session.rollback()
                return (
                    jsonify(
                        {
                            "errors": {
                                "referrer_contact_id": ["Referrer contact not found."]
                            }
                        }
                    ),
                    HTTPStatus.NOT_FOUND,
                )
            if referrer.id == final_contact_id:
                db.session.rollback()
                return (
                    jsonify(
                        {
                            "errors": {
                                "referrer_contact_id": [
                                    "A contact cannot refer themselves."
                                ]
                            }
                        }
                    ),
                    HTTPStatus.BAD_REQUEST,
                )

        data.pop("new_contact", None)
        data.pop("referrer_contact_id", None)

        data["status"] = "Nova"
        data["created_at"] = datetime.now(timezone.utc)
        data["contact_id"] = final_contact_id
        data["contact_id1"] = referrer_id

        new_lead = Lead(**data)

        db.session.add(new_lead)
        db.session.commit()

        return jsonify(lead_response_schema.dump(new_lead)), HTTPStatus.CREATED

    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"errors": {"server": ["Internal server error"]}}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


@leads_bp.route("", methods=["GET"])
@owner_required
def list_leads():
    try:
        raw_filters = lead_filter_schema.load(request.args)
    except ValidationError as err:
        return jsonify({"error": err.messages}), HTTPStatus.BAD_REQUEST

    filters = raw_filters if isinstance(raw_filters, dict) else {}

    stmt = db.select(Lead).options(joinedload(Lead.lead_source))

    if search_query := filters.get("search"):
        pattern = f"%{search_query}%"
        stmt = (
            stmt.join(Lead.contact)
            .options(contains_eager(Lead.contact))
            .where(
                or_(
                    Contact.name.ilike(pattern),
                    Contact.email.ilike(pattern),
                    Contact.phone_number.ilike(pattern),
                )
            )
        )
    else:
        stmt = stmt.options(joinedload(Lead.contact))

    if status := filters.get("status"):
        stmt = stmt.where(Lead.status == status)

    if source_id := filters.get("lead_source_id"):
        stmt = stmt.where(Lead.lead_source_id == source_id)

    if date_from := filters.get("date_from"):
        stmt = stmt.where(Lead.created_at >= datetime.combine(date_from.date(), time.min))

    if date_to := filters.get("date_to"):
        stmt = stmt.where(Lead.created_at <= datetime.combine(date_to.date(), time.max))

    leads = db.session.execute(stmt).scalars().all()

    return jsonify(lead_response_schema.dump(leads, many=True)), HTTPStatus.OK


@leads_bp.route("/<int:lead_id>", methods=["GET"])
@owner_required
def get_lead(lead_id: int):
    stmt = (
        db.select(Lead)
        .options(
            joinedload(Lead.contact),
            joinedload(Lead.lead_source),
            joinedload(Lead.contact1),
        )
        .where(Lead.id == lead_id)
    )
    lead = db.session.execute(stmt).scalar_one_or_none()
    if not lead:
        return jsonify({"error": "Lead not found"}), HTTPStatus.NOT_FOUND

    return jsonify(lead_response_schema.dump(lead)), HTTPStatus.OK


@leads_bp.route("/<int:lead_id>", methods=["PATCH"])
@owner_required
@csrf.exempt
def update_lead(lead_id: int):
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({"error": "Lead not found"}), HTTPStatus.NOT_FOUND

    data = request.get_json(silent=True)
    if not data:
        return (
            jsonify({"error": "Invalid or empty JSON payload"}),
            HTTPStatus.BAD_REQUEST,
        )

    try:
        validated_data = lead_update_schema.load(data, partial=True)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    if not isinstance(validated_data, dict):
        return jsonify({"error": "Expected a JSON object"}), HTTPStatus.BAD_REQUEST

    for field, value in validated_data.items():
        setattr(lead, field, value)

    db.session.commit()
    return jsonify(lead_response_schema.dump(lead)), HTTPStatus.OK
