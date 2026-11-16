from conftest import OWNER_USER, TEST_PASSWORD


def test_me_requires_login(anon_client):
    res = anon_client.get("/api/me")
    assert res.status_code == 302
    assert "/login" in res.headers["Location"]


def test_me_returns_session_user(client):
    res = client.get("/api/me")
    assert res.status_code == 200
    body = res.get_json()
    assert set(body) == {"id", "email", "access_level"}
    assert body["access_level"] == "owner"


def test_me_does_not_leak_password_hash(client):
    assert "password" not in client.get("/api/me").get_data(as_text=True)


# ---- Login em JSON (página React) ----


def test_api_login_ok_starts_session(app):
    c = app.test_client()
    res = c.post("/api/auth/login", json={"username": OWNER_USER, "password": TEST_PASSWORD})
    assert res.status_code == 200
    assert res.get_json()["email"] == OWNER_USER
    assert c.get("/api/me").status_code == 200


def test_api_login_wrong_password_is_401_without_session(app):
    c = app.test_client()
    res = c.post("/api/auth/login", json={"username": OWNER_USER, "password": "errada"})
    assert res.status_code == 401
    assert res.get_json()["error"]["message"] == "Email ou palavra-passe incorretos."
    assert c.get("/api/me").status_code == 302


def test_api_login_unknown_user_same_message(app):
    res = app.test_client().post("/api/auth/login", json={"username": "ninguem@exemplo.pt", "password": "x"})
    assert res.status_code == 401
    assert res.get_json()["error"]["message"] == "Email ou palavra-passe incorretos."


def test_api_login_missing_fields_is_400(app):
    assert app.test_client().post("/api/auth/login", json={}).status_code == 400


def test_api_logout_ends_session(client):
    assert client.post("/api/auth/logout").status_code == 204
    assert client.get("/api/me").status_code == 302
