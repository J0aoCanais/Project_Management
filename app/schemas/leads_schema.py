from marshmallow import fields, validate, validates_schema, ValidationError
from .contacts_schema import BaseSchema, ContactCreateSchema, ContactResponseSchema

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
                {"contact_id": ["Provide either 'contact_id' or 'new_contact', not both."]}
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
