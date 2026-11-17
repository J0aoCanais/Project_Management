INSERT INTO lead (
    status,
    message,
    discard_reason,
    created_at,
    campaign_name,
    ad_name,
    form_name,
    lead_source_id,
    contact_id,
    contact_id1
)
VALUES
(
    'NEW',
    'Interested in purchasing a property in Lisbon.',
    NULL,
    NOW(),
    'Facebook Campaign 2026',
    'Lisbon Property Ad',
    'Property Interest Form',
    1,
    1,
    1
),
(
    'CONTACTED',
    'Interested in a property investment opportunity.',
    NULL,
    NOW(),
    'Google Ads Campaign 2026',
    'Investment Property Ad',
    'Investment Lead Form',
    2,
    2,
    2
);