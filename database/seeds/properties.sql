-- 1. Insert with all fields
INSERT INTO property (
    source_url,
    address,
    typology,
    zone,
    area_m2,
    asking_price,
    vvr,
    profit,
    max_proposal,
    first_proposal,
    visit_date,
    notes,
    admin_location,
    property_type,
    property_condition,
    construction_year,
    matricial_article,
    predial_description,
    usage_license,
    energy_certificate,
    deleted_at
) VALUES (
    'https://www.example.com/property/123',
    'Rua Augusta, 100, Lisboa',
    'T2',
    'Baixa',
    85.50,
    350000.00,
    400000.00,
    50000.00,
    320000.00,
    300000.00,
    '2026-11-10 10:00:00',
    'Bright apartment in a central location.',
    'Santa Maria Maior',
    'Apartment',
    'Good condition',
    1995,
    '1234',
    'Urban building intended for residential use.',
    'Valid',
    'B',
    NULL
);


-- 2. Insert with only required fields
INSERT INTO property (
    source_url,
    address,
    typology,
    zone,
    area_m2,
    asking_price,
    vvr,
    profit,
    max_proposal,
    first_proposal,
    visit_date
) VALUES (
    'https://www.example.com/property/456',
    'Avenida da Liberdade, 200, Lisboa',
    'T1',
    'Santo António',
    65.00,
    275000.00,
    310000.00,
    35000.00,
    260000.00,
    250000.00,
    '2026-11-10 14:30:00'
);