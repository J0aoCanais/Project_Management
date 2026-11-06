from marshmallow import Schema, fields, validate, pre_load, EXCLUDE

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
                if value == "" and key not in ("name", "type", "q"):
                    value = None
            cleaned[key] = value
        return cleaned


class ContactCreateSchema(BaseSchema):
    """Contact creation schema. Name and type fields are required"""
    name = fields.String(required=True, validate=validate.Length(min=1, max=512))
    type = fields.String(required=True, validate=validate.Length(min=1, max=512))
    email = fields.Email(allow_none=True, validate=validate.Length(max=512))
    phone_number = fields.String(allow_none=True, validate=validate.Length(max=512))
    address = fields.String(allow_none=True, validate=validate.Length(max=512))
    company_name = fields.String(allow_none=True, validate=validate.Length(max=512))
    zone = fields.String(allow_none=True, validate=validate.Length(max=512))
    notes = fields.String(allow_none=True, validate=validate.Length(max=512))
    nif = fields.String(allow_none=True, validate=validate.Length(max=512))
    consent_given = fields.Boolean(allow_none=True)
    consent_date = fields.DateTime(allow_none=True)
    consent_channel = fields.String(allow_none=True)


class ContactResponseSchema(BaseSchema):
    """Contact response schema"""
    id = fields.Integer()
    name = fields.String()
    type = fields.String()
    email = fields.String(allow_none=True)
    phone_number = fields.String(allow_none=True)
    address = fields.String(allow_none=True)
    company_name = fields.String(allow_none=True)
    zone = fields.String(allow_none=True)
    notes = fields.String(allow_none=True)
    nif = fields.String(allow_none=True)
    consent_given = fields.Boolean(allow_none=True)
    consent_date = fields.DateTime(allow_none=True)
    consent_channel = fields.String(allow_none=True)

class ContactUpdateSchema(ContactCreateSchema):
    """For PATCH: make the name and type fields optional"""

    name = fields.String(validate=validate.Length(min=1, max=512))
    type = fields.String(validate=validate.Length(min=1, max=512))
    
    
class ContactListSchema(BaseSchema):
    """Lists contacts with fields for pagination"""

    class Meta:
        unknown = EXCLUDE  # ignore harmless extras such as cache-busters

    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))

class ContactSearchSchema(ContactListSchema):
    """Search schema: List Schema with a query field"""

    q = fields.String(required=True, validate=validate.Length(min=2, max=512))