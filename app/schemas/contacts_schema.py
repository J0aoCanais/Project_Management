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
                if value == "" and key not in ("name", "q"):
                    value = None
            cleaned[key] = value
        return cleaned

class RoleCreateSchema(BaseSchema):
    """Simple schema to create a contact role"""
    name = fields.String(required=True, validate=validate.Length(min=1, max=512))

class RoleResponseSchema(BaseSchema):
    """Simple schema to return contact role"""
    id = fields.Integer()
    name = fields.String()


class ContactCreateSchema(BaseSchema):
    """Contact creation schema. Name and roles fields are required"""
    name = fields.String(required=True, validate=validate.Length(min=1, max=512))
    role_ids = fields.List(fields.Integer(), required=True, allow_none=True)
    email = fields.Email(allow_none=True, validate=validate.Length(max=512))
    phone_number = fields.String(allow_none=True, validate=validate.Length(max=512))
    address = fields.String(allow_none=True, validate=validate.Length(max=512))
    company_name = fields.String(allow_none=True, validate=validate.Length(max=512))
    zone = fields.String(allow_none=True, validate=validate.Length(max=512))
    notes = fields.String(allow_none=True, validate=validate.Length(max=512))
    nif = fields.String(allow_none=True, validate=validate.Length(max=512))
    consent_given = fields.Boolean(allow_none=True, load_default=False)
    consent_date = fields.DateTime(allow_none=True)
    consent_channel = fields.String(allow_none=True)


class ContactResponseSchema(BaseSchema):
    """Contact response schema"""
    id = fields.Integer()
    name = fields.String()
    roles = fields.List(fields.Nested(RoleResponseSchema))
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
    """For PATCH: make the name and roles fields optional"""
    name = fields.String(validate=validate.Length(min=1, max=512))
    role_ids = fields.List(fields.Integer(), allow_none=True)
    
    
class ContactListSchema(BaseSchema):
    """Lists contacts with fields for pagination"""
    class Meta:
        unknown = EXCLUDE  # ignore harmless extras such as cache-busters

    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))


class ContactSearchSchema(ContactListSchema):
    """Search schema: List Schema with a query field"""
    q = fields.String(required=False, allow_none=True, validate=validate.Length(min=2, max=512))
    role_id = fields.Integer(allow_none=True)
    consent = fields.Boolean(allow_none=True)