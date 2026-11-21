from marshmallow import (
    fields,
    validate,
    validates_schema,
    ValidationError,
    pre_load,
    post_load,
    EXCLUDE
)
from .contacts_schema import BaseSchema, ContactCreateSchema, ContactResponseSchema
from .phases_schema import PhaseResponseSchema
from datetime import time, timezone, datetime
from app.models import Lead

ALLOWED_LEAD_STATUSES = [
    "Nova",
    "Contactada",
    "Qualificada",
    "Convertida",
    "Descartada",
]


class LeadSourceResponseSchema(BaseSchema):
    id = fields.Integer()
    name = fields.String()
    is_active = fields.Boolean()


class LeadCreateSchema(BaseSchema):
    lead_source_id = fields.Integer(required=True)
    message = fields.String(allow_none=True)
    campaign_name = fields.String(allow_none=True, validate=validate.Length(max=512))
    ad_name = fields.String(allow_none=True, validate=validate.Length(max=512))
    form_name = fields.String(allow_none=True, validate=validate.Length(max=512))

    contact_id = fields.Integer(allow_none=True)
    new_contact = fields.Nested(ContactCreateSchema, allow_none=True)

    referrer_contact_id = fields.Integer(allow_none=True)

    @validates_schema
    def validate_contact_selection(self, data, **kwargs):
        contact_id = data.get("contact_id")
        new_contact = data.get("new_contact")

        if not contact_id and not new_contact:
            raise ValidationError(
                {"contact_id": ["Must provide either 'contact_id' or 'new_contact'."]}
            )
        if contact_id and new_contact:
            raise ValidationError(
                {
                    "contact_id": [
                        "Provide either 'contact_id' or 'new_contact', not both."
                    ]
                }
            )

        referrer_id = data.get("referrer_contact_id")
        if contact_id and referrer_id and contact_id == referrer_id:
            raise ValidationError(
                {"referrer_contact_id": ["A contact cannot refer themselves."]}
            )


class LeadResponseSchema(BaseSchema):
    id = fields.Integer()
    status = fields.String()
    message = fields.String(allow_none=True)
    created_at = fields.DateTime()
    lead_source_id = fields.Integer()
    contact = fields.Nested(ContactResponseSchema)
    referrer = fields.Nested(ContactResponseSchema, allow_none=True)

    ## Consider zone: from property or contacts? (ususally the same ig)



class LeadUpdateSchema(BaseSchema):
    status = fields.Str(validate=validate.OneOf(ALLOWED_LEAD_STATUSES))
    message = fields.Str(allow_none=True)
    discard_reason = fields.Str(allow_none=True)
    campaign_name = fields.Str(allow_none=True, validate=validate.Length(max=512))
    ad_name = fields.Str(allow_none=True, validate=validate.Length(max=512))
    form_name = fields.Str(allow_none=True, validate=validate.Length(max=512))
    lead_source_id = fields.Int()
    contact_id1 = fields.Int(allow_none=True)

    @validates_schema
    def validate_discard_reason(self, data, **kwargs):
        # Optional business rule: require a reason if status is set to Descartada
        if data.get("status") == "Descartada" and not data.get("discard_reason"):
            raise ValidationError(
                "discard_reason is required when status is 'Descartada'.",
                field_name="discard_reason",
            )


class LeadFilterSchema(BaseSchema):

    class Meta:
        unknown = EXCLUDE  # ignore harmless extras such as cache-busters

    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))

    status = fields.String(validate=validate.OneOf(ALLOWED_LEAD_STATUSES))
    search = fields.String(validate=validate.Length(max=512))
    lead_source_id = fields.Integer(validate=validate.Range(min=1))
    zone_id = fields.Integer()

    @pre_load
    def clean_query_params(self, data, **kwargs):
        cleaned = {}
        for key, value in data.items():
            if isinstance(value, str):
                value = value.strip()
                if value == "":
                    continue
                if key == ("date_to", "date_from") and "T" in value:
                    value = value.split("T", 1)[0]
            cleaned[key] = value
        return cleaned


class OportunityLinkResponse(BaseSchema):
    """Work resumed information for property links"""
    type = fields.Constant("opportunity")
    id = fields.Integer()
    code = fields.String()
    phase = fields.Pluck(PhaseResponseSchema, "name", dump_only=True)