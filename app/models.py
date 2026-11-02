"""SQLAlchemy 2.0 models generated from the provided SQL schema (PostgreSQL)."""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# ---------------------------------------------------------------------------
# Association tables
#
# Tables whose primary key is a single column (or whose second column is
# UNIQUE) are really one-to-many / one-to-one links in the schema. They are
# kept as association tables to match the SQL exactly, and the relationships
# built on top of them use `uselist=False` on the "one" side.
# ---------------------------------------------------------------------------

financing_financial_movement = Table(
    "financing_financial_movement",
    Base.metadata,
    Column("financing_id", BigInteger, ForeignKey("financing.id"), nullable=False),
    Column("financial_movement_id", BigInteger, ForeignKey("financial_movement.id"), primary_key=True),
)

users_audit_log = Table(
    "users_audit_log",
    Base.metadata,
    Column("users_id", BigInteger, ForeignKey("users.id"), nullable=False),
    Column("audit_log_id", BigInteger, ForeignKey("audit_log.id"), primary_key=True),
)

financial_movement_document = Table(
    "financial_movement_document",
    Base.metadata,
    Column("financial_movement_id", BigInteger, ForeignKey("financial_movement.id"), nullable=False),
    Column("document_id", BigInteger, ForeignKey("document.id"), primary_key=True),
)

investment_document = Table(
    "investment_document",
    Base.metadata,
    Column("investment_id", BigInteger, ForeignKey("investment.id"), nullable=False),
    Column("document_id", BigInteger, ForeignKey("document.id"), primary_key=True),
)

construction_budget_item_document = Table(
    "construction_budget_item_document",
    Base.metadata,
    Column("construction_budget_item_id", BigInteger, ForeignKey("construction_budget_item.id"), nullable=False),
    Column("document_id", BigInteger, ForeignKey("document.id"), primary_key=True),
)

construction_work_document = Table(
    "construction_work_document",
    Base.metadata,
    Column("construction_work_id", BigInteger, ForeignKey("construction_work.id"), nullable=False),
    Column("document_id", BigInteger, ForeignKey("document.id"), primary_key=True),
)

operation_document = Table(
    "operation_document",
    Base.metadata,
    Column("operation_id", BigInteger, ForeignKey("operation.id"), nullable=False),
    Column("document_id", BigInteger, ForeignKey("document.id"), primary_key=True),
)

opportunity_document = Table(
    "opportunity_document",
    Base.metadata,
    Column("opportunity_id", BigInteger, ForeignKey("opportunity.id"), nullable=False),
    Column("document_id", BigInteger, ForeignKey("document.id"), primary_key=True),
)

property_document = Table(
    "property_document",
    Base.metadata,
    Column("property_id", BigInteger, ForeignKey("property.id"), nullable=False),
    Column("document_id", BigInteger, ForeignKey("document.id"), primary_key=True),
)

contact_document = Table(
    "contact_document",
    Base.metadata,
    Column("contact_id", BigInteger, ForeignKey("contact.id"), nullable=False),
    Column("document_id", BigInteger, ForeignKey("document.id"), primary_key=True),
)

phase_history_phase = Table(
    "phase_history_phase",
    Base.metadata,
    Column("phase_history_id", BigInteger, ForeignKey("phase_history.id"), primary_key=True),
    Column("phase_id", BigInteger, ForeignKey("phase.id"), nullable=False),
)

operation_phase_history = Table(
    "operation_phase_history",
    Base.metadata,
    Column("operation_id", BigInteger, ForeignKey("operation.id"), nullable=False),
    Column("phase_history_id", BigInteger, ForeignKey("phase_history.id"), primary_key=True),
)

opportunity_phase_history = Table(
    "opportunity_phase_history",
    Base.metadata,
    Column("opportunity_id", BigInteger, ForeignKey("opportunity.id"), nullable=False),
    Column("phase_history_id", BigInteger, ForeignKey("phase_history.id"), primary_key=True),
)

# True many-to-many (composite primary key)
opportunity_task = Table(
    "opportunity_task",
    Base.metadata,
    Column("opportunity_id", BigInteger, ForeignKey("opportunity.id"), primary_key=True),
    Column("task_id", BigInteger, ForeignKey("task.id"), primary_key=True),
)

lead_task = Table(
    "lead_task",
    Base.metadata,
    Column("lead_id", BigInteger, ForeignKey("lead.id"), nullable=False),
    Column("task_id", BigInteger, ForeignKey("task.id"), primary_key=True),
)

# One-to-one (contact_id is UNIQUE)
users_contact = Table(
    "users_contact",
    Base.metadata,
    Column("users_id", BigInteger, ForeignKey("users.id"), primary_key=True),
    Column("contact_id", BigInteger, ForeignKey("contact.id"), nullable=False, unique=True),
)

# True many-to-many (composite primary key)
contact_role = Table(
    "contact_role",
    Base.metadata,
    Column("contact_id", BigInteger, ForeignKey("contact.id"), primary_key=True),
    Column("role_id", BigInteger, ForeignKey("role.id"), primary_key=True),
)

construction_budget_item_financial_movement = Table(
    "construction_budget_item_financial_movement",
    Base.metadata,
    Column("construction_budget_item_id", BigInteger, ForeignKey("construction_budget_item.id"), nullable=False),
    Column("financial_movement_id", BigInteger, ForeignKey("financial_movement.id"), primary_key=True),
)

contact_construction_budget_item = Table(
    "contact_construction_budget_item",
    Base.metadata,
    Column("contact_id", BigInteger, ForeignKey("contact.id"), nullable=False),
    Column("construction_budget_item_id", BigInteger, ForeignKey("construction_budget_item.id"), primary_key=True),
)

financial_movement_investment = Table(
    "financial_movement_investment",
    Base.metadata,
    Column("financial_movement_id", BigInteger, ForeignKey("financial_movement.id"), primary_key=True),
    Column("investment_id", BigInteger, ForeignKey("investment.id"), nullable=False),
)

financial_movement_operation = Table(
    "financial_movement_operation",
    Base.metadata,
    Column("financial_movement_id", BigInteger, ForeignKey("financial_movement.id"), primary_key=True),
    Column("operation_id", BigInteger, ForeignKey("operation.id"), nullable=False),
)

# One-to-one (lead_id is UNIQUE)
opportunity_lead = Table(
    "opportunity_lead",
    Base.metadata,
    Column("opportunity_id", BigInteger, ForeignKey("opportunity.id"), primary_key=True),
    Column("lead_id", BigInteger, ForeignKey("lead.id"), nullable=False, unique=True),
)


# ---------------------------------------------------------------------------
# Core entities
# ---------------------------------------------------------------------------

class Contact(Base):
    __tablename__ = "contact"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    type: Mapped[str] = mapped_column(String(512), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(512))
    phone_number: Mapped[Optional[str]] = mapped_column(String(512))
    address: Mapped[Optional[str]] = mapped_column(Text)
    company_name: Mapped[Optional[str]] = mapped_column(String(512))
    zone: Mapped[Optional[str]] = mapped_column(String(512))
    notes: Mapped[Optional[str]] = mapped_column(String(512))
    nif: Mapped[Optional[str]] = mapped_column(String(512))
    consent_given: Mapped[Optional[bool]] = mapped_column(Boolean)
    consent_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    consent_channel: Mapped[Optional[str]] = mapped_column(String(512))

    # relationships
    operations: Mapped[List["Operation"]] = relationship(back_populates="contact")
    investments: Mapped[List["Investment"]] = relationship(back_populates="contact")
    investor_profile: Mapped[Optional["InvestorProfile"]] = relationship(
        back_populates="contact", uselist=False
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(back_populates="contact")
    # Lead has two FKs to contact (contact_id and contact_id1)
    leads: Mapped[List["Lead"]] = relationship(
        back_populates="contact", foreign_keys="Lead.contact_id"
    )
    leads1: Mapped[List["Lead"]] = relationship(
        back_populates="contact1", foreign_keys="Lead.contact_id1"
    )
    roles: Mapped[List["Role"]] = relationship(
        secondary=contact_role, back_populates="contacts"
    )
    user: Mapped[Optional["User"]] = relationship(
        secondary=users_contact, back_populates="contact", uselist=False
    )
    documents: Mapped[List["Document"]] = relationship(
        secondary=contact_document, back_populates="contact"
    )
    construction_budget_items: Mapped[List["ConstructionBudgetItem"]] = relationship(
        secondary=contact_construction_budget_item, back_populates="contact"
    )


class Role(Base):
    __tablename__ = "role"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)

    contacts: Mapped[List["Contact"]] = relationship(
        secondary=contact_role, back_populates="roles"
    )


class User(UserMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    username: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    access_level: Mapped[str] = mapped_column(String(512), nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)

    audit_logs: Mapped[List["AuditLog"]] = relationship(
        secondary=users_audit_log, back_populates="user"
    )
    contact: Mapped[Optional["Contact"]] = relationship(
        secondary=users_contact, back_populates="user", uselist=False
    )


class InvestorProfile(Base):
    __tablename__ = "investor_profile"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    available_capital: Mapped[Optional[float]] = mapped_column(Float(8))
    risk_profile: Mapped[Optional[str]] = mapped_column(String(512))
    preferred_zones: Mapped[Optional[str]] = mapped_column(Text)
    min_amount: Mapped[Optional[float]] = mapped_column(Float(8))
    max_amount: Mapped[Optional[float]] = mapped_column(Float(8))
    preferred_terms: Mapped[Optional[str]] = mapped_column(Text)
    relation_status: Mapped[str] = mapped_column(String(512), nullable=False)
    contact_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("contact.id"), nullable=False, unique=True
    )

    contact: Mapped["Contact"] = relationship(back_populates="investor_profile")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    action: Mapped[str] = mapped_column(String(512), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    contact_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("contact.id"), nullable=False
    )

    contact: Mapped["Contact"] = relationship(back_populates="audit_logs")
    user: Mapped[Optional["User"]] = relationship(
        secondary=users_audit_log, back_populates="audit_logs", uselist=False
    )


# ---------------------------------------------------------------------------
# Pipeline: leads -> opportunities -> operations
# ---------------------------------------------------------------------------

class Phase(Base):
    __tablename__ = "phase"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    max_days_stalled: Mapped[Optional[int]] = mapped_column(Integer)

    opportunities: Mapped[List["Opportunity"]] = relationship(back_populates="phase")
    operations: Mapped[List["Operation"]] = relationship(back_populates="phase")
    phase_histories: Mapped[List["PhaseHistory"]] = relationship(back_populates="phase")
    # via the phase_history_phase link table
    linked_phase_histories: Mapped[List["PhaseHistory"]] = relationship(
        secondary=phase_history_phase, back_populates="linked_phase"
    )


class PhaseHistory(Base):
    __tablename__ = "phase_history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text)
    phase_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("phase.id"), nullable=False
    )

    phase: Mapped["Phase"] = relationship(back_populates="phase_histories")
    linked_phase: Mapped[Optional["Phase"]] = relationship(
        secondary=phase_history_phase,
        back_populates="linked_phase_histories",
        uselist=False,
    )
    operation: Mapped[Optional["Operation"]] = relationship(
        secondary=operation_phase_history,
        back_populates="phase_histories",
        uselist=False,
    )
    opportunity: Mapped[Optional["Opportunity"]] = relationship(
        secondary=opportunity_phase_history,
        back_populates="phase_histories",
        uselist=False,
    )


class LeadSource(Base):
    __tablename__ = "lead_source"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)

    leads: Mapped[List["Lead"]] = relationship(back_populates="lead_source")


class Lead(Base):
    __tablename__ = "lead"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    status: Mapped[str] = mapped_column(String(512), nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text)
    discard_reason: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    campaign_name: Mapped[Optional[str]] = mapped_column(String(512))
    ad_name: Mapped[Optional[str]] = mapped_column(String(512))
    form_name: Mapped[Optional[str]] = mapped_column(String(512))
    lead_source_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("lead_source.id"), nullable=False
    )
    contact_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("contact.id"), nullable=False
    )
    contact_id1: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("contact.id"), nullable=False
    )

    lead_source: Mapped["LeadSource"] = relationship(back_populates="leads")
    contact: Mapped["Contact"] = relationship(
        back_populates="leads", foreign_keys=[contact_id]
    )
    contact1: Mapped["Contact"] = relationship(
        back_populates="leads1", foreign_keys=[contact_id1]
    )
    tasks: Mapped[List["Task"]] = relationship(
        secondary=lead_task, back_populates="lead"
    )
    opportunity: Mapped[Optional["Opportunity"]] = relationship(
        secondary=opportunity_lead, back_populates="lead", uselist=False
    )


class Task(Base):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(512), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    opportunities: Mapped[List["Opportunity"]] = relationship(
        secondary=opportunity_task, back_populates="tasks"
    )
    lead: Mapped[Optional["Lead"]] = relationship(
        secondary=lead_task, back_populates="tasks", uselist=False
    )


class Property(Base):
    __tablename__ = "property"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(String(512), nullable=False)
    typology: Mapped[str] = mapped_column(String(512), nullable=False)
    zone: Mapped[str] = mapped_column(String(512), nullable=False)
    area_m2: Mapped[float] = mapped_column(Float(8), nullable=False)
    asking_price: Mapped[float] = mapped_column(Float(8), nullable=False)
    vvr: Mapped[float] = mapped_column(Float(8), nullable=False)
    profit: Mapped[float] = mapped_column(Float(8), nullable=False)
    max_proposal: Mapped[float] = mapped_column(Float(8), nullable=False)
    first_proposal: Mapped[float] = mapped_column(Float(8), nullable=False)
    visit_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    admin_location: Mapped[Optional[str]] = mapped_column(String(512))
    property_type: Mapped[Optional[str]] = mapped_column(String(512))
    property_condition: Mapped[Optional[str]] = mapped_column(String(512))
    construction_year: Mapped[Optional[int]] = mapped_column(Integer)
    matricial_article: Mapped[Optional[str]] = mapped_column(String(512))
    predial_description: Mapped[Optional[str]] = mapped_column(Text)
    usage_license: Mapped[Optional[str]] = mapped_column(String(512))
    energy_certificate: Mapped[Optional[str]] = mapped_column(String(512))

    opportunities: Mapped[List["Opportunity"]] = relationship(back_populates="property")
    documents: Mapped[List["Document"]] = relationship(
        secondary=property_document, back_populates="property"
    )


class Opportunity(Base):
    __tablename__ = "opportunity"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    current_status: Mapped[str] = mapped_column(String(512), nullable=False)
    purchase_price: Mapped[Optional[float]] = mapped_column(Float(8))
    acquisition_costs: Mapped[Optional[float]] = mapped_column(Float(8))
    work_cost: Mapped[Optional[float]] = mapped_column(Float(8))
    other_costs: Mapped[Optional[float]] = mapped_column(Float(8))
    expected_sale_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    expected_sale_price: Mapped[Optional[float]] = mapped_column(Float(8))
    term_months: Mapped[Optional[int]] = mapped_column(Integer)
    last_activity_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    phase_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("phase.id"), nullable=False
    )
    property_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("property.id"), nullable=False
    )

    phase: Mapped["Phase"] = relationship(back_populates="opportunities")
    property: Mapped["Property"] = relationship(back_populates="opportunities")
    operation: Mapped[Optional["Operation"]] = relationship(
        back_populates="opportunity", uselist=False
    )
    tasks: Mapped[List["Task"]] = relationship(
        secondary=opportunity_task, back_populates="opportunities"
    )
    lead: Mapped[Optional["Lead"]] = relationship(
        secondary=opportunity_lead, back_populates="opportunity", uselist=False
    )
    phase_histories: Mapped[List["PhaseHistory"]] = relationship(
        secondary=opportunity_phase_history, back_populates="opportunity"
    )
    documents: Mapped[List["Document"]] = relationship(
        secondary=opportunity_document, back_populates="opportunity"
    )


class Operation(Base):
    __tablename__ = "operation"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(512), nullable=False)
    real_purchase_price: Mapped[float] = mapped_column(Float(8), nullable=False)
    advertised_price: Mapped[Optional[float]] = mapped_column(Float(8))
    final_sale_price: Mapped[Optional[float]] = mapped_column(Float(8))
    sale_deed_date: Mapped[Optional[date]] = mapped_column(Date)
    phase_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("phase.id"), nullable=False
    )
    contact_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("contact.id"), nullable=False
    )
    opportunity_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("opportunity.id"), nullable=False, unique=True
    )

    phase: Mapped["Phase"] = relationship(back_populates="operations")
    contact: Mapped["Contact"] = relationship(back_populates="operations")
    opportunity: Mapped["Opportunity"] = relationship(back_populates="operation")
    construction_works: Mapped[List["ConstructionWork"]] = relationship(
        back_populates="operation"
    )
    investments: Mapped[List["Investment"]] = relationship(back_populates="operation")
    phase_histories: Mapped[List["PhaseHistory"]] = relationship(
        secondary=operation_phase_history, back_populates="operation"
    )
    financial_movements: Mapped[List["FinancialMovement"]] = relationship(
        secondary=financial_movement_operation, back_populates="operation"
    )
    documents: Mapped[List["Document"]] = relationship(
        secondary=operation_document, back_populates="operation"
    )


# ---------------------------------------------------------------------------
# Construction
# ---------------------------------------------------------------------------

class ConstructionWork(Base):
    __tablename__ = "construction_work"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    state: Mapped[str] = mapped_column(String(512), nullable=False)
    planned_start_date: Mapped[Optional[date]] = mapped_column(Date)
    planned_end_date: Mapped[Optional[date]] = mapped_column(Date)
    real_start_date: Mapped[Optional[date]] = mapped_column(Date)
    real_end_date: Mapped[Optional[date]] = mapped_column(Date)
    operation_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("operation.id"), nullable=False
    )

    operation: Mapped["Operation"] = relationship(back_populates="construction_works")
    budget_items: Mapped[List["ConstructionBudgetItem"]] = relationship(
        back_populates="construction_work"
    )
    documents: Mapped[List["Document"]] = relationship(
        secondary=construction_work_document, back_populates="construction_work"
    )


class ConstructionBudgetItem(Base):
    __tablename__ = "construction_budget_item"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    category_name: Mapped[str] = mapped_column(String(512), nullable=False)
    budgeted_value: Mapped[Optional[float]] = mapped_column(Float(8))
    contracted_value: Mapped[Optional[float]] = mapped_column(Float(8))
    executed_value: Mapped[Optional[float]] = mapped_column(Float(8))
    invoiced_value: Mapped[Optional[float]] = mapped_column(Float(8))
    paid_value: Mapped[Optional[float]] = mapped_column(Float(8))
    construction_work_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("construction_work.id"), nullable=False
    )

    construction_work: Mapped["ConstructionWork"] = relationship(
        back_populates="budget_items"
    )
    financial_movements: Mapped[List["FinancialMovement"]] = relationship(
        secondary=construction_budget_item_financial_movement,
        back_populates="construction_budget_item",
    )
    contact: Mapped[Optional["Contact"]] = relationship(
        secondary=contact_construction_budget_item,
        back_populates="construction_budget_items",
        uselist=False,
    )
    documents: Mapped[List["Document"]] = relationship(
        secondary=construction_budget_item_document,
        back_populates="construction_budget_item",
    )


# ---------------------------------------------------------------------------
# Finance
# ---------------------------------------------------------------------------

class Investment(Base):
    __tablename__ = "investment"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    committed_value: Mapped[Optional[float]] = mapped_column(Float(8))
    participation_percentage: Mapped[Optional[float]] = mapped_column(Float(8))
    return_type: Mapped[Optional[str]] = mapped_column(String(512))
    return_rate: Mapped[Optional[float]] = mapped_column(Float(8))
    agreement_date: Mapped[Optional[date]] = mapped_column(Date)
    contact_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("contact.id"), nullable=False
    )
    operation_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("operation.id"), nullable=False
    )

    contact: Mapped["Contact"] = relationship(back_populates="investments")
    operation: Mapped["Operation"] = relationship(back_populates="investments")
    financial_movements: Mapped[List["FinancialMovement"]] = relationship(
        secondary=financial_movement_investment, back_populates="investment"
    )
    documents: Mapped[List["Document"]] = relationship(
        secondary=investment_document, back_populates="investment"
    )


class MovementCategory(Base):
    __tablename__ = "movement_category"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    direction: Mapped[str] = mapped_column(String(512), nullable=False)

    financial_movements: Mapped[List["FinancialMovement"]] = relationship(
        back_populates="movement_category"
    )


class FinancialMovement(Base):
    __tablename__ = "financial_movement"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String(512), nullable=False)
    amount: Mapped[float] = mapped_column(Float(8), nullable=False)
    expected_date: Mapped[Optional[date]] = mapped_column(Date)
    effective_date: Mapped[Optional[date]] = mapped_column(Date)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[Optional[str]] = mapped_column(String(512))
    movement_category_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("movement_category.id"), nullable=False
    )

    movement_category: Mapped["MovementCategory"] = relationship(
        back_populates="financial_movements"
    )
    financing: Mapped[Optional["Financing"]] = relationship(
        secondary=financing_financial_movement,
        back_populates="financial_movements",
        uselist=False,
    )
    construction_budget_item: Mapped[Optional["ConstructionBudgetItem"]] = relationship(
        secondary=construction_budget_item_financial_movement,
        back_populates="financial_movements",
        uselist=False,
    )
    investment: Mapped[Optional["Investment"]] = relationship(
        secondary=financial_movement_investment,
        back_populates="financial_movements",
        uselist=False,
    )
    operation: Mapped[Optional["Operation"]] = relationship(
        secondary=financial_movement_operation,
        back_populates="financial_movements",
        uselist=False,
    )
    documents: Mapped[List["Document"]] = relationship(
        secondary=financial_movement_document, back_populates="financial_movement"
    )


class Financing(Base):
    __tablename__ = "financing"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    amount: Mapped[Optional[float]] = mapped_column(Float(8))

    financial_movements: Mapped[List["FinancialMovement"]] = relationship(
        secondary=financing_financial_movement, back_populates="financing"
    )


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------

class Document(Base):
    __tablename__ = "document"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    type: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[Optional[str]] = mapped_column(String(512))
    file_size: Mapped[Optional[int]] = mapped_column(Integer)
    file_hash: Mapped[Optional[str]] = mapped_column(String(512))
    photo_stage: Mapped[Optional[str]] = mapped_column(String(512))
    expiry_date: Mapped[Optional[date]] = mapped_column(Date)

    # A document belongs to (at most) one owner through each link table
    financial_movement: Mapped[Optional["FinancialMovement"]] = relationship(
        secondary=financial_movement_document, back_populates="documents", uselist=False
    )
    investment: Mapped[Optional["Investment"]] = relationship(
        secondary=investment_document, back_populates="documents", uselist=False
    )
    construction_budget_item: Mapped[Optional["ConstructionBudgetItem"]] = relationship(
        secondary=construction_budget_item_document, back_populates="documents", uselist=False
    )
    construction_work: Mapped[Optional["ConstructionWork"]] = relationship(
        secondary=construction_work_document, back_populates="documents", uselist=False
    )
    operation: Mapped[Optional["Operation"]] = relationship(
        secondary=operation_document, back_populates="documents", uselist=False
    )
    opportunity: Mapped[Optional["Opportunity"]] = relationship(
        secondary=opportunity_document, back_populates="documents", uselist=False
    )
    property: Mapped[Optional["Property"]] = relationship(
        secondary=property_document, back_populates="documents", uselist=False
    )
    contact: Mapped[Optional["Contact"]] = relationship(
        secondary=contact_document, back_populates="documents", uselist=False
    )