"""
Schemas for the Property resource.

    OportunityLinkResponse     GET   link information
"""

from marshmallow import (
    Schema,
    fields,
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

class OportunityLinkResponse(BaseSchema):
    """Work resumed information for property links"""
    type = fields.Constant("opportunity")
    id = fields.Integer()
    code = fields.String()
    phase = fields.Pluck(PhaseResponseSchema, "name", dump_only=True)