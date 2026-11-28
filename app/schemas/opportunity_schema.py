"""
Schemas for the Opportunity resource.

    OpportunityCreateSchema       POST   /opportunities/
    OpportunityUpdateSchema       PATCH  /opportunities/<id>        (no phase, no property)
    OpportunityPhaseChangeSchema  POST   /opportunities/<id>/phase  (writes the phase history)
    OpportunityListQuerySchema    GET    /opportunities/            (search, filters, sort, pagination)
    OpportunityListItemSchema     GET    list rows (compact, nested summaries)
    OpportunityResponseSchema     create/update responses (flat, ids only)
    OpportunityDetailSchema       GET    /<id> (nested summaries, counts, financials)

Money is exchanged as DECIMAL STRINGS ("250000.00"), never floats.
`last_activity_at` and `code` are server-managed: output only, never accepted.
"""
from decimal import Decimal
from datetime import datetime, timezone

from marshmallow import (
    EXCLUDE,
    Schema,
    ValidationError,
    fields,
    validate,
    validates_schema,
    pre_load
)

from .properties_schema import MAX_LONG_TEXT, MAX_MONEY, PropertyResponseSchema
from .contacts_schema import  ContactResponseSchema
from .phases_schema import PhaseResponseSchema

PROPERTY_SUMMARY_FIELDS = ("id", "typology", "zone", "area_m2", "asking_price", "vvr", "visit_date", "notes")

MAX_TERM_MONTHS = 600

OPPORTUNITY_SORTABLE_FIELDS = (
    "last_activity_at",
    "expected_sale_price",
    "purchase_price",
    "work_cost",
    "term_months",
    "id",
)

ID = validate.Range(min=1)
NON_NEGATIVE_MONEY = validate.Range(min=Decimal(0), max=MAX_MONEY)


def _money(**kwargs):
    return fields.Decimal(places=2, as_string=True, allow_nan=False, **kwargs)


def _id(**kwargs):
    return fields.Integer(strict=True, validate=ID, **kwargs)


def _percentage(**kwargs):
    return fields.Decimal(
        places=2, as_string=True, allow_nan=False,
        validate=validate.Range(min=Decimal(0), max=Decimal(100)), **kwargs,
    )


# --------------------------------------------------------------------------- #
# Financial calculations (read-only, derived on output)
# --------------------------------------------------------------------------- #
def compute_financials(
    *,
    purchase_price,
    work_cost,
    expected_sale_price,
    imt,
    stamp_tax,
    registry_costs,
    commission_percentage,
    commission_vat_percentage,
    term_months,
    other_costs_total,
):
    """Derived figures for the detail view. Returns None until at least the
    purchase price and expected sale price are known.

    CONFIRM THESE FORMULAS WITH THE OWNER before relying on them:
      total_acquisition_cost = purchase + IMT + stamp tax + registry + other acquisition costs
      total_investment       = total_acquisition_cost + works
      expected_gross_profit  = expected sale - total_investment
                               (before IRC, financing and selling costs)
      margin_percentage      = profit / expected sale
      roi_percentage         = profit / total_investment
    """
    if purchase_price is None or expected_sale_price is None:
        return None

    def d(value):
        return Decimal("0") if value is None else Decimal(str(value))

    def q(value):
        return str(value.quantize(Decimal("0.01")))

    sale = d(expected_sale_price)
    commission = sale * d(commission_percentage) / 100 * (1 + d(commission_vat_percentage) / 100)
    taxes_and_fees = d(imt) + d(stamp_tax) + d(registry_costs)
    other = d(other_costs_total)
    investment = d(purchase_price) + taxes_and_fees + d(work_cost) + commission + other
    margin = sale - investment
    roi = margin / investment if investment else None
    
    annualized_roi = None
    if roi is not None and term_months and roi > -1:
        annualized_roi = Decimal(str((1 + float(roi)) ** (12 / term_months) - 1))

    return {
        "total_investment": q(investment),
        "purchase_price": q(d(purchase_price)),
        "taxes_and_fees": q(taxes_and_fees),
        "work_cost": q(d(work_cost)),
        "commission_value": q(commission),
        "other_costs_total": q(other),
        "estimated_margin": q(margin),
        "margin_percentage": q(margin / sale * 100) if sale else None,
        "roi_percentage": q(roi * 100) if roi is not None else None,
        "annualized_roi_percentage": q(annualized_roi * 100) if annualized_roi is not None else None,
    }


# --------------------------------------------------------------------------- #
# Input
# --------------------------------------------------------------------------- #
class _OpportunityFields:
    """Editable business fields, shared by create and update. All optional:
    an opportunity is created early, when most numbers are still unknown."""

    purchase_price = _money(allow_none=True, validate=NON_NEGATIVE_MONEY)
    work_cost = _money(allow_none=True, validate=NON_NEGATIVE_MONEY)
    expected_sale_price = _money(allow_none=True, validate=NON_NEGATIVE_MONEY)
    imt = _money(allow_none=True, validate=NON_NEGATIVE_MONEY)
    stamp_tax = _money(allow_none=True, validate=NON_NEGATIVE_MONEY)
    registry_costs = _money(allow_none=True, validate=NON_NEGATIVE_MONEY)

    term_months = fields.Integer(
        allow_none=True, strict=True, validate=validate.Range(min=1, max=MAX_TERM_MONTHS)
    )
    
    irc = fields.Integer(allow_none=True, strict=True, validate=validate.Range(min=0, max=100))
    active_investor_percentage = fields.Integer(
        allow_none=True, strict=True, validate=validate.Range(min=0, max=100)
    )
    passive_investor_profile = fields.String(
        allow_none=True, validate=validate.Length(max=MAX_LONG_TEXT)
    )
    
    commission_percentage = _percentage(allow_none=True)
    commission_vat_percentage = _percentage(allow_none=True)


class BaseSchema(Schema):
    """Shared behaviour: trim strings, turn blank strings into None."""
 
    class Meta:
        unknown = "raise"  # reject unexpected fields explicitly
 
    @pre_load
    def normalise_strings(self, data, **kwargs):
        if not isinstance(data, dict):
            return data  # let marshmallow report the type error
        cleaned = {}
        for key, value in data.items():
            if isinstance(value, str):
                value = value.strip()
                field = self.fields.get(key)
                if value == "" and field is not None and field.allow_none:
                    value = None
            cleaned[key] = value
        return cleaned

class OpportunityCreateSchema(_OpportunityFields, BaseSchema):
    # Existence of these rows is checked in the route (404/400); the DB enforces
    # the one-opportunity-per-property rule (route turns IntegrityError into 409).
    lead_id = _id(required=True)

    #Load defaults for money and percentages
    purchase_price = _money(allow_none=True, validate=NON_NEGATIVE_MONEY, load_default=0)
    work_cost = _money(allow_none=True, validate=NON_NEGATIVE_MONEY, load_default=0)
    expected_sale_price = _money(allow_none=True, validate=NON_NEGATIVE_MONEY)
    imt = _money(allow_none=True, validate=NON_NEGATIVE_MONEY, load_default=0)
    stamp_tax = _money(allow_none=True, validate=NON_NEGATIVE_MONEY, load_default=0)
    registry_costs = _money(allow_none=True, validate=NON_NEGATIVE_MONEY, load_default=0)
    irc = fields.Integer(allow_none=True, strict=True, validate=validate.Range(min=0, max=100), load_default=0)
    active_investor_percentage = fields.Integer(
        allow_none=True, strict=True, validate=validate.Range(min=0, max=100), load_default=0
    )


class OpportunityPhaseChangeSchema(BaseSchema):
    phase_id = _id(required=True)
    note = fields.String(load_default=None, validate=validate.Length(min=1, max=2000))


class OpportunityListQuerySchema(BaseSchema):
    """Query string for GET /opportunities/ (all optional)."""

    #TODO: make this fields compliant with front-end (no sroting)

    class Meta:
        unknown = EXCLUDE

    # route joins property + contact: matches property address/zone or contact name
    q = fields.String(load_default=None, validate=validate.Length(min=2, max=512))

    zone_id = fields.Integer(load_default=None, validate=ID)

    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=100, validate=validate.Range(min=1))


# --------------------------------------------------------------------------- #
# Output
# --------------------------------------------------------------------------- #

class OpportunityListItemSchema(Schema):
    """Compact row. The route MUST eager-load phase, property and contact
    (selectinload / joinedload) or each row triggers three extra queries."""

    id = fields.Integer()
    code = fields.String()
    phase = fields.Nested(PhaseResponseSchema)
    property = fields.Nested(PropertyResponseSchema(only=PROPERTY_SUMMARY_FIELDS))
    # contact = fields.Nested(ContactResponseSchema(only=("id", "name")))

    expected_sale_price = _money(allow_none=True, load_default=0)
    purchase_price = _money(allow_none=True, load_default=0)

    #return days at phase
    days_in_phase = fields.Method("get_days_since_last_activity")

    #return profit expected
    profit = fields.Method("get_profit")

    # TODO: Change this to check a new field "phase_started_at"
    def get_days_since_last_activity(self, obj):
        if obj.last_activity_at is None:
            return None

        return (datetime.now(timezone.utc) - obj.last_activity_at).days

    def get_profit(self, obj):
        if obj.expected_sale_price is None or obj.purchase_price is None or obj.irc is None:
            return "0.0"

        profit = (obj.expected_sale_price - obj.purchase_price) * Decimal(100 - obj.irc)/ Decimal(100)
        str(profit.quantize(Decimal("0.01")))
        
        return profit
        

class OpportunityResponseSchema(Schema):
    """Flat representation for create/update responses."""
    #TODO: change this schema to show summary; create more shcemas for each tab

    id = fields.Integer()
    code = fields.String()
    phase_id = fields.Integer()
    property_id = fields.Integer()
    contact_id = fields.Integer()
    purchase_price = _money()
    work_cost = _money()
    expected_sale_price = _money()
    imt = _money()
    stamp_tax = _money()
    registry_costs = _money()
    term_months = fields.Integer(allow_none=True)
    irc = fields.Integer(allow_none=True)
    active_investor_percentage = fields.Integer(allow_none=True)
    passive_investor_profile = fields.String(allow_none=True)
    last_activity_at = fields.DateTime(allow_none=True)


class OpportunityActivitySchema(Schema):
    id = fields.Integer()
    type = fields.String()
    created_at = fields.DateTime()


class OpportunitySummarySchema(Schema):
    id = fields.Integer()
    code = fields.String()
    last_activity_at = fields.DateTime(allow_none=True)
    phase = fields.Nested(PhaseResponseSchema)
    property = fields.Nested(PropertyResponseSchema(only=PROPERTY_SUMMARY_FIELDS))
    contact = fields.Nested(ContactResponseSchema(only=("id", "name")))


class AcquisitionCostInputSchema(BaseSchema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=512))
    cost = _money(required=True, validate=NON_NEGATIVE_MONEY)


class OpportunityFinanceUpdateSchema(_OpportunityFields, BaseSchema):
    """PATCH body. property_id is immutable (a different property is a different
        opportunity) and phase_id changes only through the phase endpoint, so that
        history and last_activity_at are always updated."""

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("partial", True)
        super().__init__(*args, **kwargs)

    other_costs = fields.List(
        fields.Nested(AcquisitionCostInputSchema), validate=validate.Length(max=50)
    )

    @validates_schema
    def _at_least_one_field(self, data, **kwargs):
        if not data:
            raise ValidationError("At least one field must be provided.", field_name="_schema")


class AcquisitionCostSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    cost = _money()


class OpportunityFinanceSchema(Schema):
    id = fields.Integer()
    purchase_price = _money(allow_none=True)
    imt = _money(allow_none=True)
    stamp_tax = _money(allow_none=True)
    registry_costs = _money(allow_none=True)
    work_cost = _money(allow_none=True)
    expected_sale_price = _money(allow_none=True)
    term_months = fields.Integer(allow_none=True)
    commission_percentage = _percentage(allow_none=True)
    commission_vat_percentage = _percentage(allow_none=True)
    other_costs = fields.Nested(AcquisitionCostSchema, many=True)
    financials = fields.Method("get_financials")

    def get_financials(self, obj):
        return compute_financials(
            purchase_price=obj.purchase_price,
            imt=obj.imt,
            stamp_tax=obj.stamp_tax,
            registry_costs=obj.registry_costs,
            work_cost=obj.work_cost,
            expected_sale_price=obj.expected_sale_price,
            commission_percentage=obj.commission_percentage,
            commission_vat_percentage=obj.commission_vat_percentage,
            term_months=obj.term_months,
            other_costs_total=sum((Decimal(str(c.cost)) for c in obj.other_costs), Decimal("0")),
        )


class PhaseHistoryItemSchema(Schema):
    previous_phase = fields.String()
    phase = fields.String()
    changed_at = fields.DateTime()
    note = fields.String(allow_none=True)


class OportunityLinkResponse(BaseSchema):
    """Work resumed information for property links"""
    type = fields.Constant("opportunity")
    id = fields.Integer()
    code = fields.String()
    phase = fields.Pluck(PhaseResponseSchema, "name", dump_only=True)