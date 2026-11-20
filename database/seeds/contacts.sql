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

-- The zone is a row of the zone table (contact.zone_id), like the roles.
INSERT INTO zone (name) VALUES ('Coimbra') ON CONFLICT (name) DO NOTHING;

INSERT INTO contact (id, name, email, phone_number, address, company_name,
                     zone_id, notes, nif,  consent_given)
VALUES
(700, 'Osvaldo Dias', 'os.dias@gmail.com', '922211220', 'Rua 1º de Maio, Nº13', 'OS Dias Lda', (SELECT id FROM zone WHERE name = 'Coimbra'), '', '937733111', FALSE),
(701, 'Manel Ares', 'm.ares@gmail.com', '954871526', 'Rua 1º de Maio, Nº14', '', (SELECT id FROM zone WHERE name = 'Coimbra'), '', '445517221', FALSE)
;
