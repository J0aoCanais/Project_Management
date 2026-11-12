from http import HTTPStatus
import pytest
from app.extensions import db
from app.models import Contact, LeadSource, Lead, Role


@pytest.fixture
def active_lead_source(app):
    """Seed an active lead source."""
    with app.app_context():
        source = LeadSource(name="Idealista", is_active=True)
        db.session.add(source)
        db.session.commit()
        yield source.id


@pytest.fixture
def inactive_lead_source(app):
    """Seed an inactive lead source."""
    with app.app_context():
        source = LeadSource(name="Desativado", is_active=False)
        db.session.add(source)
        db.session.commit()
        yield source.id


@pytest.fixture
def sample_role(app):
    """Seed a contact role."""
    with app.app_context():
        role = Role(name="Comprador")
        db.session.add(role)
        db.session.commit()
        yield role.id


@pytest.fixture
def sample_contact(app, sample_role):
    """Seed a base contact matching app.models.Contact (no 'type' column)."""
    with app.app_context():
        contact = Contact(
            name="João Silva",
            email="joao@example.com",
            phone_number="912345678"
        )
        db.session.add(contact)
        db.session.commit()
        yield contact.id


@pytest.fixture
def sample_referrer(app):
    """Seed a referrer contact."""
    with app.app_context():
        referrer = Contact(
            name="Ana Consultora",
            email="ana@example.com"
        )
        db.session.add(referrer)
        db.session.commit()
        yield referrer.id


# =====================================================================
# Happy Path Tests
# =====================================================================

def test_create_lead_with_existing_contact_success(client, active_lead_source, sample_contact):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "message": "Interesse num apartamento T2",
        "campaign_name": "Campanha Outono"
    }

    response = client.post("/leads", json=payload)

    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()
    assert data["status"] == "Nova"
    assert data["message"] == "Interesse num apartamento T2"
    assert data["lead_source_id"] == active_lead_source

    lead = db.session.get(Lead, data["id"])
    assert lead is not None
    assert lead.status == "Nova"
    assert lead.contact_id == sample_contact
    assert lead.contact_id1 is None


def test_create_lead_with_new_contact_and_roles_success(client, active_lead_source, sample_role):
    payload = {
        "lead_source_id": active_lead_source,
        "new_contact": {
            "name": "Maria Santos",
            "email": "maria@example.com",
            "phone_number": "961234567",
            "role_ids": [sample_role],
            "consent_given": True,
            "consent_channel": "Formulário Web"
        },
        "message": "Contacto inicial via site"
    }

    response = client.post("/leads", json=payload)

    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()
    assert data["status"] == "Nova"

    lead = db.session.get(Lead, data["id"])
    assert lead is not None
    assert lead.contact.name == "Maria Santos"
    assert lead.contact.consent_given is True
    assert any(role.id == sample_role for role in lead.contact.roles)


def test_create_lead_with_optional_referrer_success(client, active_lead_source, sample_contact, sample_referrer):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "referrer_contact_id": sample_referrer,
        "message": "Referenciado por parceiro"
    }

    response = client.post("/leads", json=payload)

    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()

    lead = db.session.get(Lead, data["id"])
    assert lead.contact_id == sample_contact
    assert lead.contact_id1 == sample_referrer


# =====================================================================
# Validation and Business Rules
# =====================================================================

def test_create_lead_invalid_or_missing_json(client):
    response = client.post("/leads", data="not json", content_type="text/plain")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in response.get_json()["errors"]


def test_create_lead_missing_contact_and_new_contact(client, active_lead_source):
    payload = {
        "lead_source_id": active_lead_source,
        "message": "Sem contacto"
    }
    response = client.post("/leads", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "contact_id" in response.get_json()["errors"]


def test_create_lead_providing_both_contact_id_and_new_contact(client, active_lead_source, sample_contact):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "new_contact": {
            "name": "Duplicado",
            "role_ids": []
        }
    }
    response = client.post("/leads", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "contact_id" in response.get_json()["errors"]


def test_create_lead_inactive_source(client, inactive_lead_source, sample_contact):
    payload = {
        "lead_source_id": inactive_lead_source,
        "contact_id": sample_contact
    }
    response = client.post("/leads", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "lead_source_id" in response.get_json()["errors"]


def test_create_lead_non_existent_contact(client, active_lead_source):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": 999999
    }
    response = client.post("/leads", json=payload)
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "contact_id" in response.get_json()["errors"]


def test_create_lead_self_referral_rejected(client, active_lead_source, sample_contact):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "referrer_contact_id": sample_contact
    }
    response = client.post("/leads", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "referrer_contact_id" in response.get_json()["errors"]


def test_create_lead_non_existent_referrer(client, active_lead_source, sample_contact):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "referrer_contact_id": 999999
    }
    response = client.post("/leads", json=payload)
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "referrer_contact_id" in response.get_json()["errors"]


# =====================================================================
# Authorization Tests
# =====================================================================

def test_create_lead_unauthorized_anon(anon_client, active_lead_source, sample_contact):
    """Anonymous client cannot access owner endpoints."""
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact
    }
    response = anon_client.post("/leads", json=payload)
    assert response.status_code in (HTTPStatus.FOUND, HTTPStatus.UNAUTHORIZED, HTTPStatus.FORBIDDEN)


def test_create_lead_unauthorized_investor(investor_client, active_lead_source, sample_contact):
    """Investor client cannot access owner endpoints."""
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact
    }
    response = investor_client.post("/leads", json=payload)
    assert response.status_code in (HTTPStatus.UNAUTHORIZED, HTTPStatus.FORBIDDEN)
