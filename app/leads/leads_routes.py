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
from ..schemas.leads_schema import (
    LeadSourceResponseSchema,
    LeadCreateSchema,
    LeadResponseSchema,
    LeadUpdateSchema,
)

lead_source_response_schema = LeadSourceResponseSchema()
lead_create_schema = LeadCreateSchema()
lead_response_schema = LeadResponseSchema()
lead_update_schema = LeadUpdateSchema()

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
@csrf.exempt
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
            role_ids = contact_data.pop("role_ids", []) or []

            new_contact = Contact(
                name=contact_data["name"],
                email=contact_data.get("email"),
                phone_number=contact_data.get("phone_number"),
                address=contact_data.get("address"),
                company_name=contact_data.get("company_name"),
                zone=contact_data.get("zone"),
                notes=contact_data.get("notes"),
                nif=contact_data.get("nif"),
                consent_given=contact_data.get("consent_given", False),
                consent_date=(
                    datetime.now(timezone.utc)
                    if contact_data.get("consent_given")
                    else None
                ),
                consent_channel=contact_data.get("consent_channel"),
            )

            if role_ids:
                roles_stmt = db.select(Role).where(Role.id.in_(role_ids))
                new_contact.roles = list(db.session.execute(roles_stmt).scalars().all())

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

        new_lead = Lead(
            status="Nova",
            message=data.get("message"),
            created_at=datetime.now(timezone.utc),
            campaign_name=data.get("campaign_name"),
            ad_name=data.get("ad_name"),
            form_name=data.get("form_name"),
            lead_source_id=source.id,
            contact_id=final_contact_id,
            contact_id1=referrer_id,
        )

        db.session.add(new_lead)
        db.session.commit()

        return jsonify(lead_response_schema.dump(new_lead)), HTTPStatus.CREATED

    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    except Exception:
        db.session.rollback()
        return (
            jsonify({"errors": {"server": ["Internal server error"]}}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


@leads_bp.route("", methods=["GET"])
@owner_required
def list_leads():
    status_filter = request.args.get("status", "").strip()
    search_query = request.args.get("search", "").strip()
    source_id = request.args.get("lead_source_id", type=int)
    date_from = request.args.get("date_from", "").strip()
    date_to = request.args.get("date_to", "").strip()

    stmt = db.select(Lead).options(joinedload(Lead.lead_source))

    if search_query:
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

    if status_filter:
        stmt = stmt.where(Lead.status == status_filter)

    if source_id:
        stmt = stmt.where(Lead.lead_source_id == source_id)

    if date_from:
        try:
            start_dt = datetime.combine(datetime.fromisoformat(date_from).date(), time.min)
            stmt = stmt.where(Lead.created_at >= start_dt)
        except ValueError:
            return jsonify({"error": "Invalid date_from format (use YYYY-MM-DD)"}), HTTPStatus.BAD_REQUEST

    if date_to:
        try:
            end_dt = datetime.combine(datetime.fromisoformat(date_to).date(), time.max)
            stmt = stmt.where(Lead.created_at <= end_dt)
        except ValueError:
            return jsonify({"error": "Invalid date_to format (use YYYY-MM-DD)"}), HTTPStatus.BAD_REQUEST
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
