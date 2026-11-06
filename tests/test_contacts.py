"""Tests for /api/contacts (list, get, add, search, edit)."""
import pytest
from http import HTTPStatus

BASE = "/api/contacts"
BLOCKED = (301, 302, 401, 403)


def make(client, **overrides):
    body = {"name": "Zzyzx Qwertyuiop", "role_ids": 2}
    body.update(overrides)
    res = client.post(f"{BASE}/add", json=body)
    assert res.status_code == HTTPStatus.CREATED, f"setup add failed: {res.get_json()}"
    return res.get_json()


def search(client, **params):
    return client.get(f"{BASE}/search", query_string=params)


# ---------------------------------------------------------------- Auth & Roles

@pytest.mark.parametrize("method,path", [
    ("get", f"{BASE}/"),
    ("get", f"{BASE}/1"),
    ("get", f"{BASE}/search?q=test"),
    ("get", f"{BASE}/roles"),
    ("post", f"{BASE}/add"),
    ("patch", f"{BASE}/1"),
])
def test_anonymous_is_blocked(anon_client, method, path):
    res = getattr(anon_client, method)(path)
    assert res.status_code in BLOCKED


def test_non_owner_is_blocked(investor_client):
    assert investor_client.get(f"{BASE}/").status_code in BLOCKED

# ---------------------------------------------------------------- Roles
def test_get_roles(client):
    res = client.get(f"{BASE}/roles")
    assert res.status_code == HTTPStatus.OK
    assert isinstance(res.json, list)
    assert len(res.json) == 3

def test_create_role(client):
    res = client.post(
        f"{BASE}/roles",
        json={"name": "bogus"}
    )
    assert res.status_code == HTTPStatus.CREATED
    assert res.json["id"]
    assert res.json["name"] == "bogus"

def test_delete_role(client):
    res = client.post(
        f"{BASE}/roles",
        json={"name": "to_delete"}
    )

    assert res.status_code == HTTPStatus.CREATED
    assert res.json["id"]
    assert res.json["name"] == "to_delete"

    res = client.delete(
        f"{BASE}/roles/{res.json["id"]}"
    )

    assert res.status_code == HTTPStatus.NO_CONTENT

# ---------------------------------------------------------------- Add & Validation

def test_add_contact_returns_201_and_body(client):
    res = client.post(
        f"{BASE}/add",
        json={"name": "Zzyzx Qwertyuiop", "role_ids": 2,
              "email": "zzyzx@qwerty-test.example", "nif": "999000111"},
    )
    assert res.status_code == HTTPStatus.CREATED
    assert res.json["id"]
    assert res.json["name"] == "Zzyzx Qwertyuiop"
    assert res.json["email"] == "zzyzx@qwerty-test.example"
    assert res.json["roles"][0]["name"] == "client"


@pytest.mark.parametrize("missing", ["name", "role_ids"])
def test_add_requires_name_and_role(client, missing):
    body = {"name": "Zzyzx", "role_ids": 2}
    del body[missing]
    res = client.post(f"{BASE}/add", json=body)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert missing in res.json["errors"]


def test_add_rejects_invalid_email(client):
    res = client.post(f"{BASE}/add",
                      json={"name": "Zzyzx", "role_ids": 2, "email": "not-an-email"})
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "email" in res.json["errors"]


def test_add_rejects_non_json_body(client):
    res = client.post(f"{BASE}/add", data="hello", content_type="text/plain")
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in res.json["errors"]


def test_add_rejects_unknown_field(client):
    res = client.post(f"{BASE}/add",
                      json={"name": "Zzyzx", "role_ids": 2, "bogus": 1})
    assert res.status_code == HTTPStatus.BAD_REQUEST

def test_add_invalid_role_id(client):
    res = client.post(f"{BASE}/add",
                          json={"name": "Zzyzx", "role_ids": 99, "bogus": 1})
    assert res.status_code == HTTPStatus.BAD_REQUEST


# ---------------------------------------------------------------- List & Get

def test_list_is_sorted_by_name_and_paginated(client):
    for name in ("Zzyzx C", "Zzyzx A", "Zzyzx B"):
        make(client, name=name)
    res = client.get(f"{BASE}/", query_string={"per_page": 2})
    assert res.status_code == HTTPStatus.OK
    assert [c["name"] for c in res.json["data"]] == ["Zzyzx A", "Zzyzx B"]
    assert res.json["pagination"]["total"] == 3
    assert res.json["pagination"]["has_next"] is True


def test_list_excludes_investors(client):
    make(client, name="Zzyzx Client", role_ids=2)
    make(client, name="Zzyzx Investor", role_ids=1)
    res = client.get(f"{BASE}/")
    assert [c["name"] for c in res.json["data"]] == ["Zzyzx Client"]


@pytest.mark.parametrize("params", [{"page": 0}, {"page": "abc"}, {"per_page": 0},
                                    {"per_page": 101}, {"per_page": "1&page=2"}])
def test_list_rejects_bad_pagination(client, params):
    res = client.get(f"{BASE}/", query_string=params)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in res.json


def test_get_contact_by_id(client):
    created = make(client)
    res = client.get(f"{BASE}/{created['id']}")
    assert res.status_code == HTTPStatus.OK
    assert res.json["name"] == "Zzyzx Qwertyuiop"


def test_get_missing_contact_is_404(client):
    res = client.get(f"{BASE}/99999")
    assert res.status_code == HTTPStatus.NOT_FOUND
    assert "id" in res.json["errors"]


# ---------------------------------------------------------------- Search

@pytest.mark.parametrize(
    "q",
    ["zzyzx", "QWERTYUIOP", "zzyzx qwerty",
     "qwerty-test.example",
     "912345", "999000111"],
)
def test_search_finds_contact_by_any_field(client, q):
    make(client, email="zzyzx@qwerty-test.example",
         phone_number="912345678", nif="999000111")
    res = search(client, q=q)
    assert res.status_code == HTTPStatus.OK
    assert res.json["success"] is True
    assert res.json["pagination"]["total"] == 1
    assert res.json["data"][0]["name"] == "Zzyzx Qwertyuiop"


def test_search_no_match_returns_empty_200(client):
    make(client)
    res = search(client, q="zzzznomatch")
    assert res.status_code == HTTPStatus.OK
    assert res.json["data"] == []
    assert res.json["pagination"]["total"] == 0


def test_search_percent_is_treated_literally(client):
    make(client, name="Qqq 50%off Ltd")
    make(client, name="Qqq 50Xoff Ltd")
    res = search(client, q="50%o")
    assert [c["name"] for c in res.json["data"]] == ["Qqq 50%off Ltd"]


def test_search_underscore_is_treated_literally(client):
    make(client, name="Qqq a_b Ltd")
    make(client, name="Qqq axb Ltd")
    res = search(client, q="a_b")
    assert [c["name"] for c in res.json["data"]] == ["Qqq a_b Ltd"]


@pytest.mark.parametrize("q", ["%%", "__"])
def test_search_wildcards_alone_do_not_match_everything(client, q):
    make(client)
    res = search(client, q=q)
    assert res.status_code == HTTPStatus.OK
    assert res.json["data"] == []


@pytest.mark.parametrize("params", [{"q": ""}, {"q": "a"}, {"q": " a "}])
def test_search_rejects_missing_or_short_query(client, params):
    res = search(client, **params)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in res.json


@pytest.mark.parametrize("extra", [{"per_page": 0}, {"per_page": 101},
                                   {"per_page": "abc"}, {"page": 0}])
def test_search_rejects_bad_pagination(client, extra):
    res = search(client, q="zzyzx", **extra)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in res.json


# ---------------------------------------------------------------- Edit (PATCH)

def test_patch_updates_only_given_fields(client):
    c = make(client, email="zzyzx@qwerty-test.example")
    res = client.patch(f"{BASE}/{c['id']}", json={"phone_number": "911111111"})
    assert res.status_code == HTTPStatus.OK
    assert res.json["phone_number"] == "911111111"
    assert res.json["email"] == "zzyzx@qwerty-test.example"


def test_patch_missing_contact_is_404(client):
    res = client.patch(f"{BASE}/99999", json={"notes": "x"})
    assert res.status_code == HTTPStatus.NOT_FOUND
    assert "id" in res.json["errors"]


def test_patch_rejects_invalid_email(client):
    c = make(client)
    res = client.patch(f"{BASE}/{c['id']}", json={"email": "nope"})
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "email" in res.json["errors"]


def test_patch_rejects_non_json_body(client):
    c = make(client)
    res = client.patch(f"{BASE}/{c['id']}", data="hi", content_type="text/plain")
    assert res.status_code == HTTPStatus.BAD_REQUEST
    assert "body" in res.json["errors"]