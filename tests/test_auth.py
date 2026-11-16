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
