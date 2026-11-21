"""
Tests for the leads blueprint (leads_routes.py).

Uses the fixtures from conftest.py (client, investor_client, anon_client,
url, csrf_on, csrf_headers, make_contact, make_payload) and adds the lead
fixtures below.

Tests marked xfail(strict=False) document KNOWN BUGS in the current code. They
keep the suite green today; when you fix a bug the test starts to XPASS, and you
should then delete its xfail marker so it guards against regressions.

NOTE: if the unique() problem in get_lead exists (see BUG_GET_LEAD), every test in
TestGetLead fails with InvalidRequestError. That is the endpoint being broken, not
the tests.
"""
import itertools
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import func

from app.extensions import db  # ADAPT
from app.models import Contact, ContactLog, Lead, LeadSource  # ADAPT

BUG_SOFT_DELETED = "BUG: soft-deleted contacts can still be attached to a lead"
BUG_LIKE_ESCAPE = "BUG: list_leads search does not escape LIKE wildcards (% and _)"
BUG_DOUBLE_JOIN = "BUG: search + zone_id join Lead.contact twice"
BUG_UPDATE_REFS = "BUG: update_lead does not validate lead_source_id / contact_id1 (IntegrityError -> unhandled 500)"
BUG_REFERRER_KEY = "BUG: LeadResponseSchema.referrer needs attribute='contact1' (or similar)"
BUG_LOG_ORDER = "Lead.contact_logs has no order_by (newest first)"

CONTACT_KEYS_ALLOWED = {"id", "name", "phone_number", "zone"}  # CONTACT_FIELDS in leads_schema
ZONE_ID_AVAILABLE = hasattr(Contact, "zone_id")

_n = itertools.count(1)


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def is_rejected(resp):
    """401/403, or a redirect to login. ADAPT/tighten to your owner_required."""
    if resp.status_code in (401, 403):
        return True
    return resp.status_code in (301, 302, 303, 307, 308) and "login" in resp.headers.get("Location", "")


def errors_of(resp):
    """The leads routes answer with either {"errors": ...} or {"error": ...}."""
    body = resp.get_json()
    return body.get("errors") or body.get("error")


def count(model):
    return db.session.scalar(db.select(func.count()).select_from(model))


def aware(dt):
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


# --------------------------------------------------------------------------- #
# fixtures
# --------------------------------------------------------------------------- #
@pytest.fixture
def make_lead_source():
    def _make(**overrides):
        fields = {"name": f"Source {next(_n)}", "is_active": True}
        fields.update(overrides)
        source = LeadSource(**fields)
        db.session.add(source)
        db.session.commit()
        return source

    return _make


@pytest.fixture
def lead_source(make_lead_source):
    return make_lead_source(name="Facebook Ads")


@pytest.fixture
def make_lead(make_contact, lead_source):
    """make_lead(contact_fields={...}, status="Contactada", ...). Creates its own
    contact unless contact_id / contact is given."""

    def _make(contact=None, contact_fields=None, **overrides):
        if "contact_id" not in overrides:
            contact = contact or make_contact(**(contact_fields or {}))
            overrides["contact_id"] = contact.id
        overrides.setdefault("lead_source_id", lead_source.id)
        fields = {
            "status": "Nova",
            "created_at": datetime.now(timezone.utc),
            "message": None,
            "contact_id1": None,
        }
        fields.update(overrides)
        lead = Lead(**fields)
        db.session.add(lead)
        db.session.commit()
        return lead

    return _make


@pytest.fixture
def make_log():
    def _make(lead, **overrides):
        fields = {
            "lead_id": lead.id,
            "channel": "phone",
            "responsible": "Ana",
            "result": "No answer",
            "notes": None,
            "contacted_at": datetime.now(timezone.utc),
        }
        fields.update(overrides)
        log = ContactLog(**fields)
        db.session.add(log)
        db.session.commit()
        return log

    return _make


@pytest.fixture
def lead_payload(lead_source, make_contact):
    """Valid body for POST /leads (existing contact by default)."""

    def _make(**overrides):
        payload = {"lead_source_id": lead_source.id, "contact_id": make_contact().id}
        payload.update(overrides)
        return payload

    return _make


@pytest.fixture
def log_payload():
    def _make(**overrides):
        payload = {"channel": "phone", "responsible": "Ana", "result": "Call back tomorrow"}
        payload.update(overrides)
        return payload

    return _make

from flask import url_for

@pytest.fixture
def url(app):
    def _url(endpoint, **values):
        with app.test_request_context():
            return url_for(endpoint, **values)
    return _url

# =========================================================================== #
# Access control
# =========================================================================== #
class TestAccessControl:
    CASES = [
        ("GET", "leads.get_lead_sources", {}),
        ("POST", "leads.create_lead", {}),
        ("GET", "leads.list_leads", {}),
        ("GET", "leads.get_lead", {"lead_id": 1}),
        ("PATCH", "leads.update_lead", {"lead_id": 1}),
        ("POST", "leads.create_contact_log", {"lead_id": 1}),
    ]

    @staticmethod
    def _call(client, path, method):
        kwargs = {"json": {}} if method in ("POST", "PATCH") else {}
        return client.open(path, method=method, **kwargs)

    @pytest.mark.parametrize("method,endpoint,values", CASES)
    def test_anonymous_is_rejected(self, anon_client, url, method, endpoint, values):
        resp = self._call(anon_client, url(endpoint, **values), method)
        assert is_rejected(resp), f"{method} {endpoint} answered {resp.status_code} to an anonymous user"

    @pytest.mark.parametrize("method,endpoint,values", CASES)
    def test_non_owner_is_rejected(self, investor_client, url, method, endpoint, values):
        resp = self._call(investor_client, url(endpoint, **values), method)
        assert is_rejected(resp), f"{method} {endpoint} answered {resp.status_code} to a non-owner"

    @pytest.mark.parametrize("method,endpoint,values", CASES)
    def test_owner_gets_through(self, client, url, method, endpoint, values):
        resp = self._call(client, url(endpoint, **values), method)
        assert not is_rejected(resp)
        assert resp.status_code in (200, 201, 400, 404)


# =========================================================================== #
# CSRF
# =========================================================================== #
@pytest.mark.usefixtures("csrf_on")
class TestCsrf:
    def test_create_lead_without_token_is_rejected(self, client, url, lead_payload):
        resp = client.post(url("leads.create_lead"), json=lead_payload())
        assert resp.status_code == 400
        assert count(Lead) == 0

    def test_create_lead_with_token_succeeds(self, client, url, lead_payload, csrf_headers):
        resp = client.post(
            url("leads.create_lead"), json=lead_payload(), headers=csrf_headers(client)
        )
        assert resp.status_code == 201

    def test_update_lead_without_token_is_rejected(self, client, url, make_lead):
        lead = make_lead(message="original")
        resp = client.patch(url("leads.update_lead", lead_id=lead.id), json={"message": "hacked"})
        assert resp.status_code == 400
        db.session.refresh(lead)
        assert lead.message == "original"

    def test_contact_log_without_token_is_rejected(self, client, url, make_lead, log_payload):
        lead = make_lead()
        resp = client.post(url("leads.create_contact_log", lead_id=lead.id), json=log_payload())
        assert resp.status_code == 400
        assert count(ContactLog) == 0

    def test_get_needs_no_token(self, client, url):
        assert client.get(url("leads.list_leads")).status_code == 200


# =========================================================================== #
# Lead sources
# =========================================================================== #
class TestLeadSources:
    def test_returns_only_active_sources_sorted_by_name(self, client, url, make_lead_source):
        make_lead_source(name="Zillow")
        make_lead_source(name="Ads")
        make_lead_source(name="Retired", is_active=False)

        resp = client.get(url("leads.get_lead_sources"))

        assert resp.status_code == 200
        assert [s["name"] for s in resp.get_json()] == ["Ads", "Zillow"]

    def test_item_shape(self, client, url, make_lead_source):
        make_lead_source(name="Ads")
        item = client.get(url("leads.get_lead_sources")).get_json()[0]
        assert set(item) == {"id", "name", "is_active"}

    def test_empty(self, client, url):
        resp = client.get(url("leads.get_lead_sources"))
        assert resp.status_code == 200
        assert resp.get_json() == []


# =========================================================================== #
# Create lead
# =========================================================================== #
class TestCreateLead:
    def test_creates_lead_for_existing_contact(self, client, url, lead_payload, make_contact):
        contact = make_contact(name="Maria Silva")
        payload = lead_payload(
            contact_id=contact.id, message="Interested in a T2", campaign_name="Spring"
        )

        resp = client.post(url("leads.create_lead"), json=payload)

        assert resp.status_code == 201
        body = resp.get_json()
        assert body["status"] == "Nova"
        assert body["contact"]["id"] == contact.id
        assert body["contact"]["name"] == "Maria Silva"

        lead = db.session.get(Lead, body["id"])
        assert lead.contact_id == contact.id
        assert lead.contact_id1 is None
        assert lead.message == "Interested in a T2"
        assert lead.campaign_name == "Spring"
        assert lead.created_at is not None

    def test_creates_lead_with_a_new_contact(self, client, url, lead_payload, make_payload):
        payload = lead_payload(contact_id=None, new_contact=make_payload(name="Nova Pessoa"))
        contacts_before = count(Contact)

        resp = client.post(url("leads.create_lead"), json=payload)

        assert resp.status_code == 201
        body = resp.get_json()
        assert count(Contact) == contacts_before + 1
        assert body["contact"]["name"] == "Nova Pessoa"
        assert db.session.get(Lead, body["id"]).contact_id == body["contact"]["id"]

    def test_blank_message_is_stored_as_null(self, client, url, lead_payload):
        resp = client.post(url("leads.create_lead"), json=lead_payload(message="   "))
        assert resp.status_code == 201
        assert db.session.get(Lead, resp.get_json()["id"]).message is None

    def test_post_works_with_and_without_trailing_slash(self, client, url, lead_payload):
        base = url("leads.create_lead").rstrip("/")
        for path in (base, base + "/"):
            resp = client.post(path, json=lead_payload())
            assert resp.status_code == 201, path

    # --- contact selection ------------------------------------------------- #
    def test_contact_and_new_contact_together_are_rejected(
        self, client, url, lead_payload, make_payload
    ):
        resp = client.post(url("leads.create_lead"), json=lead_payload(new_contact=make_payload()))
        assert resp.status_code == 400
        assert "contact_id" in errors_of(resp)
        assert count(Lead) == 0

    def test_neither_contact_nor_new_contact_is_rejected(self, client, url, lead_source):
        resp = client.post(url("leads.create_lead"), json={"lead_source_id": lead_source.id})
        assert resp.status_code == 400
        assert "contact_id" in errors_of(resp)

    def test_unknown_contact_returns_404(self, client, url, lead_payload):
        resp = client.post(url("leads.create_lead"), json=lead_payload(contact_id=999999))
        assert resp.status_code == 404
        assert "contact_id" in errors_of(resp)
        assert count(Lead) == 0

    def test_invalid_new_contact_is_rejected(self, client, url, lead_payload):
        payload = lead_payload(contact_id=None, new_contact={"name": "No type given"})
        resp = client.post(url("leads.create_lead"), json=payload)
        assert resp.status_code == 400
        assert count(Lead) == 0

    @pytest.mark.xfail(reason=BUG_SOFT_DELETED, strict=False)
    def test_soft_deleted_contact_cannot_be_attached(self, client, url, lead_payload, make_contact):
        gone = make_contact(deleted_at=datetime.now(timezone.utc))
        resp = client.post(url("leads.create_lead"), json=lead_payload(contact_id=gone.id))
        assert resp.status_code in (400, 404)
        assert count(Lead) == 0

    # --- lead source ---------------------------------------------------------- #
    def test_missing_lead_source_is_rejected(self, client, url, make_contact):
        resp = client.post(url("leads.create_lead"), json={"contact_id": make_contact().id})
        assert resp.status_code == 400
        assert "lead_source_id" in errors_of(resp)

    def test_unknown_lead_source_is_rejected(self, client, url, lead_payload):
        resp = client.post(url("leads.create_lead"), json=lead_payload(lead_source_id=999999))
        assert resp.status_code == 400
        assert "lead_source_id" in errors_of(resp)
        assert count(Lead) == 0

    def test_inactive_lead_source_is_rejected(self, client, url, lead_payload, make_lead_source):
        inactive = make_lead_source(is_active=False)
        resp = client.post(url("leads.create_lead"), json=lead_payload(lead_source_id=inactive.id))
        assert resp.status_code == 400
        assert "lead_source_id" in errors_of(resp)

    # --- referrer ------------------------------------------------------------- #
    def test_referrer_is_stored(self, client, url, lead_payload, make_contact):
        referrer = make_contact(name="Referrer")
        resp = client.post(url("leads.create_lead"), json=lead_payload(referrer_contact_id=referrer.id))
        assert resp.status_code == 201
        assert db.session.get(Lead, resp.get_json()["id"]).contact_id1 == referrer.id

    def test_unknown_referrer_returns_404_and_rolls_back_the_new_contact(
        self, client, url, lead_payload, make_payload
    ):
        payload = lead_payload(
            contact_id=None, new_contact=make_payload(), referrer_contact_id=999999
        )
        contacts_before = count(Contact)

        resp = client.post(url("leads.create_lead"), json=payload)

        assert resp.status_code == 404
        assert "referrer_contact_id" in errors_of(resp)
        assert count(Contact) == contacts_before  # the new contact was not left behind
        assert count(Lead) == 0

    def test_contact_cannot_refer_themselves(self, client, url, lead_payload, make_contact):
        contact = make_contact()
        payload = lead_payload(contact_id=contact.id, referrer_contact_id=contact.id)
        resp = client.post(url("leads.create_lead"), json=payload)
        assert resp.status_code == 400
        assert "referrer_contact_id" in errors_of(resp)

    @pytest.mark.xfail(reason=BUG_SOFT_DELETED, strict=False)
    def test_soft_deleted_referrer_cannot_be_used(self, client, url, lead_payload, make_contact):
        gone = make_contact(deleted_at=datetime.now(timezone.utc))
        resp = client.post(url("leads.create_lead"), json=lead_payload(referrer_contact_id=gone.id))
        assert resp.status_code in (400, 404)

    # --- server-controlled / unknown fields --------------------------------- #
    @pytest.mark.parametrize(
        "field,value",
        [
            ("status", "Convertida"),
            ("created_at", "2020-01-01T00:00:00"),
            ("contact_id1", 1),
            ("id", 5),
            ("nonsense", "x"),
        ],
    )
    def test_server_controlled_and_unknown_fields_are_rejected(
        self, client, url, lead_payload, field, value
    ):
        resp = client.post(url("leads.create_lead"), json=lead_payload(**{field: value}))
        assert resp.status_code == 400
        assert field in errors_of(resp)
        assert count(Lead) == 0

    @pytest.mark.parametrize(
        "field,value",
        [
            ("lead_source_id", "abc"),
            ("campaign_name", "x" * 513),
            ("ad_name", "x" * 513),
            ("form_name", "x" * 513),
        ],
    )
    def test_invalid_values_are_rejected(self, client, url, lead_payload, field, value):
        resp = client.post(url("leads.create_lead"), json=lead_payload(**{field: value}))
        assert resp.status_code == 400
        assert field in errors_of(resp)

    @pytest.mark.parametrize(
        "kwargs",
        [
            {"json": {}},
            {"json": []},
            {"json": ["a", "list"]},
            {"data": "just text", "content_type": "text/plain"},
            {"data": "{broken json", "content_type": "application/json"},
        ],
        ids=["empty-object", "empty-array", "array", "plain-text", "malformed-json"],
    )
    def test_bad_bodies_return_400(self, client, url, kwargs):
        resp = client.post(url("leads.create_lead"), **kwargs)
        assert resp.status_code == 400
        assert count(Lead) == 0


# =========================================================================== #
# List leads
# =========================================================================== #
class TestListLeads:
    def _names(self, resp):
        return [lead["contact"]["name"] for lead in resp.get_json()["data"]]

    def test_empty(self, client, url):
        resp = client.get(url("leads.list_leads"))
        body = resp.get_json()
        assert resp.status_code == 200
        assert body["success"] is True
        assert body["data"] == []
        assert body["pagination"]["total"] == 0

    def test_item_shape_and_no_contact_pii(self, client, url, make_lead):
        make_lead()
        item = client.get(url("leads.list_leads")).get_json()["data"][0]

        assert {"id", "status", "message", "created_at", "lead_source_id", "contact", "contact_logs"} <= set(item)
        # the nested contact is a summary: never NIF, email or address
        assert {"id", "name"} <= set(item["contact"]) <= CONTACT_KEYS_ALLOWED
        assert "nif" not in item["contact"] and "email" not in item["contact"]

    def test_discarded_leads_are_hidden_by_default(self, client, url, make_lead):
        make_lead(contact_fields={"name": "Active"})
        make_lead(status="Descartada", contact_fields={"name": "Dropped"})

        assert self._names(client.get(url("leads.list_leads"))) == ["Active"]

        resp = client.get(url("leads.list_leads"), query_string={"show_discarted": "true"})
        assert sorted(self._names(resp)) == ["Active", "Dropped"]

    def test_filter_by_status(self, client, url, make_lead):
        make_lead(status="Nova", contact_fields={"name": "A"})
        make_lead(status="Contactada", contact_fields={"name": "B"})

        resp = client.get(url("leads.list_leads"), query_string={"status": "Contactada"})
        assert self._names(resp) == ["B"]

    def test_filter_by_lead_source(self, client, url, make_lead, make_lead_source):
        other = make_lead_source(name="Other")
        make_lead(contact_fields={"name": "Default source"})
        make_lead(lead_source_id=other.id, contact_fields={"name": "Other source"})

        resp = client.get(url("leads.list_leads"), query_string={"lead_source_id": other.id})
        assert self._names(resp) == ["Other source"]

    @pytest.mark.skipif(not ZONE_ID_AVAILABLE, reason="Contact has no zone_id column")
    def test_filter_by_unknown_zone_returns_empty(self, client, url, make_lead):
        make_lead()
        resp = client.get(url("leads.list_leads"), query_string={"zone_id": 999999})
        assert resp.status_code == 200
        assert resp.get_json()["data"] == []

    @pytest.mark.skipif(not ZONE_ID_AVAILABLE, reason="Contact has no zone_id column")
    @pytest.mark.xfail(reason=BUG_DOUBLE_JOIN, strict=False)
    def test_search_and_zone_filter_can_be_combined(self, client, url, make_lead):
        make_lead(contact_fields={"name": "Maria"})
        resp = client.get(url("leads.list_leads"), query_string={"search": "maria", "zone_id": 999999})
        assert resp.status_code == 200

    # --- search ----------------------------------------------------------------- #
    @pytest.fixture
    def searchable(self, make_lead):
        make_lead(
            contact_fields={
                "name": "Maria Silva",
                "email": "maria@acme.pt",
                "phone_number": "+351 912 345 678",
            }
        )
        make_lead(
            contact_fields={
                "name": "Joao Costa",
                "email": "joao@other.pt",
                "phone_number": "+351 965 000 111",
            }
        )

    @pytest.mark.usefixtures("searchable")
    @pytest.mark.parametrize(
        "term", ["maria", "MARIA", "silva", "acme.pt", "912 345"], ids=["name", "upper", "surname", "email", "phone"]
    )
    def test_search_matches_name_email_and_phone(self, client, url, term):
        resp = client.get(url("leads.list_leads"), query_string={"search": term})
        assert self._names(resp) == ["Maria Silva"]

    @pytest.mark.usefixtures("searchable")
    def test_search_without_match_is_empty(self, client, url):
        resp = client.get(url("leads.list_leads"), query_string={"search": "zzzzzz"})
        assert resp.status_code == 200
        assert resp.get_json()["data"] == []
        assert resp.get_json()["pagination"]["total"] == 0

    @pytest.mark.xfail(reason=BUG_LIKE_ESCAPE, strict=False)
    def test_search_treats_percent_literally(self, client, url, make_lead):
        make_lead(contact_fields={"name": "Plan 5% Off"})
        make_lead(contact_fields={"name": "Plan 55 Off"})
        resp = client.get(url("leads.list_leads"), query_string={"search": "5%"})
        assert self._names(resp) == ["Plan 5% Off"]

    @pytest.mark.xfail(reason=BUG_LIKE_ESCAPE, strict=False)
    def test_search_treats_underscore_literally(self, client, url, make_lead):
        make_lead(contact_fields={"name": "Zone a_b"})
        make_lead(contact_fields={"name": "Zone axb"})
        resp = client.get(url("leads.list_leads"), query_string={"search": "a_b"})
        assert self._names(resp) == ["Zone a_b"]

    # --- pagination -------------------------------------------------------------- #
    def test_pagination_metadata(self, client, url, make_lead):
        for _ in range(25):
            make_lead()

        resp = client.get(url("leads.list_leads"), query_string={"page": 3, "per_page": 10})

        body = resp.get_json()
        assert len(body["data"]) == 5
        assert body["pagination"] == {
            "page": 3, "per_page": 10, "total": 25, "pages": 3,
            "has_next": False, "has_prev": True,
        }

    def test_pages_have_no_duplicates_or_gaps(self, client, url, make_lead):
        leads = [make_lead() for _ in range(15)]
        seen = []
        for page in range(1, 5):
            resp = client.get(url("leads.list_leads"), query_string={"page": page, "per_page": 4})
            seen += [lead["id"] for lead in resp.get_json()["data"]]

        assert len(seen) == 15 and sorted(seen) == sorted(lead.id for lead in leads)

    def test_page_beyond_the_end_is_empty_not_an_error(self, client, url, make_lead):
        make_lead()
        resp = client.get(url("leads.list_leads"), query_string={"page": 99})
        assert resp.status_code == 200
        assert resp.get_json()["data"] == []

    # --- parameters --------------------------------------------------------------- #
    @pytest.mark.parametrize(
        "params",
        [
            {"page": 0},
            {"per_page": 101},
            {"per_page": 0},
            {"status": "Bogus"},
            {"lead_source_id": 0},
            {"show_discarted": "maybe"},
        ],
    )
    def test_invalid_query_params(self, client, url, params):
        resp = client.get(url("leads.list_leads"), query_string=params)
        assert resp.status_code == 400
        assert errors_of(resp)

    def test_unknown_and_blank_params_are_ignored(self, client, url, make_lead):
        make_lead()
        resp = client.get(
            url("leads.list_leads"), query_string={"_": "169999", "search": "", "status": "  "}
        )
        assert resp.status_code == 200
        assert len(resp.get_json()["data"]) == 1


# =========================================================================== #
# Get lead
# =========================================================================== #
BUG_GET_LEAD = (
    "get_lead uses joinedload on the contact_logs COLLECTION with scalar_one_or_none(); "
    "SQLAlchemy 2.0 needs .unique() (or selectinload) there"
)


class TestGetLead:
    def test_returns_lead_with_contact_and_logs(self, client, url, make_lead, make_log):
        lead = make_lead(contact_fields={"name": "Maria Silva"}, message="hello")
        make_log(lead, channel="phone")
        make_log(lead, channel="email")

        resp = client.get(url("leads.get_lead", lead_id=lead.id))

        assert resp.status_code == 200, BUG_GET_LEAD
        body = resp.get_json()
        assert body["id"] == lead.id
        assert body["status"] == "Nova"
        assert body["message"] == "hello"
        assert body["contact"]["name"] == "Maria Silva"
        assert sorted(log["channel"] for log in body["contact_logs"]) == ["email", "phone"]

    def test_lead_without_logs_has_empty_list(self, client, url, make_lead):
        lead = make_lead()
        body = client.get(url("leads.get_lead", lead_id=lead.id)).get_json()
        assert body["contact_logs"] == []

    def test_contact_is_a_summary_without_pii(self, client, url, make_lead):
        lead = make_lead()
        body = client.get(url("leads.get_lead", lead_id=lead.id)).get_json()
        assert set(body["contact"]) <= CONTACT_KEYS_ALLOWED
        assert "nif" not in body["contact"] and "email" not in body["contact"]

    def test_logs_only_include_this_leads_entries(self, client, url, make_lead, make_log):
        mine, other = make_lead(), make_lead()
        make_log(mine, result="mine")
        make_log(other, result="other")

        body = client.get(url("leads.get_lead", lead_id=mine.id)).get_json()
        assert [log["result"] for log in body["contact_logs"]] == ["mine"]

    @pytest.mark.xfail(reason=BUG_LOG_ORDER, strict=False)
    def test_logs_are_newest_first(self, client, url, make_lead, make_log):
        lead = make_lead()
        now = datetime.now(timezone.utc)
        make_log(lead, channel="old", contacted_at=now - timedelta(days=2))
        make_log(lead, channel="new", contacted_at=now)

        body = client.get(url("leads.get_lead", lead_id=lead.id)).get_json()
        assert [log["channel"] for log in body["contact_logs"]] == ["new", "old"]

    @pytest.mark.xfail(reason=BUG_REFERRER_KEY, strict=False)
    def test_referrer_is_included(self, client, url, make_lead, make_contact):
        referrer = make_contact(name="Referrer")
        lead = make_lead(contact_id1=referrer.id)

        body = client.get(url("leads.get_lead", lead_id=lead.id)).get_json()
        assert body["referrer"]["id"] == referrer.id

    def test_missing_lead_returns_404(self, client, url):
        resp = client.get(url("leads.get_lead", lead_id=999999))
        assert resp.status_code == 404
        assert errors_of(resp)


# =========================================================================== #
# Update lead
# =========================================================================== #
class TestUpdateLead:
    def _patch(self, client, url, lead_id, **kwargs):
        return client.patch(url("leads.update_lead", lead_id=lead_id), **kwargs)

    def test_updates_only_the_given_fields(self, client, url, make_lead):
        lead = make_lead(message="old", status="Nova")

        resp = self._patch(client, url, lead.id, json={"message": "new"})

        assert resp.status_code == 200
        assert resp.get_json()["message"] == "new"
        db.session.refresh(lead)
        assert lead.message == "new"
        assert lead.status == "Nova"  # untouched

    def test_can_change_status(self, client, url, make_lead):
        lead = make_lead()
        resp = self._patch(client, url, lead.id, json={"status": "Contactada"})
        assert resp.status_code == 200
        assert resp.get_json()["status"] == "Contactada"

    def test_can_clear_message_with_null(self, client, url, make_lead):
        lead = make_lead(message="something")
        resp = self._patch(client, url, lead.id, json={"message": None})
        assert resp.status_code == 200
        db.session.refresh(lead)
        assert lead.message is None

    def test_can_change_lead_source_to_an_active_one(self, client, url, make_lead, make_lead_source):
        lead = make_lead()
        new_source = make_lead_source(name="Referral")
        resp = self._patch(client, url, lead.id, json={"lead_source_id": new_source.id})
        assert resp.status_code == 200
        db.session.refresh(lead)
        assert lead.lead_source_id == new_source.id

    def test_invalid_status_is_rejected(self, client, url, make_lead):
        lead = make_lead()
        resp = self._patch(client, url, lead.id, json={"status": "Whatever"})
        assert resp.status_code == 400
        assert "status" in errors_of(resp)

    def test_discarding_requires_a_reason(self, client, url, make_lead):
        lead = make_lead()
        resp = self._patch(client, url, lead.id, json={"status": "Descartada"})
        assert resp.status_code == 400
        assert "discard_reason" in errors_of(resp)
        db.session.refresh(lead)
        assert lead.status == "Nova"

    def test_discarding_with_a_reason_works(self, client, url, make_lead):
        lead = make_lead()
        resp = self._patch(
            client, url, lead.id,
            json={"status": "Descartada", "discard_reason": "Not interested"},
        )
        assert resp.status_code == 200
        db.session.refresh(lead)
        assert lead.status == "Descartada"
        assert lead.discard_reason == "Not interested"

    @pytest.mark.parametrize(
        "field,value",
        [("contact_id", 1), ("id", 99), ("created_at", "2020-01-01T00:00:00"), ("contact", {})],
    )
    def test_immutable_and_unknown_fields_are_rejected(self, client, url, make_lead, field, value):
        lead = make_lead(message="keep")
        resp = self._patch(client, url, lead.id, json={field: value})
        assert resp.status_code == 400
        assert field in errors_of(resp)
        db.session.refresh(lead)
        assert lead.message == "keep"

    @pytest.mark.parametrize(
        "kwargs",
        [
            {"json": {}},
            {"data": "plain", "content_type": "text/plain"},
            {"data": "{broken", "content_type": "application/json"},
        ],
        ids=["empty-object", "plain-text", "malformed-json"],
    )
    def test_empty_or_bad_body_is_rejected(self, client, url, make_lead, kwargs):
        lead = make_lead()
        assert self._patch(client, url, lead.id, **kwargs).status_code == 400

    def test_missing_lead_returns_404(self, client, url):
        resp = self._patch(client, url, 999999, json={"message": "x"})
        assert resp.status_code == 404

    # --- references that are not validated yet --------------------------------- #
    @pytest.mark.xfail(reason=BUG_UPDATE_REFS, strict=False)
    def test_unknown_lead_source_is_rejected(self, client, url, make_lead):
        lead = make_lead()
        resp = self._patch(client, url, lead.id, json={"lead_source_id": 999999})
        assert resp.status_code == 400
        assert "lead_source_id" in errors_of(resp)

    @pytest.mark.xfail(reason=BUG_UPDATE_REFS, strict=False)
    def test_inactive_lead_source_is_rejected(self, client, url, make_lead, make_lead_source):
        lead = make_lead()
        inactive = make_lead_source(is_active=False)
        resp = self._patch(client, url, lead.id, json={"lead_source_id": inactive.id})
        assert resp.status_code == 400

    @pytest.mark.xfail(reason=BUG_UPDATE_REFS, strict=False)
    def test_unknown_referrer_is_rejected(self, client, url, make_lead):
        lead = make_lead()
        resp = self._patch(client, url, lead.id, json={"contact_id1": 999999})
        assert resp.status_code in (400, 404)

    @pytest.mark.xfail(reason=BUG_UPDATE_REFS, strict=False)
    def test_contact_cannot_be_their_own_referrer(self, client, url, make_lead):
        lead = make_lead()
        resp = self._patch(client, url, lead.id, json={"contact_id1": lead.contact_id})
        assert resp.status_code == 400


# =========================================================================== #
# Contact logs
# =========================================================================== #
class TestCreateContactLog:
    def _post(self, client, url, lead_id, **kwargs):
        return client.post(url("leads.create_contact_log", lead_id=lead_id), **kwargs)

    def test_creates_log(self, client, url, make_lead, log_payload):
        lead = make_lead()
        payload = log_payload(channel="whatsapp", responsible="Ana", result="Interested", notes="Wants a visit")

        resp = self._post(client, url, lead.id, json=payload)

        assert resp.status_code == 201
        body = resp.get_json()
        assert {"id", "lead_id", "channel", "responsible", "result", "notes", "contacted_at"} <= set(body)
        assert body["lead_id"] == lead.id
        assert body["channel"] == "whatsapp"

        log = db.session.get(ContactLog, body["id"])
        assert log.lead_id == lead.id
        assert (log.responsible, log.result, log.notes) == ("Ana", "Interested", "Wants a visit")

    def test_contacted_at_defaults_to_now(self, client, url, make_lead, log_payload):
        lead = make_lead()
        resp = self._post(client, url, lead.id, json=log_payload())
        log = db.session.get(ContactLog, resp.get_json()["id"])
        assert abs(datetime.now(timezone.utc) - aware(log.contacted_at)) < timedelta(minutes=1)

    def test_explicit_past_contacted_at_is_kept(self, client, url, make_lead, log_payload):
        lead = make_lead()
        resp = self._post(
            client, url, lead.id, json=log_payload(contacted_at="2026-01-15T10:30:00")
        )
        assert resp.status_code == 201
        log = db.session.get(ContactLog, resp.get_json()["id"])
        assert aware(log.contacted_at) == datetime(2026, 1, 15, 10, 30, tzinfo=timezone.utc)

    def test_future_contacted_at_is_rejected(self, client, url, make_lead, log_payload):
        lead = make_lead()
        future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        resp = self._post(client, url, lead.id, json=log_payload(contacted_at=future))
        assert resp.status_code == 400
        assert "contacted_at" in errors_of(resp)
        assert count(ContactLog) == 0

    def test_blank_notes_become_null(self, client, url, make_lead, log_payload):
        lead = make_lead()
        resp = self._post(client, url, lead.id, json=log_payload(notes="   "))
        assert resp.status_code == 201
        assert db.session.get(ContactLog, resp.get_json()["id"]).notes is None

    @pytest.mark.parametrize("field", ["channel", "responsible", "result"])
    def test_required_fields(self, client, url, make_lead, log_payload, field):
        lead = make_lead()
        payload = log_payload()
        payload.pop(field)
        resp = self._post(client, url, lead.id, json=payload)
        assert resp.status_code == 400
        assert field in errors_of(resp)
        assert count(ContactLog) == 0

    @pytest.mark.parametrize("field", ["channel", "responsible", "result"])
    @pytest.mark.parametrize("value", ["", "   ", "x" * 513], ids=["empty", "blank", "too-long"])
    def test_invalid_text_values(self, client, url, make_lead, log_payload, field, value):
        lead = make_lead()
        resp = self._post(client, url, lead.id, json=log_payload(**{field: value}))
        assert resp.status_code == 400
        assert field in errors_of(resp)

    @pytest.mark.parametrize("field", ["lead_id", "created_at", "id", "nonsense"])
    def test_unknown_fields_are_rejected(self, client, url, make_lead, log_payload, field):
        """The lead comes from the URL; the client can't choose it or the id."""
        lead = make_lead()
        resp = self._post(client, url, lead.id, json=log_payload(**{field: 1}))
        assert resp.status_code == 400
        assert field in errors_of(resp)
        assert count(ContactLog) == 0

    @pytest.mark.parametrize(
        "kwargs",
        [
            {"json": ["a", "list"]},
            {"json": None},
            {"data": "plain", "content_type": "text/plain"},
            {"data": "{broken", "content_type": "application/json"},
        ],
        ids=["array", "null", "plain-text", "malformed-json"],
    )
    def test_bad_bodies_return_400(self, client, url, make_lead, kwargs):
        lead = make_lead()
        assert self._post(client, url, lead.id, **kwargs).status_code == 400

    def test_missing_lead_returns_404(self, client, url, log_payload):
        resp = self._post(client, url, 999999, json=log_payload())
        assert resp.status_code == 404
        assert count(ContactLog) == 0

    def test_log_is_attached_to_the_lead_in_the_url(self, client, url, make_lead, log_payload):
        first, second = make_lead(), make_lead()
        self._post(client, url, second.id, json=log_payload())
        logs = db.session.scalars(db.select(ContactLog)).all()
        assert [log.lead_id for log in logs] == [second.id]
        assert first.id != second.id