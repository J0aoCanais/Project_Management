from marshmallow import Schema, fields, validate

class ContactCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=512))
    type = fields.String(required=True, validate=validate.Length(min=1, max=512))
    email = fields.Email(allow_none=True)
    phone_number = fields.String(allow_none=True)
    address = fields.String(allow_none=True)
    company_name = fields.String(allow_none=True)
    zone = fields.String(allow_none=True)
    notes = fields.String(allow_none=True)
    nif = fields.String(allow_none=True)
    consent_given = fields.Boolean(allow_none=True)
    consent_date = fields.DateTime(allow_none=True)
    consent_channel = fields.String(allow_none=True)


class ContactResponseSchema(Schema):
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

class ContactUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=1, max=512))
    type = fields.String(validate=validate.Length(min=1, max=512))
    email = fields.Email(allow_none=True)
    phone_number = fields.String(allow_none=True)
    address = fields.String(allow_none=True)
    company_name = fields.String(allow_none=True)
    zone = fields.String(allow_none=True)
    notes = fields.String(allow_none=True)
    nif = fields.String(allow_none=True)
    consent_given = fields.Boolean(allow_none=True)
    consent_date = fields.DateTime(allow_none=True)
    consent_channel = fields.String(allow_none=True)

class ContactSearchSchema(Schema):
    q = fields.String(required=True, validate=validate.Length(min=2, max=512))
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
    
class ContactListSchema(Schema):
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))