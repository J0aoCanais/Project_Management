"""Tests for /api/properties (list, get, links, zones, add, search, edit, delete).

Mirrors the contacts test layout. Where properties.md documents a "known issue"
the test asserts CURRENT behaviour and is marked  # KNOWN-ISSUE  so it's easy to
flip when the underlying bug is fixed.
"""
import pytest
from http import HTTPStatus
from decimal import Decimal

from app.extensions import db
from app.models import Property, Opportunity

BASE = "/api/properties"
BLOCKED = (301, 302, 401, 403)

from sqlalchemy import text

@pytest.fixture(autouse=True)
def load_data(app):
    with app.app_context():
        with open("database/seeds/contacts.sql") as file:
            query = text(file.read())
            db.session.execute(query)
        db.session.commit()

        with open("database/seeds/lead_sources.sql") as file:
            query = text(file.read())
            db.session.execute(query)
        db.session.commit()

        with open("database/seeds/leads.sql") as file:
            query = text(file.read())
            db.session.execute(query)
        db.session.commit()

# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def _valid_body(**overrides):
    body = {
        "zone_id": 1,
        "property_type": "Residential",
        "sale_motive": "Investment",
        "contact_owns": False,
        "lead_id": 900,
        "address": "Rua Augusta, 100, Lisboa",
        "typology": "T2",
        "area_m2": "85.50",
        "asking_price": "350000.00",
        "vvr": "400000.00",
        "profit": "50000.00",
        "max_proposal": "320000.00",
        "first_proposal": "300000.00",
        "visit_date": "2026-11-10",
        "source_url": "https://www.example.com/property/123",
    }
    body.update(overrides)
    return body


def make(client, **overrides):
    res = client.post(f"{BASE}/add", json=_valid_body(**overrides))
    assert res.status_code == HTTPStatus.CREATED, f"setup add failed: {res.get_json()}"
    return res.get_json()


def search(client, **params):
    return client.get(f"{BASE}/search", query_string=params)


def list_(client, **params):
    return client.get(f"{BASE}/", query_string=params)


# --------------------------------------------------------------------------- #
# Auth
# --------------------------------------------------------------------------- #

@pytest.mark.parametrize("method,path", [
    ("get",    f"{BASE}/"),
    ("get",    f"{BASE}/1"),
    ("get",    f"{BASE}/1/links"),
    ("get",    f"{BASE}/zones"),
    ("get",    f"{BASE}/search?q=test"),
    ("post",   f"{BASE}/add"),
    ("patch",  f"{BASE}/1"),
    ("delete", f"{BASE}/1"),
])
def test_anonymous_is_blocked(anon_client, method, path):
    res = getattr(anon_client, method)(path)
    assert res.status_code in BLOCKED


def test_non_owner_is_blocked(investor_client):
    assert investor_client.get(f"{BASE}/").status_code in BLOCKED


# --------------------------------------------------------------------------- #
# Create & validation
# --------------------------------------------------------------------------- #

def test_add_returns_201_and_full_body(client):
    res = client.post(f"{BASE}/add", json=_valid_body())
    assert res.status_code == HTTPStatus.CREATED
    data = res.json
    assert data["id"]
    assert data["code"] == f"IMO-{data['id']}"
    # money/area are strings with 2 places, never floats
    for k in ("area_m2", "asking_price", "vvr", "profit", "max_proposal", "first_proposal"):
        assert isinstance(data[k], str) and data[k].count(".") == 1
        assert len(data[k].split(".")[1]) == 2
    assert data["address"] == "Rua Augusta, 100, Lisboa"
    assert data["zone"] == {"id": 1, "name": "Alta"}
    assert data["sale_motive"] == "Investment"
    assert data["contact_owns"] is False
    assert data["lead_id"] == 900
    assert data["contact_id"] == 700


def test_add_rejects_same_lead_id(client):
    res = client.post(f"{BASE}/add", json=_valid_body())
    res_repeat = client.post(f"{BASE}/add", json=_valid_body())

    assert res.status_code == HTTPStatus.CREATED
    assert res_repeat.status_code == HTTPStatus.CONFLICT

@pytest.mark.parametrize("missing", [
    "zone_id", "property_type", "sale_motive", "contact_owns", "lead_id",
])
def test_add_requires_required_fields(client, missing):
    body = _valid_body()
    del body[missing]
    res = client.post(f"{BASE}/add", json=body)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert missing in res.json["errors"]


def test_add_rejects_code_as_unknown_field(client):
    res = client.post(f"{BASE}/add", json=_valid_body(code="IMO-99"))
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "code" in res.json["errors"]


def test_add_rejects_unknown_field(client):
    res = client.post(f"{BASE}/add", json=_valid_body(bogus=1))
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "bogus" in res.json["errors"]


def test_add_rejects_non_json_body(client):
    res = client.post(f"{BASE}/add", data="hello", content_type="text/plain")
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in res.json["errors"]


@pytest.mark.parametrize("field,value", [
    ("area_m2",     "0"),
    ("area_m2",     "-1"),
    ("area_m2",     "1000001"),
    ("asking_price", "0"),
    ("asking_price", "1000000001"),
    ("vvr",          "-5"),
    ("profit",       "-1000000001"),
    ("profit",       "1000000001"),
    ("first_proposal", "0"),
    ("max_proposal", "0"),
])
def test_add_rejects_out_of_range_decimals(client, field, value):
    res = client.post(f"{BASE}/add", json=_valid_body(**{field: value}))
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert field in res.json["errors"]


def test_add_accepts_negative_profit(client):
    res = client.post(f"{BASE}/add", json=_valid_body(profit="-1000.00"))
    assert res.status_code == HTTPStatus.CREATED
    assert res.json["profit"] == "-1000.00"


def test_add_rejects_first_proposal_above_max(client):
    res = client.post(f"{BASE}/add",
                      json=_valid_body(first_proposal="321000.00", max_proposal="320000.00"))
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "first_proposal" in res.json["errors"]


def test_add_accepts_equal_proposals(client):
    res = client.post(f"{BASE}/add",
                      json=_valid_body(first_proposal="320000.00", max_proposal="320000.00"))
    assert res.status_code == HTTPStatus.CREATED


def test_add_rounds_extra_decimal_places(client):
    res = client.post(f"{BASE}/add", json=_valid_body(asking_price="350000.129"))
    assert res.status_code == HTTPStatus.CREATED
    assert res.json["asking_price"] == "350000.13"


def test_add_rejects_construction_year_as_string(client):
    res = client.post(f"{BASE}/add", json=_valid_body(construction_year="1990"))
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "construction_year" in res.json["errors"]


def test_add_rejects_construction_year_before_1800(client):
    res = client.post(f"{BASE}/add", json=_valid_body(construction_year=1799))
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "construction_year" in res.json["errors"]


def test_add_rejects_non_http_source_url(client):
    res = client.post(f"{BASE}/add",
                      json=_valid_body(source_url="javascript:alert(1)"))
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "source_url" in res.json["errors"]


def test_add_blank_optional_string_becomes_null(client):
    res = client.post(f"{BASE}/add", json=_valid_body(notes="", admin_location=""))
    assert res.status_code == HTTPStatus.CREATED
    assert res.json["notes"] is None
    assert res.json["admin_location"] is None


def test_create_without_source_url(client):
    body = _valid_body()
    del body["source_url"]
    res = client.post(f"{BASE}/add", json=body)
    assert res.status_code == HTTPStatus.CREATED

def test_create_only_required(client):
    body = {
            "zone_id": 1,
            "property_type": "Residential",
            "sale_motive": "Investment",
            "contact_owns": False,
            "lead_id": 900,
    }

    res = client.post(f"{BASE}/add", json=body)
    assert res.status_code == HTTPStatus.CREATED


# --------------------------------------------------------------------------- #
# List & get
# --------------------------------------------------------------------------- #

def test_list_sorted_by_id_asc(client):
    a = make(client, address="Zzz")
    b = make(client, address="Aaa")
    res = list_(client)
    ids = [p["id"] for p in res.json["data"]]
    assert ids == sorted(ids)
    assert a["id"] in ids and b["id"] in ids


def test_list_pagination(client):
    for _ in range(3):
        make(client)
    res = list_(client, per_page=2)
    assert res.status_code == HTTPStatus.OK
    assert len(res.json["data"]) == 2
    assert res.json["pagination"]["total"] == 3
    assert res.json["pagination"]["has_next"] is True
    assert res.json["pagination"]["pages"] == 2


@pytest.mark.parametrize("params", [
    {"page": 0}, {"page": "abc"}, {"per_page": 0}, {"per_page": 101}, {"per_page": "x"},
])
def test_list_rejects_bad_pagination(client, params):
    res = list_(client, **params)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in res.json


def test_list_excludes_soft_deleted(client):
    a = make(client, address="Zzyzx Keep")
    b = make(client, address="Zzyzx Gone")
    client.delete(f"{BASE}/{b['id']}")
    res = list_(client)
    names = [p["address"] for p in res.json["data"]]
    assert "Zzyzx Keep" in names
    assert "Zzyzx Gone" not in names


def test_get_by_id(client):
    p = make(client)
    res = client.get(f"{BASE}/{p['id']}")
    assert res.status_code == HTTPStatus.OK
    assert res.json["id"] == p["id"]


def test_get_missing_is_404(client):
    res = client.get(f"{BASE}/99999")
    assert res.status_code == HTTPStatus.NOT_FOUND
    assert "id" in res.json["errors"]


def test_get_soft_deleted_currently_returns_200(client):
    p = make(client)
    client.delete(f"{BASE}/{p['id']}")
    res = client.get(f"{BASE}/{p['id']}")
    assert res.status_code == HTTPStatus.NOT_FOUND


# --------------------------------------------------------------------------- #
# Links
# --------------------------------------------------------------------------- #

def test_links_missing_property_is_404(client):
    res = client.get(f"{BASE}/99999/links")
    assert res.status_code == HTTPStatus.NOT_FOUND
    assert "id" in res.json["errors"]


def test_links_without_opportunity_shape(client):
    p = make(client)
    res = client.get(f"{BASE}/{p['id']}/links")
    assert res.status_code == HTTPStatus.OK
    assert len(res.json["data"]) == 1
    assert res.json["data"]["lead"]


def test_links_with_opportunity(app, client):
    p = make(client)
    with app.app_context():
        opp = Opportunity(phase_id=1, property_id=p["id"], contact_id=700)
        db.session.add(opp)
        db.session.commit()
        opp_id = opp.id
    res = client.get(f"{BASE}/{p['id']}/links")
    entry = res.json["data"]["opportunity"]
    assert entry["id"] == opp_id
    assert entry["code"] == f"OPO-{opp_id}"
    assert entry["phase"] == "novo"


def test_links_soft_deleted_currently_200(client):
    p = make(client)
    client.delete(f"{BASE}/{p['id']}")
    res = client.get(f"{BASE}/{p['id']}/links")
    assert res.status_code == HTTPStatus.NOT_FOUND


# --------------------------------------------------------------------------- #
# Zones
# --------------------------------------------------------------------------- #

def test_zones_sorted_and_distinct(client):
    make(client, zone_id=2)
    make(client, zone_id=2)  # duplicate
    make(client, zone_id=1)
    res = client.get(f"{BASE}/zones")
    assert res.status_code == HTTPStatus.OK
    assert res.json == ["Alta", "Baixa"]


def test_zones_excludes_soft_deleted(client):
    make(client, zone_id=1)
    p = make(client, zone_id=2)
    client.delete(f"{BASE}/{p['id']}")
    res = client.get(f"{BASE}/zones")
    assert "Alta" in res.json
    assert "Baixa" not in res.json


# --------------------------------------------------------------------------- #
# Search
# --------------------------------------------------------------------------- #

def test_search_no_params_returns_everything(client):
    make(client)
    res = search(client)
    assert res.status_code == HTTPStatus.OK
    assert res.json["pagination"]["total"] >= 1


def test_search_q_matches_zone_and_address(client):
    make(client, address="Zzyzx St", typology="Zzyzx T9")
    make(client, zone_id=2, address="Another Street")
    for q in ("baixa", "BAIXA", "zzyzx st"):
        res = search(client, q=q)
        assert res.status_code == HTTPStatus.OK
        assert res.json["pagination"]["total"] >= 1, q


def test_search_no_match_empty_200(client):
    res = search(client, q="zzzznomatch")
    assert res.status_code == HTTPStatus.OK
    assert res.json["data"] == []
    assert res.json["pagination"]["total"] == 0


def test_search_percent_literal(client):
    make(client, address="Qqq 50%off St")
    make(client, address="Qqq 50Xoff St")
    res = search(client, q="50%o")
    names = [p["address"] for p in res.json["data"]]
    assert "Qqq 50%off St" in names
    assert "Qqq 50Xoff St" not in names


def test_search_underscore_literal(client):
    make(client, address="Qqq a_b St")
    make(client, address="Qqq axb St")
    res = search(client, q="a_b")
    names = [p["address"] for p in res.json["data"]]
    assert "Qqq a_b St" in names
    assert "Qqq axb St" not in names


@pytest.mark.parametrize("q", ["%%", "__"])
def test_search_wildcards_alone_do_not_match_everything(client, q):
    make(client)
    res = search(client, q=q)
    assert res.status_code == HTTPStatus.OK
    assert res.json["data"] == []


def test_search_ignores_empty_q(client):
    make(client)
    res = search(client, q="")
    assert res.status_code == HTTPStatus.OK
    assert res.json["pagination"]["total"] >= 1


@pytest.mark.parametrize("params", [{"q": "a"}, {"q": " a "}])
def test_search_rejects_short_q(client, params):
    res = search(client, **params)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in res.json

def test_search_zone_id_exact(client):
    make(client, zone_id=2)
    res = search(client, zone_id=2)
    assert res.status_code == HTTPStatus.OK
    assert all(p["zone"]["id"] == 2 for p in res.json["data"])


def test_search_typology_exact_case_insensitive(client):
    make(client, typology="Zzyzx T2")
    res = search(client, typology="zzyzx t2")
    assert res.status_code == HTTPStatus.OK
    assert len(res.json["data"]) >= 1


def test_search_filters_combine_with_and(client):
    make(client, zone_id=1, address="Zzyzx Addr", property_type="House")
    make(client, zone_id=1, address="Zzyzx Addr", property_type="Apartment")
    res = search(client, q="zzyzx", zone_id=1, property_type="House")
    assert res.status_code == HTTPStatus.OK
    assert res.json["pagination"]["total"] == 1


def test_search_excludes_soft_deleted(client):
    p = make(client, address="Zzyzx Gone")
    client.delete(f"{BASE}/{p['id']}")
    res = search(client, q="zzyzx")
    assert res.json["data"] == [] or all(x["id"] != p["id"] for x in res.json["data"])


@pytest.mark.parametrize("extra", [
    {"page": 0}, {"per_page": 0}, {"per_page": 101}, {"per_page": "x"},
])
def test_search_rejects_bad_pagination(client, extra):
    res = search(client, **extra)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in res.json


def test_search_ignores_unknown_parameters(client):
    make(client)
    res = search(client, sort="bogus", order="up")
    assert res.status_code == HTTPStatus.OK


# --------------------------------------------------------------------------- #
# Edit (PATCH)
# --------------------------------------------------------------------------- #

def test_patch_updates_only_given_fields(client):
    p = make(client, notes="original")
    res = client.patch(f"{BASE}/{p['id']}", json={"notes": "changed"})
    assert res.status_code == HTTPStatus.OK
    assert res.json["notes"] == "changed"
    assert res.json["address"] == p["address"]


def test_patch_empty_body_is_400(client):
    p = make(client)
    res = client.patch(f"{BASE}/{p['id']}", json={})
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "_schema" in res.json["errors"]


def test_patch_missing_is_404(client):
    res = client.patch(f"{BASE}/99999", json={"notes": "x"})
    assert res.status_code == HTTPStatus.NOT_FOUND
    assert "id" in res.json["errors"]


def test_patch_non_json_body_is_400(client):
    p = make(client)
    res = client.patch(f"{BASE}/{p['id']}", data="hi", content_type="text/plain")
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in res.json["errors"]


def test_patch_first_proposal_alone_checked_against_stored_max(client):
    p = make(client, first_proposal="300000.00", max_proposal="320000.00")
    res = client.patch(f"{BASE}/{p['id']}", json={"first_proposal": "330000.00"})
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "first_proposal" in res.json["errors"]


def test_patch_max_proposal_alone_checked_against_stored_first(client):
    p = make(client, first_proposal="300000.00", max_proposal="320000.00")
    res = client.patch(f"{BASE}/{p['id']}", json={"max_proposal": "290000.00"})
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "first_proposal" in res.json["errors"]


def test_patch_both_proposals_together_valid(client):
    p = make(client)
    res = client.patch(f"{BASE}/{p['id']}",
                       json={"first_proposal": "100.00", "max_proposal": "200.00"})
    assert res.status_code == HTTPStatus.OK
    assert res.json["first_proposal"] == "100.00"
    assert res.json["max_proposal"] == "200.00"


def test_patch_rejects_invalid_decimal(client):
    p = make(client)
    res = client.patch(f"{BASE}/{p['id']}", json={"asking_price": "-5"})
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "asking_price" in res.json["errors"]


def test_patch_rejects_unknown_field(client):
    p = make(client)
    res = client.patch(f"{BASE}/{p['id']}", json={"bogus": 1})
    assert res.status_code == HTTPStatus.BAD_REQUEST


def test_patch_soft_deleted_is_404(client):
    p = make(client)
    client.delete(f"{BASE}/{p['id']}")
    res = client.patch(f"{BASE}/{p['id']}", json={"notes": "x"})
    assert res.status_code == HTTPStatus.NOT_FOUND


# --------------------------------------------------------------------------- #
# Delete (soft)
# --------------------------------------------------------------------------- #

def test_delete_returns_204_empty(client):
    p = make(client)
    res = client.delete(f"{BASE}/{p['id']}")
    assert res.status_code == HTTPStatus.NO_CONTENT
    assert res.data == b""


def test_delete_missing_is_404(client):
    res = client.delete(f"{BASE}/99999")
    assert res.status_code == HTTPStatus.NOT_FOUND
    assert "id" in res.json["errors"]


def test_delete_is_soft_row_kept(app, client):
    p = make(client)
    client.delete(f"{BASE}/{p['id']}")
    with app.app_context():
        row = db.session.get(Property, p["id"])
        assert row is not None
        assert row.deleted_at is not None


def test_delete_twice_second_is_404(client):
    p = make(client)
    assert client.delete(f"{BASE}/{p['id']}").status_code == HTTPStatus.NO_CONTENT
    assert client.delete(f"{BASE}/{p['id']}").status_code == HTTPStatus.NOT_FOUND


def test_delete_only_affects_target(client):
    a = make(client, address="Zzyzx A")
    b = make(client, address="Zzyzx B")
    client.delete(f"{BASE}/{a['id']}")
    res = list_(client)
    addrs = [p["address"] for p in res.json["data"]]
    assert "Zzyzx B" in addrs
    assert "Zzyzx A" not in addrs