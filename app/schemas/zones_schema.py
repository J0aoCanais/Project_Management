"""
Schemas for the Zone resource.

    ZoneCreateSchema    POST    name 
    ZoneUpdateSchema    PATCH   name
    ZoneResponseSchema  GET/PATCH/POST     name, id

"""

from marshmallow import (
    Schema,
    fields,
    pre_load,
    validate
)

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


class ZoneCreateSchema(BaseSchema):
    """Schema to crete a zone"""
    name = fields.String(required=True, validate=validate.Length(min=1, max=512))
    

class ZoneUpdateSchema(BaseSchema):
    """Schema to update a zone's name"""
    name = fields.String(required=True, validate=validate.Length(min=1, max=512))


class ZoneResponseSchema(BaseSchema):
    """Simple schema to return zone information"""
    id = fields.Integer()
    name = fields.String()