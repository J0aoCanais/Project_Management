INSERT INTO phase (
    id,
    name,
    position
)
VALUES 
(1, 'novo', 1), 
(2, 'contactado', 2),
(3, 'analise financeira', 3),
(4, 'informacao pendente', 4),
(5, 'due diligence', 5),
(6, 'negociacao', 6),
(7, 'cpcv', 7),
(8, 'aprovado', 8),
(9, 'em aquisicao', 9),
(10, 'adquirido', 10),
(11, 'em obra', 11),
(12, 'em preparcao para venda', 12),
(13, 'a venda', 13),
(14, 'vendido', 14),
(15, 'fechado', 15)
RETURNING *;