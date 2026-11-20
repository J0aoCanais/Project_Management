"""
Schemas for the Property resource.

    PropertyCreateSchema     POST   body
    PropertyUpdateSchema     PATCH  body (every field optional)
    PropertySearchSchema  GET    query string (search, filters, pagination)
    PropertyListSchema   GET    list rows
    PropertyResponseSchema   POST/PATCH responses (all columns)
    PropertyDetailSchema     GET    /<id> (all columns)

Money and areas are exchanged as DECIMAL STRINGS ("250000.00"), never floats,
so no rounding error can creep in between the API and the React app."""

from datetime import datetime, timezone
from decimal import Decimal

from marshmallow import (
    EXCLUDE,
    Schema,
    ValidationError,
    fields,
    validate,
    validates_schema,
    pre_load
)

from .phases_schema import PhaseResponseSchema

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


# --------------------------------------------------------------------------- #
# Limits (sanity bounds, not business rules; tune to your market)
# --------------------------------------------------------------------------- #
MAX_MONEY = Decimal("1000000000")      # 1 billion
MAX_AREA_M2 = Decimal("1000000")       # 100 hectares
MIN_CONSTRUCTION_YEAR = 1800
MAX_SHORT_TEXT = 512
MAX_LONG_TEXT = 10_000
MAX_URL = 2048

POSITIVE_MONEY = validate.Range(min=Decimal(0), max=MAX_MONEY, min_inclusive=False)
SIGNED_MONEY = validate.Range(min=-MAX_MONEY, max=MAX_MONEY)
POSITIVE_AREA = validate.Range(min=Decimal(0), max=MAX_AREA_M2, min_inclusive=False)
SHORT_TEXT = validate.Length(min=1, max=MAX_SHORT_TEXT)

def _money(**kwargs):
    return fields.Decimal(places=2, as_string=True, allow_nan=False, **kwargs)


def _area(**kwargs):
    return fields.Decimal(places=2, as_string=True, allow_nan=False, **kwargs)


def check_proposal_order(first_proposal, max_proposal):
    """Shared rule, also meant to be called by the PATCH route on the MERGED
    values (stored + incoming), because a partial update may only carry one of
    the two fields."""
    if first_proposal is not None and max_proposal is not None and first_proposal > max_proposal:
        raise ValidationError({"first_proposal": ["First proposal cannot exceed the maximum proposal."]})


# --------------------------------------------------------------------------- #
# Input
# --------------------------------------------------------------------------- #
class PropertyCreateSchema(BaseSchema):
    """Schema to create a property, with valid required fields"""

    zone = fields.String(required=True, validate=SHORT_TEXT)
    property_type = fields.String(required=True, validate=validate.Length(max=MAX_SHORT_TEXT))
    sale_motive = fields.String(required=True, validate=validate.Length(max=MAX_SHORT_TEXT))
    contact_owns = fields.Boolean(required=True)
    lead_id = fields.Integer(required=True)

    # Listing the property came from. http/https only: a "javascript:" URL
    # rendered as a link in React would be an XSS vector.
    source_url = fields.URL(
        allow_none=True,
        schemes={"http", "https"},
        validate=validate.Length(max=MAX_URL),
    )

    address = fields.String(allow_none=True, validate=SHORT_TEXT)
    typology = fields.String(allow_none=True, validate=SHORT_TEXT)  

    area_m2 = _area(allow_none=True, validate=POSITIVE_AREA)

    asking_price = _money(allow_none=True, validate=POSITIVE_MONEY)
    vvr = _money(allow_none=True, validate=POSITIVE_MONEY)
    profit = _money(allow_none=True, validate=SIGNED_MONEY)  # may be negative
    max_proposal = _money(allow_none=True, validate=POSITIVE_MONEY)
    first_proposal = _money(allow_none=True, validate=POSITIVE_MONEY)

    visit_date = fields.Date(allow_none=True)

    notes = fields.String(allow_none=True, validate=validate.Length(max=MAX_LONG_TEXT))
    admin_location = fields.String(allow_none=True, validate=validate.Length(max=MAX_SHORT_TEXT))
    property_condition = fields.String(allow_none=True, validate=validate.Length(max=MAX_SHORT_TEXT))
    construction_year = fields.Integer(
        allow_none=True,
        strict=True,  # reject "1990" strings and 1990.5 floats
        validate=validate.Range(min=MIN_CONSTRUCTION_YEAR)
    )
    matricial_article = fields.String(allow_none=True, validate=validate.Length(max=MAX_SHORT_TEXT))
    predial_description = fields.String(allow_none=True, validate=validate.Length(max=MAX_LONG_TEXT))
    usage_license = fields.String(allow_none=True, validate=validate.Length(max=MAX_SHORT_TEXT))
    energy_certificate = fields.String(allow_none=True, validate=validate.Length(max=MAX_SHORT_TEXT))

    @validates_schema
    def _proposals_are_ordered(self, data, **kwargs):
        check_proposal_order(data.get("first_proposal"), data.get("max_proposal"))


class PropertyUpdateSchema(PropertyCreateSchema):
    """PATCH body: same rules, but every field is optional."""

    #Make every field optional
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("partial", True)
        super().__init__(*args, **kwargs)

    @validates_schema
    def _at_least_one_field(self, data, **kwargs):
        if not data:
            raise ValidationError("At least one field must be provided.", field_name="_schema")


class PropertySearchSchema(BaseSchema):
    """Query string for GET /properties/ (all optional)."""

    class Meta:
        unknown = EXCLUDE  # ignore harmless extras such as cache-busters

    # free-text search over address, zone, admin_location and matricial_article
    q = fields.String(load_default=None, validate=validate.Length(min=2, max=MAX_SHORT_TEXT))

    # exact filters
    zone = fields.String(load_default=None, validate=SHORT_TEXT)
    typology = fields.String(load_default=None, validate=SHORT_TEXT)
    property_type = fields.String(load_default=None, validate=SHORT_TEXT)

    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))


# --------------------------------------------------------------------------- #
# Output
# --------------------------------------------------------------------------- #

class PropertyResponseSchema(Schema):
    """Every column. Used for create/update responses and as the detail base."""

    id = fields.Integer()
    code = fields.Method("get_code")
    zone = fields.String()
    property_type = fields.String()
    sale_motive = fields.String()
    contact_owns = fields.Boolean()
    lead_id = fields.Integer()
    contact_id = fields.Integer()

    source_url = fields.String(allow_none=True)
    address = fields.String(allow_none=True)
    typology = fields.String(allow_none=True)
    area_m2 = _area(allow_none=True)
    asking_price = _money(allow_none=True)
    vvr = _money(allow_none=True)
    profit = _money(allow_none=True)
    max_proposal = _money(allow_none=True)
    first_proposal = _money(allow_none=True)
    visit_date = fields.DateTime(allow_none=True)
    notes = fields.String(allow_none=True)
    admin_location = fields.String(allow_none=True)
    property_condition = fields.String(allow_none=True)
    construction_year = fields.Integer(allow_none=True)
    matricial_article = fields.String(allow_none=True)
    predial_description = fields.String(allow_none=True)
    usage_license = fields.String(allow_none=True)
    energy_certificate = fields.String(allow_none=True)

    def get_code(self, obj):
        return f"IMO-{obj.id}"

class PropertyListSchema(PropertyResponseSchema):
    """Compact row for tables: leaves out notes and long descriptions."""

    class Meta:
            unknown = EXCLUDE  # ignore harmless extras such as cache-busters
    
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))