# tests/test_zones.py
import pytest
from http import HTTPStatus

from app.extensions import db
from app.models import Zone, Contact

ZONES_URL = f"/api/zones/"


def zone_url(zone_id):
    return f"{ZONES_URL}{zone_id}"


def make_zone(name):
    """Insert a zone directly in the DB and return its id."""
    zone = Zone(name=name)
    db.session.add(zone)
    db.session.commit()
    return zone.id


def zone_names():
    db.session.expire_all()  # the request used its own session; avoid stale reads
    return [z.name for z in db.session.execute(db.select(Zone).order_by(Zone.name)).scalars()]


# --------------------------------------------------------------------------- #
# Authorization
# --------------------------------------------------------------------------- #

# Adjust the expected codes to whatever owner_required / login manager returns.
ANON_CODES = {HTTPStatus.UNAUTHORIZED, HTTPStatus.FOUND}
FORBIDDEN_CODES = {HTTPStatus.FORBIDDEN, HTTPStatus.UNAUTHORIZED}

ENDPOINTS = [
    ("get", ZONES_URL, None),
    ("post", ZONES_URL, {"name": "Norte"}),
    ("patch", zone_url(1), {"name": "Norte"}),
    ("delete", zone_url(1), None),
]


@pytest.mark.parametrize("method,url,body", ENDPOINTS)
def test_anonymous_is_rejected(anon_client, method, url, body):
    res = getattr(anon_client, method)(url, json=body)
    assert res.status_code in ANON_CODES


@pytest.mark.parametrize("method,url,body", ENDPOINTS)
def test_non_owner_is_rejected(investor_client, method, url, body):
    res = getattr(investor_client, method)(url, json=body)
    assert res.status_code in FORBIDDEN_CODES


def test_non_owner_cannot_modify_data(app, investor_client):
    zone_id = make_zone("Norte")

    investor_client.patch(zone_url(zone_id), json={"name": "Hacked"})
    investor_client.delete(zone_url(zone_id))

    assert zone_names() == ["Norte"]


# --------------------------------------------------------------------------- #
# GET /zones
# --------------------------------------------------------------------------- #

def test_get_zones_empty(client):
    res = client.get(ZONES_URL)
    assert res.status_code == HTTPStatus.OK
    assert res.get_json() == []


def test_get_zones_returns_all_sorted_by_name(app, client):
    for name in ("Sul", "Centro", "Norte"):
        make_zone(name)

    res = client.get(ZONES_URL)

    assert res.status_code == HTTPStatus.OK
    body = res.get_json()
    assert [z["name"] for z in body] == ["Centro", "Norte", "Sul"]
    assert all("id" in z for z in body)


# --------------------------------------------------------------------------- #
# POST /zones
# --------------------------------------------------------------------------- #

def test_create_zone(app, client):
    res = client.post(ZONES_URL, json={"name": "Norte"})

    assert res.status_code == HTTPStatus.CREATED
    body = res.get_json()
    assert body["name"] == "Norte"
    assert isinstance(body["id"], int)
    assert zone_names() == ["Norte"]


def test_create_zone_duplicate_name_returns_409(app, client):
    make_zone("Norte")

    res = client.post(ZONES_URL, json={"name": "Norte"})

    assert res.status_code == HTTPStatus.CONFLICT
    assert "name" in res.get_json()["errors"]
    assert zone_names() == ["Norte"]


def test_create_zone_missing_name_returns_400(app, client):
    res = client.post(ZONES_URL, json={})

    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "name" in res.get_json()["errors"]
    assert zone_names() == []


def test_create_zone_wrong_type_returns_400(app, client):
    res = client.post(ZONES_URL, json={"name": 123})

    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert zone_names() == []


def test_create_zone_name_too_long_returns_400(app, client):
    # Only passes if the schema enforces the String(512) limit with Length(max=512).
    res = client.post(ZONES_URL, json={"name": "x" * 513})

    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert zone_names() == []


def test_create_zone_invalid_json_returns_400(client):
    res = client.post(ZONES_URL, data="not json", content_type="application/json")

    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in res.get_json()["errors"]


def test_create_zone_without_body_returns_400(client):
    res = client.post(ZONES_URL)

    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in res.get_json()["errors"]


# --------------------------------------------------------------------------- #
# PATCH /zones/<id>
# --------------------------------------------------------------------------- #

def test_update_zone_renames(app, client):
    zone_id = make_zone("Norte")

    res = client.patch(zone_url(zone_id), json={"name": "Nordeste"})

    assert res.status_code == HTTPStatus.OK
    body = res.get_json()
    assert body["id"] == zone_id
    assert body["name"] == "Nordeste"
    assert zone_names() == ["Nordeste"]


def test_update_zone_same_name_is_ok(app, client):
    zone_id = make_zone("Norte")

    res = client.patch(zone_url(zone_id), json={"name": "Norte"})

    assert res.status_code == HTTPStatus.OK
    assert res.get_json()["name"] == "Norte"


def test_update_zone_not_found_returns_404(client):
    res = client.patch(zone_url(999999), json={"name": "Norte"})

    assert res.status_code == HTTPStatus.NOT_FOUND
    assert "id" in res.get_json()["errors"]


def test_update_zone_duplicate_name_returns_409(app, client):
    make_zone("Norte")
    sul_id = make_zone("Sul")

    res = client.patch(zone_url(sul_id), json={"name": "Norte"})

    assert res.status_code == HTTPStatus.CONFLICT
    assert "name" in res.get_json()["errors"]
    assert zone_names() == ["Norte", "Sul"]  # unchanged


def test_update_zone_missing_name_returns_400(app, client):
    zone_id = make_zone("Norte")

    res = client.patch(zone_url(zone_id), json={})

    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert zone_names() == ["Norte"]


def test_update_zone_invalid_json_returns_400(app, client):
    zone_id = make_zone("Norte")

    res = client.patch(zone_url(zone_id), data="not json", content_type="application/json")

    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in res.get_json()["errors"]
    assert zone_names() == ["Norte"]


# --------------------------------------------------------------------------- #
# DELETE /zones/<id>
# --------------------------------------------------------------------------- #

def test_delete_zone(app, client):
    zone_id = make_zone("Norte")

    res = client.delete(zone_url(zone_id))

    assert res.status_code == HTTPStatus.NO_CONTENT
    assert res.data == b""
    assert zone_names() == []


def test_delete_zone_not_found_returns_404(client):
    res = client.delete(zone_url(999999))

    assert res.status_code == HTTPStatus.NOT_FOUND
    assert "id" in res.get_json()["errors"]


def test_delete_zone_only_removes_that_zone(app, client):
    norte_id = make_zone("Norte")
    make_zone("Sul")

    client.delete(zone_url(norte_id))

    assert zone_names() == ["Sul"]


def test_delete_zone_keeps_contacts_with_null_zone(app, client):
    zone_id = make_zone("Norte")
    contact = Contact(name="Test Contact", zone_id=zone_id)
    db.session.add(contact)
    db.session.commit()
    contact_id = contact.id

    res = client.delete(zone_url(zone_id))

    assert res.status_code == HTTPStatus.NO_CONTENT
    db.session.expire_all()
    contact = db.session.get(Contact, contact_id)
    assert contact is not None
    assert contact.zone_id is None