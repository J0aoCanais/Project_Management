from http import HTTPStatus
import pytest
from app.extensions import db
from app.models import Contact, LeadSource, Lead, Role
from datetime import datetime, timedelta, timezone


now = datetime.now(timezone.utc)

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
            name="João Silva", email="joao@example.com", phone_number="912345678"
        )
        db.session.add(contact)
        db.session.commit()
        yield contact.id


@pytest.fixture
def sample_referrer(app):
    """Seed a referrer contact."""
    with app.app_context():
        referrer = Contact(name="Ana Consultora", email="ana@example.com")
        db.session.add(referrer)
        db.session.commit()
        yield referrer.id


# =====================================================================
# Happy Path Tests
# =====================================================================


def test_create_lead_with_existing_contact_success(
    client, active_lead_source, sample_contact
):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "message": "Interesse num apartamento T2",
        "campaign_name": "Campanha Outono",
    }

    response = client.post("/api/leads", json=payload)

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


def test_create_lead_with_new_contact_and_roles_success(
    client, active_lead_source, sample_role
):
    payload = {
        "lead_source_id": active_lead_source,
        "new_contact": {
            "name": "Maria Santos",
            "email": "maria@example.com",
            "phone_number": "961234567",
            "role_ids": [sample_role],
            "consent_given": True,
            "consent_channel": "Formulário Web",
        },
        "message": "Contacto inicial via site",
    }

    response = client.post("/api/leads", json=payload)

    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()
    assert data["status"] == "Nova"

    lead = db.session.get(Lead, data["id"])
    assert lead is not None
    assert lead.contact.name == "Maria Santos"
    assert lead.contact.consent_given is True
    assert any(role.id == sample_role for role in lead.contact.roles)


def test_create_lead_with_optional_referrer_success(
    client, active_lead_source, sample_contact, sample_referrer
):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "referrer_contact_id": sample_referrer,
        "message": "Referenciado por parceiro",
    }

    response = client.post("/api/leads", json=payload)

    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()

    lead = db.session.get(Lead, data["id"])
    assert lead.contact_id == sample_contact
    assert lead.contact_id1 == sample_referrer


# =====================================================================
# Validation and Business Rules
# =====================================================================


def test_create_lead_invalid_or_missing_json(client):
    response = client.post("/api/leads", data="not json", content_type="text/plain")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in response.get_json()["errors"]


def test_create_lead_missing_contact_and_new_contact(client, active_lead_source):
    payload = {"lead_source_id": active_lead_source, "message": "Sem contacto"}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "contact_id" in response.get_json()["errors"]


def test_create_lead_providing_both_contact_id_and_new_contact(
    client, active_lead_source, sample_contact
):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "new_contact": {"name": "Duplicado", "role_ids": []},
    }
    response = client.post("/api/leads", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "contact_id" in response.get_json()["errors"]


def test_create_lead_inactive_source(client, inactive_lead_source, sample_contact):
    payload = {"lead_source_id": inactive_lead_source, "contact_id": sample_contact}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "lead_source_id" in response.get_json()["errors"]


def test_create_lead_non_existent_contact(client, active_lead_source):
    payload = {"lead_source_id": active_lead_source, "contact_id": 999999}
    response = client.post("/api/leads", json=payload)
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "contact_id" in response.get_json()["errors"]


def test_create_lead_self_referral_rejected(client, active_lead_source, sample_contact):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "referrer_contact_id": sample_contact,
    }
    response = client.post("/api/leads", json=payload)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "referrer_contact_id" in response.get_json()["errors"]


def test_create_lead_non_existent_referrer(client, active_lead_source, sample_contact):
    payload = {
        "lead_source_id": active_lead_source,
        "contact_id": sample_contact,
        "referrer_contact_id": 999999,
    }
    response = client.post("/api/leads", json=payload)
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "referrer_contact_id" in response.get_json()["errors"]


# =====================================================================
# Authorization Tests
# =====================================================================


def test_create_lead_unauthorized_anon(anon_client, active_lead_source, sample_contact):
    """Anonymous client cannot access owner endpoints."""
    payload = {"lead_source_id": active_lead_source, "contact_id": sample_contact}
    response = anon_client.post("/api/leads", json=payload)
    assert response.status_code in (
        HTTPStatus.FOUND,
        HTTPStatus.UNAUTHORIZED,
        HTTPStatus.FORBIDDEN,
    )


def test_create_lead_unauthorized_investor(
    investor_client, active_lead_source, sample_contact
):
    """Investor client cannot access owner endpoints."""
    payload = {"lead_source_id": active_lead_source, "contact_id": sample_contact}
    response = investor_client.post("/api/leads", json=payload)
    assert response.status_code in (HTTPStatus.UNAUTHORIZED, HTTPStatus.FORBIDDEN)


def test_list_leads_empty(client):
    """Returns 200 and an empty list when no leads exist."""
    response = client.get("/api/leads")

    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == []


def test_list_leads_returns_ordered_by_created_at_desc(
    client, active_lead_source, sample_contact
):
    """Returns all leads ordered from newest to oldest."""
    now = datetime.now(timezone.utc)
    older_lead = Lead(
        status="Nova",
        message="Older lead",
        created_at=now - timedelta(hours=2),
        lead_source_id=active_lead_source,
        contact_id=sample_contact,
    )
    newer_lead = Lead(
        status="Em Contacto",
        message="Newer lead",
        created_at=now,
        lead_source_id=active_lead_source,
        contact_id=sample_contact,
    )
    db.session.add_all([older_lead, newer_lead])
    db.session.commit()

    response = client.get("/api/leads")
    data = response.get_json()

    assert response.status_code == HTTPStatus.OK
    assert len(data) == 2
    assert data[0]["message"] == "Newer lead"
    assert data[1]["message"] == "Older lead"


def test_list_leads_filter_by_status(client, active_lead_source, sample_contact):
    """Filters leads cleanly when ?status= query param is passed."""
    lead_nova = Lead(
        status="Nova",
        message="Lead Nova",
        created_at=datetime.now(timezone.utc),
        lead_source_id=active_lead_source,
        contact_id=sample_contact,
    )
    lead_qualificada = Lead(
        status="Qualificada",
        message="Lead Qualificada",
        created_at=datetime.now(timezone.utc),
        lead_source_id=active_lead_source,
        contact_id=sample_contact,
    )
    db.session.add_all([lead_nova, lead_qualificada])
    db.session.commit()

    response = client.get("/api/leads?status=Nova")
    data = response.get_json()

    assert response.status_code == HTTPStatus.OK
    assert len(data) == 1
    assert data[0]["status"] == "Nova"
    assert data[0]["message"] == "Lead Nova"


def test_list_leads_unauthorized_anon(anon_client):
    """Anonymous users are rejected/redirected by @owner_required."""
    response = anon_client.get("/api/leads")
    assert response.status_code in (
        HTTPStatus.FOUND,
        HTTPStatus.UNAUTHORIZED,
        HTTPStatus.FORBIDDEN,
    )


def test_list_leads_unauthorized_investor(investor_client):
    """Non-owner authenticated users (e.g. investor) cannot list leads."""
    response = investor_client.get("/api/leads")
    assert response.status_code in (HTTPStatus.UNAUTHORIZED, HTTPStatus.FORBIDDEN)


def test_list_leads_search_by_contact_name_and_contact_info(client, active_lead_source):
    """Filters leads case-insensitively by contact name, email, or phone number."""

    contact_maria = Contact(
        name="Maria Silva",
        email="maria.silva@example.com",
        phone_number="912345678",
        consent_given=True,
        consent_channel="Web",
    )
    contact_joao = Contact(
        name="João Santos",
        email="joao.santos@example.com",
        phone_number="969876543",
        consent_given=True,
        consent_channel="Web",
    )
    db.session.add_all([contact_maria, contact_joao])
    db.session.flush()

    lead_1 = Lead(
        status="Nova",
        message="T2",
        created_at=now,
        lead_source_id=active_lead_source,
        contact_id=contact_maria.id,
    )
    lead_2 = Lead(
        status="Nova",
        message="T3",
        created_at=now,
        lead_source_id=active_lead_source,
        contact_id=contact_joao.id,
    )
    db.session.add_all([lead_1, lead_2])
    db.session.commit()

    # 1. Partial case-insensitive name match
    res_name = client.get("/api/leads?search=maria")
    assert res_name.status_code == HTTPStatus.OK
    assert len(res_name.get_json()) == 1
    assert res_name.get_json()[0]["message"] == "T2"

    # 2. Partial phone number match
    res_phone = client.get("/api/leads?search=96987")
    assert res_phone.status_code == HTTPStatus.OK
    assert len(res_phone.get_json()) == 1
    assert res_phone.get_json()[0]["message"] == "T3"

    # 3. Partial email match
    res_email = client.get("/api/leads?search=SILVA@EXAMPLE")
    assert res_email.status_code == HTTPStatus.OK
    assert len(res_email.get_json()) == 1
    assert res_email.get_json()[0]["message"] == "T2"


def test_list_leads_search_combined_with_status_filter(client, active_lead_source):
    """Combines ?search= and ?status= filters together."""
    contact = Contact(
        name="Ana Costa",
        email="ana@example.com",
        phone_number="911111111",
        consent_given=True,
        consent_channel="Web",
    )
    db.session.add(contact)
    db.session.flush()

    lead_nova = Lead(
        status="Nova",
        message="Match",
        created_at=now,
        lead_source_id=active_lead_source,
        contact_id=contact.id,
    )
    lead_fechada = Lead(
        status="Fechada",
        message="No match",
        created_at=now,
        lead_source_id=active_lead_source,
        contact_id=contact.id,
    )
    db.session.add_all([lead_nova, lead_fechada])
    db.session.commit()

    response = client.get("/api/leads?status=Nova&search=Ana")
    data = response.get_json()

    assert response.status_code == HTTPStatus.OK
    assert len(data) == 1
    assert data[0]["message"] == "Match"
