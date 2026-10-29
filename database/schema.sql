CREATE TABLE contact (
	id		 BIGSERIAL,
	name	 VARCHAR(512) NOT NULL,
	type	 VARCHAR(512) NOT NULL,
	email	 VARCHAR(512),
	phone_number VARCHAR(512),
	address	 TEXT,
	company_name VARCHAR(512),
	zone	 VARCHAR(512),
	notes	 VARCHAR(512),
	PRIMARY KEY(id)
);

CREATE TABLE operation (
	id			 BIGSERIAL,
	code		 VARCHAR(512) NOT NULL,
	real_purchase_price FLOAT(8) NOT NULL,
	advertised_price	 FLOAT(8),
	final_sale_price	 FLOAT(8),
	phase_id		 BIGINT NOT NULL,
	contact_id		 BIGINT NOT NULL,
	opportunity_id	 BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE opportunity (
	id		 BIGSERIAL,
	current_status	 VARCHAR(512) NOT NULL,
	purchase_price	 FLOAT(8),
	acquisition_costs	 FLOAT(8),
	work_cost		 FLOAT(8),
	other_costs	 BOOL,
	expected_sale_date TIMESTAMP,
	phase_id		 BIGINT NOT NULL,
	property_id	 BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE property (
	id		 BIGSERIAL,
	source_url	 TEXT NOT NULL,
	address	 VARCHAR(512) NOT NULL,
	typology	 VARCHAR(512) NOT NULL,
	zone		 VARCHAR(512) NOT NULL,
	area_m2	 FLOAT(8) NOT NULL,
	asking_price	 FLOAT(8) NOT NULL,
	vvr		 FLOAT(8) NOT NULL,
	profit	 FLOAT(8) NOT NULL,
	max_proposal	 FLOAT(8) NOT NULL,
	first_proposal FLOAT(8) NOT NULL,
	visit_date	 TIMESTAMP NOT NULL,
	notes		 TEXT,
	PRIMARY KEY(id)
);

CREATE TABLE lead (
	id		 BIGSERIAL,
	status	 VARCHAR(512) NOT NULL,
	message	 TEXT,
	discard_reason TEXT,
	created_at	 TIMESTAMP NOT NULL,
	campaign_name	 VARCHAR(512),
	ad_name	 VARCHAR(512),
	lead_source_id BIGINT NOT NULL,
	contact_id	 BIGINT NOT NULL,
	contact_id1	 BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE construction_budget_item (
	id			 BIGSERIAL,
	category_name	 VARCHAR(512) NOT NULL,
	budgeted_value	 FLOAT(8),
	contracted_value	 FLOAT(8),
	executed_value	 FLOAT(8),
	invoiced_value	 FLOAT(8),
	paid_value		 FLOAT(8),
	construction_work_id BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE construction_work (
	id		 BIGSERIAL,
	name		 VARCHAR(512) NOT NULL,
	state		 VARCHAR(512) NOT NULL,
	planned_start_date DATE,
	planned_end_date	 DATE,
	real_start_date	 DATE,
	real_end_date	 DATE,
	operation_id	 BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE investment (
	id			 BIGSERIAL,
	committed_value		 FLOAT(8),
	participation_percentage FLOAT(8),
	return_type		 VARCHAR(512),
	return_rate		 FLOAT(8),
	agreement_date		 DATE,
	contact_id		 BIGINT NOT NULL,
	operation_id		 BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE financial_movement (
	id			 BIGSERIAL,
	type		 VARCHAR(512) NOT NULL,
	amount		 FLOAT(8) NOT NULL,
	expected_date	 DATE,
	effective_date	 DATE,
	notes		 TEXT,
	movement_category_id BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE role (
	id	 BIGSERIAL,
	name VARCHAR(512) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE investor_profile (
	id		 BIGSERIAL,
	available_capital FLOAT(8),
	risk_profile	 VARCHAR(512),
	preferred_zones	 TEXT,
	min_amount	 FLOAT(8),
	max_amount	 FLOAT(8),
	preferred_terms	 TEXT,
	relation_status	 VARCHAR(512) NOT NULL,
	contact_id	 BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE lead_source (
	id	 BIGSERIAL,
	name	 VARCHAR(512) NOT NULL,
	is_active BOOL NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE users (
	id		 BIGINT,
	email	 VARCHAR(512) NOT NULL,
	password_hash VARCHAR(512) NOT NULL,
	access_level	 VARCHAR(512) NOT NULL,
	last_login	 TIMESTAMP,
	PRIMARY KEY(id)
);

CREATE TABLE movement_category (
	id	 BIGSERIAL,
	name	 VARCHAR(512) NOT NULL,
	direction VARCHAR(512) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE task (
	id		 BIGSERIAL,
	title	 VARCHAR(512) NOT NULL,
	description	 TEXT,
	due_date	 TIMESTAMP NOT NULL,
	status	 VARCHAR(512) NOT NULL,
	completed_at TIMESTAMP NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE phase_history (
	id	 BIGSERIAL,
	changed_at TIMESTAMP NOT NULL,
	note	 TEXT,
	phase_id	 BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE phase (
	id	 BIGSERIAL,
	name	 VARCHAR(512) NOT NULL,
	position INTEGER NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE phase_history_phase (
	phase_history_id BIGINT,
	phase_id	 BIGINT NOT NULL,
	PRIMARY KEY(phase_history_id)
);

CREATE TABLE operation_phase_history (
	operation_id	 BIGINT NOT NULL,
	phase_history_id BIGINT,
	PRIMARY KEY(phase_history_id)
);

CREATE TABLE opportunity_phase_history (
	opportunity_id	 BIGINT NOT NULL,
	phase_history_id BIGINT,
	PRIMARY KEY(phase_history_id)
);

CREATE TABLE opportunity_task (
	opportunity_id BIGINT,
	task_id	 BIGINT,
	PRIMARY KEY(opportunity_id,task_id)
);

CREATE TABLE lead_task (
	lead_id BIGINT NOT NULL,
	task_id BIGINT,
	PRIMARY KEY(task_id)
);

CREATE TABLE users_contact (
	users_id	 BIGINT,
	contact_id BIGINT NOT NULL,
	PRIMARY KEY(users_id)
);

CREATE TABLE contact_role (
	contact_id BIGINT,
	role_id	 BIGINT,
	PRIMARY KEY(contact_id,role_id)
);

CREATE TABLE construction_budget_item_financial_movement (
	construction_budget_item_id BIGINT NOT NULL,
	financial_movement_id	 BIGINT,
	PRIMARY KEY(financial_movement_id)
);

CREATE TABLE contact_construction_budget_item (
	contact_id			 BIGINT NOT NULL,
	construction_budget_item_id BIGINT,
	PRIMARY KEY(construction_budget_item_id)
);

CREATE TABLE financial_movement_investment (
	financial_movement_id BIGINT,
	investment_id	 BIGINT NOT NULL,
	PRIMARY KEY(financial_movement_id)
);

CREATE TABLE financial_movement_operation (
	financial_movement_id BIGINT,
	operation_id		 BIGINT NOT NULL,
	PRIMARY KEY(financial_movement_id)
);

CREATE TABLE opportunity_lead (
	opportunity_id BIGINT,
	lead_id	 BIGINT NOT NULL,
	PRIMARY KEY(opportunity_id)
);

ALTER TABLE operation ADD UNIQUE (opportunity_id);
ALTER TABLE operation ADD CONSTRAINT operation_fk1 FOREIGN KEY (phase_id) REFERENCES phase(id);
ALTER TABLE operation ADD CONSTRAINT operation_fk2 FOREIGN KEY (contact_id) REFERENCES contact(id);
ALTER TABLE operation ADD CONSTRAINT operation_fk3 FOREIGN KEY (opportunity_id) REFERENCES opportunity(id);
ALTER TABLE opportunity ADD CONSTRAINT opportunity_fk1 FOREIGN KEY (phase_id) REFERENCES phase(id);
ALTER TABLE opportunity ADD CONSTRAINT opportunity_fk2 FOREIGN KEY (property_id) REFERENCES property(id);
ALTER TABLE lead ADD CONSTRAINT lead_fk1 FOREIGN KEY (lead_source_id) REFERENCES lead_source(id);
ALTER TABLE lead ADD CONSTRAINT lead_fk2 FOREIGN KEY (contact_id) REFERENCES contact(id);
ALTER TABLE lead ADD CONSTRAINT lead_fk3 FOREIGN KEY (contact_id1) REFERENCES contact(id);
ALTER TABLE construction_budget_item ADD CONSTRAINT construction_budget_item_fk1 FOREIGN KEY (construction_work_id) REFERENCES construction_work(id);
ALTER TABLE construction_work ADD CONSTRAINT construction_work_fk1 FOREIGN KEY (operation_id) REFERENCES operation(id);
ALTER TABLE investment ADD CONSTRAINT investment_fk1 FOREIGN KEY (contact_id) REFERENCES contact(id);
ALTER TABLE investment ADD CONSTRAINT investment_fk2 FOREIGN KEY (operation_id) REFERENCES operation(id);
ALTER TABLE financial_movement ADD CONSTRAINT financial_movement_fk1 FOREIGN KEY (movement_category_id) REFERENCES movement_category(id);
ALTER TABLE role ADD UNIQUE (name);
ALTER TABLE investor_profile ADD UNIQUE (contact_id);
ALTER TABLE investor_profile ADD CONSTRAINT investor_profile_fk1 FOREIGN KEY (contact_id) REFERENCES contact(id);
ALTER TABLE lead_source ADD UNIQUE (name);
ALTER TABLE users ADD UNIQUE (email);
ALTER TABLE phase_history ADD CONSTRAINT phase_history_fk1 FOREIGN KEY (phase_id) REFERENCES phase(id);
ALTER TABLE phase_history_phase ADD CONSTRAINT phase_history_phase_fk1 FOREIGN KEY (phase_history_id) REFERENCES phase_history(id);
ALTER TABLE phase_history_phase ADD CONSTRAINT phase_history_phase_fk2 FOREIGN KEY (phase_id) REFERENCES phase(id);
ALTER TABLE operation_phase_history ADD CONSTRAINT operation_phase_history_fk1 FOREIGN KEY (operation_id) REFERENCES operation(id);
ALTER TABLE operation_phase_history ADD CONSTRAINT operation_phase_history_fk2 FOREIGN KEY (phase_history_id) REFERENCES phase_history(id);
ALTER TABLE opportunity_phase_history ADD CONSTRAINT opportunity_phase_history_fk1 FOREIGN KEY (opportunity_id) REFERENCES opportunity(id);
ALTER TABLE opportunity_phase_history ADD CONSTRAINT opportunity_phase_history_fk2 FOREIGN KEY (phase_history_id) REFERENCES phase_history(id);
ALTER TABLE opportunity_task ADD CONSTRAINT opportunity_task_fk1 FOREIGN KEY (opportunity_id) REFERENCES opportunity(id);
ALTER TABLE opportunity_task ADD CONSTRAINT opportunity_task_fk2 FOREIGN KEY (task_id) REFERENCES task(id);
ALTER TABLE lead_task ADD CONSTRAINT lead_task_fk1 FOREIGN KEY (lead_id) REFERENCES lead(id);
ALTER TABLE lead_task ADD CONSTRAINT lead_task_fk2 FOREIGN KEY (task_id) REFERENCES task(id);
ALTER TABLE users_contact ADD UNIQUE (contact_id);
ALTER TABLE users_contact ADD CONSTRAINT users_contact_fk1 FOREIGN KEY (users_id) REFERENCES users(id);
ALTER TABLE users_contact ADD CONSTRAINT users_contact_fk2 FOREIGN KEY (contact_id) REFERENCES contact(id);
ALTER TABLE contact_role ADD CONSTRAINT contact_role_fk1 FOREIGN KEY (contact_id) REFERENCES contact(id);
ALTER TABLE contact_role ADD CONSTRAINT contact_role_fk2 FOREIGN KEY (role_id) REFERENCES role(id);
ALTER TABLE construction_budget_item_financial_movement ADD CONSTRAINT construction_budget_item_financial_movement_fk1 FOREIGN KEY (construction_budget_item_id) REFERENCES construction_budget_item(id);
ALTER TABLE construction_budget_item_financial_movement ADD CONSTRAINT construction_budget_item_financial_movement_fk2 FOREIGN KEY (financial_movement_id) REFERENCES financial_movement(id);
ALTER TABLE contact_construction_budget_item ADD CONSTRAINT contact_construction_budget_item_fk1 FOREIGN KEY (contact_id) REFERENCES contact(id);
ALTER TABLE contact_construction_budget_item ADD CONSTRAINT contact_construction_budget_item_fk2 FOREIGN KEY (construction_budget_item_id) REFERENCES construction_budget_item(id);
ALTER TABLE financial_movement_investment ADD CONSTRAINT financial_movement_investment_fk1 FOREIGN KEY (financial_movement_id) REFERENCES financial_movement(id);
ALTER TABLE financial_movement_investment ADD CONSTRAINT financial_movement_investment_fk2 FOREIGN KEY (investment_id) REFERENCES investment(id);
ALTER TABLE financial_movement_operation ADD CONSTRAINT financial_movement_operation_fk1 FOREIGN KEY (financial_movement_id) REFERENCES financial_movement(id);
ALTER TABLE financial_movement_operation ADD CONSTRAINT financial_movement_operation_fk2 FOREIGN KEY (operation_id) REFERENCES operation(id);
ALTER TABLE opportunity_lead ADD UNIQUE (lead_id);
ALTER TABLE opportunity_lead ADD CONSTRAINT opportunity_lead_fk1 FOREIGN KEY (opportunity_id) REFERENCES opportunity(id);
ALTER TABLE opportunity_lead ADD CONSTRAINT opportunity_lead_fk2 FOREIGN KEY (lead_id) REFERENCES lead(id);