INSERT INTO opportunity (
    id,
    current_status,
    purchase_price,
    acquisition_costs,
    work_cost,
    other_costs,
    expected_sale_date,
    expected_sale_price,
    term_months,
    last_activity_at,
    phase_id,
    property_id
)
VALUES
(
    1000,
    'Active',
    150000.00,
    5000.00,
    12000.00,
    2000.00,
    '2027-06-30 00:00:00',
    220000.00,
    12,
    NOW(),
    1,
    1
),
(
    1001,
    'Under Review',
    200000.00,
    7500.00,
    15000.00,
    3000.00,
    '2027-09-30 00:00:00',
    280000.00,
    18,
    NOW(),
    2,
    2
)
RETURNING *;