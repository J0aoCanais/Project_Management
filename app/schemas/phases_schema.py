"""
Schemas for the Phase resource.

    PhaseResponseSchema   GET    phase responses
"""

from marshmallow import (
    Schema,
    fields,
    pre_load
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

class PhaseResponseSchema(BaseSchema):
    """
    Schema representing a phase response.

    Attributes:
        id (int): Unique identifier of the phase.
        name (str): Name of the phase.
    """
    id = fields.Integer()
    name = fields.String()