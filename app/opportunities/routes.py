import logging
from datetime import datetime, timezone
from decimal import Decimal
from http import HTTPStatus

from flask import Blueprint, jsonify, request
from flask_login import current_user
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, func
from sqlalchemy.orm import contains_eager, joinedload, selectinload

from ..extensions import db
from ..models import AcquisitionCost, Contact, Opportunity, ActivityLog, Phase, Property, Lead, PhaseHistory, Zone
from ..schemas.opportunity_schema import (
    OpportunityCreateSchema,
    OpportunityListQuerySchema,
    OpportunityListItemSchema,
    OpportunityResponseSchema,
    OpportunityPhaseChangeSchema,
    OpportunityActivitySchema,
    OpportunitySummarySchema,
    OpportunityFinanceSchema,
    OpportunityFinanceUpdateSchema,
    PhaseHistoryItemSchema,
)
from ..security import owner_required

logger = logging.getLogger(__name__)

opportunities_bp = Blueprint("opportunities", __name__)

opportunity_create_schema = OpportunityCreateSchema()
opportunity_response_schema = OpportunityResponseSchema()
opportunity_list_schema = OpportunityListQuerySchema()
opportunity_list_item_schema = OpportunityListItemSchema()
opportunity_phase_change_schema = OpportunityPhaseChangeSchema()
opportunity_summary_schema = OpportunitySummarySchema()
opportunity_activity_schema = OpportunityActivitySchema()
opportunity_finance_schema = OpportunityFinanceSchema()
opportunity_finance_update_schema = OpportunityFinanceUpdateSchema()
phase_history_item_schema = PhaseHistoryItemSchema()

# Every opportunity starts here. Phases are lookup data: seed this row in a
# migration so the id is guaranteed in every environment (dev, test, prod).
INITIAL_PHASE_ID = 1

# Phases 1 to 8, 9 already belongs to Operation
PIPELINE_LAST_POSITION = 8

# Recent activity number
RECENT_ACTIVITY_LIMIT = 5

#Activity names for logs
ACTIVITY_NAME = ["Fase alterada para %s","Análise financeira atualizada","Documentos atualizados"]

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
    log_activity(opportunity, 0, phase.name, now)
    opportunity.phase_entered_at = now
    opportunity.phase_histories.append(
        PhaseHistory(phase_id=phase.id, changed_at=now, note=note)
    )

def log_activity(opportunity: Opportunity, type_: int, phase_name: str=None, time: datetime =None):

    # Use given time else get current time
    now = time if time else datetime.now(timezone.utc)
    opportunity.last_activity_at = now
    if type_ == 0 and phase_name: #Store phase name if thats the activity
        description = ACTIVITY_NAME[type_] % phase_name
    else:
        description = ACTIVITY_NAME[type_]
    opportunity.activity_log.append(ActivityLog(type=description, created_at=now))


#========================================
#  2.Opportunities Read Endpoints (GET)
#========================================

@opportunities_bp.get("/")
@owner_required
def get_opportunities():
    """Lists opportunities (board and list views) with search"""
    try:
        params = opportunity_list_schema.load(request.args)
    except ValidationError as error:
        return jsonify({"errors": error.messages}), HTTPStatus.BAD_REQUEST
    
    try:
        # base query: opportunity + property + zone + contact + phase
        stmt = (
            db.select(Opportunity)
            .join(Opportunity.property)
            .join(Property.zone)
            .join(Opportunity.contact)
            .options(
                contains_eager(Opportunity.property).contains_eager(Property.zone),
                contains_eager(Opportunity.contact),
                joinedload(Opportunity.phase),
            )
            .where(Property.deleted_at.is_(None))
        )
        
        search_term = params["q"]
        if search_term:
            search_term = (
                search_term.strip()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_")
            )
            pattern = f"%{search_term}%"
            
            stmt = stmt.where(
                or_(
                    Property.address.ilike(pattern, escape="\\"),
                    Zone.name.ilike(pattern, escape="\\"),
                    Contact.name.ilike(pattern, escape="\\"),
                )
            )
        
        if params["zone_id"] is not None:
            stmt = stmt.where(Property.zone_id == params["zone_id"])

        page = params["page"]
        per_page = params["per_page"]    

        pagination = db.paginate(
            stmt,
            page=page,
            per_page=per_page,
            error_out=False
        ) 

        return jsonify({
            "success": True,
            "data": [opportunity_list_item_schema.dump(o) for o in pagination.items],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            },
        }), HTTPStatus.OK

    except Exception:
        logger.exception("Failed to load opportunities")
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


@opportunities_bp.get("/<int:opportunity_id>")
@owner_required
def get_opportunity_summary(opportunity_id):
    """Opportunity summary tab: property and contact details + recent activity"""
    try:
        # base query: opportunity + property + zone + contact + phase
        stmt = (
            db.select(Opportunity)
            .join(Opportunity.property)
            .join(Property.zone)
            .join(Opportunity.contact)
            .options(
                contains_eager(Opportunity.property).contains_eager(Property.zone),
                contains_eager(Opportunity.contact),
                joinedload(Opportunity.phase),
            )
            .where(Opportunity.id == opportunity_id)
        )

        opportunity = db.session.execute(stmt).scalars().unique().one_or_none()
        if opportunity is None:
            return jsonify({"errors": {"id": ["Opportunity not found"]}}), HTTPStatus.NOT_FOUND

        # recent activity: limited in the query, newest first
        activity_stmt = (
            db.select(ActivityLog)
            .where(ActivityLog.opportunity_id == opportunity_id)
            .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
            .limit(RECENT_ACTIVITY_LIMIT)
        )
        activities = db.session.execute(activity_stmt).scalars().all()

        data = opportunity_summary_schema.dump(opportunity)
        data["recent_activity"] = opportunity_activity_schema.dump(activities, many=True)

        return jsonify({"success": True, "data": data}), HTTPStatus.OK

    except Exception:
        logger.exception("Failed to load opportunity %s", opportunity_id)
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR
    return


@opportunities_bp.get("/<int:opportunity_id>/finance")
@owner_required
def get_opportunity_finance(opportunity_id):
    """Opportunity financial analysis tab: inputs, other costs and derived figures"""
    try:
        stmt = (
            db.select(Opportunity)
            .options(selectinload(Opportunity.other_costs))
            .where(Opportunity.id == opportunity_id)
        )
        opportunity = db.session.execute(stmt).scalars().one_or_none()
        if opportunity is None:
            return jsonify({"errors": {"id": ["Opportunity not found"]}}), HTTPStatus.NOT_FOUND

        return jsonify({
            "success": True,
            "data": opportunity_finance_schema.dump(opportunity),
        }), HTTPStatus.OK

    except Exception:
        logger.exception("Failed to load finance of opportunity %s", opportunity_id)
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


@opportunities_bp.get("/<int:opportunity_id>/phase-history")
@owner_required
def get_opportunity_phase_history(opportunity_id):
    """Opportunity phase history tab: previous phase, new phase, date and note"""
    try:
        stmt = (
            db.select(Opportunity)
            .options(selectinload(Opportunity.phase_histories).joinedload(PhaseHistory.phase))
            .where(Opportunity.id == opportunity_id)
        )
        opportunity = db.session.execute(stmt).scalars().one_or_none()
        if opportunity is None:
            return jsonify({"errors": {"id": ["Opportunity not found"]}}), HTTPStatus.NOT_FOUND

        history = sorted(opportunity.phase_histories, key=lambda h: (h.changed_at, h.id))
        rows = [
            {
                "previous_phase": before.phase.name,
                "phase": after.phase.name,
                "changed_at": after.changed_at,
                "note": after.note,
            }
            for before, after in zip(history, history[1:])
        ]
        rows.reverse()  # newest first

        return jsonify({
            "success": True,
            "data": [phase_history_item_schema.dump(r) for r in rows],
            "total": len(rows),
        }), HTTPStatus.OK

    except Exception:
        logger.exception("Failed to load phase history of opportunity %s", opportunity_id)
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


@opportunities_bp.get("/<int:opportunity_id>/documents")
@owner_required
def get_opportunity_documents(opportunity_id):
    #TODO: show opportunity documents
    return




#===================================================
#  3.Opportunities Write Endpoints (POST/PATCH/PUT)
#===================================================

@opportunities_bp.post("/")
@owner_required
def create_opportunity():
    """Open an opportunity on a property.

    Body: lead_id (+ optional costs and percentages).
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



@opportunities_bp.post("/<int:opportunity_id>/phase")
@owner_required
def change_opportunity_phase(opportunity_id: int):
    """Moves an opportunity to another phase"""

    opportunity = db.session.get(Opportunity, opportunity_id, with_for_update=True)
    if opportunity is None:
        return _fail({"id": ["Opportunity not found"]}, HTTPStatus.NOT_FOUND)
    
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"errors": {"body": ["Request body must be a JSON object"]}}), HTTPStatus.BAD_REQUEST

    try:
        data = opportunity_phase_change_schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST
    
    phase = db.session.get(Phase, data["phase_id"])
    if phase is None or phase.position > PIPELINE_LAST_POSITION:
        return _fail({"phase_id": ["Phase not found"]}, HTTPStatus.BAD_REQUEST)
    
    if opportunity.phase_id == phase.id:
        return _fail({"phase_id": ["Opportunity is already in this phase"]}, HTTPStatus.CONFLICT)

    previous_phase_id = opportunity.phase_id
    enter_phase(opportunity, phase, data["note"])

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR

    return jsonify(opportunity_response_schema.dump(opportunity)), HTTPStatus.OK


@opportunities_bp.patch("/<int:opportunity_id>")
@owner_required
def update_opportunity_finance(opportunity_id):
    """Saves the financial analysis; other_costs, when sent, replaces the whole list"""

    opportunity = db.session.get(Opportunity, opportunity_id, with_for_update=True)
    if opportunity is None:
        return _fail({"id": ["Opportunity not found"]}, HTTPStatus.NOT_FOUND)

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"errors": {"body": ["Request body must be a JSON object"]}}), HTTPStatus.BAD_REQUEST

    try:
        data = opportunity_finance_update_schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), HTTPStatus.BAD_REQUEST

    try:
        other_costs = data.pop("other_costs", None)
        for field, value in data.items():
            setattr(opportunity, field, value)

        if other_costs is not None:
            opportunity.other_costs = [AcquisitionCost(**c) for c in other_costs]

        log_activity(opportunity, 1)

        db.session.commit()

        return jsonify({
            "success": True,
            "data": opportunity_finance_schema.dump(opportunity),
        }), HTTPStatus.OK

    except Exception:
        db.session.rollback()
        logger.exception("Failed to update finance of opportunity %s", opportunity_id)
        return jsonify({"errors": {"server": ["Internal server error"]}}), HTTPStatus.INTERNAL_SERVER_ERROR


########################
# Opportunity delete
#######################

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
