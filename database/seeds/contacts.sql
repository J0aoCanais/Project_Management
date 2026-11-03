-- CREATE TABLE contact (
-- 	id		 BIGSERIAL,
-- 	name		 VARCHAR(512) NOT NULL,
-- 	type		 VARCHAR(512) NOT NULL,
-- 	email		 VARCHAR(512),
-- 	phone_number	 VARCHAR(512),
-- 	address	 TEXT,
-- 	company_name	 VARCHAR(512),
-- 	zone		 VARCHAR(512),
-- 	notes		 VARCHAR(512),
-- 	nif		 VARCHAR(512),
-- 	consent_given	 BOOL,
-- 	consent_date	 TIMESTAMP,
-- 	consent_channel VARCHAR(512),
-- 	PRIMARY KEY(id)
-- );

INSERT INTO contact (name, type, email, phone_number, address, company_name,
                     zone, notes, nif,  consent_given)
VALUES
('Osvaldo Dias', 'Empreiteiro', 'os.dias@gmail.com', '922211220', 'Rua 1º de Maio, Nº13', 'OS Dias Lda', 'Coimbra', '', '937733111', FALSE),
('Manel Ares', 'Investidor', 'm.ares@gmail.com', '954871526', 'Rua 1º de Maio, Nº14', '', 'Coimbra', '', '445517221', FALSE)
;