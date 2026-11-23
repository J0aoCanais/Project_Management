INSERT INTO lead (
    id,
    status,
    message,
    discard_reason,
    created_at,
    lead_source_id,
    contact_id,
    contact_id1
)
VALUES
(
    900,
    'NEW',
    'Interested in purchasing a property in Lisbon.',
    NULL,
    NOW(),
    800,
    700,
    700
),
(
    901,
    'CONTACTED',
    'Interested in a property investment opportunity.',
    NULL,
    NOW(),
    801,
    701,
    701
);