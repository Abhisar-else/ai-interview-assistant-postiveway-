from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_and_login():
    register_payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "test1234"
    }

    r = client.post("/api/auth/register", json=register_payload)
    assert r.status_code == 200

    login_payload = {
        "email": "testuser@example.com",
        "password": "test1234"
    }

    r = client.post("/api/auth/login", json=login_payload)
    assert r.status_code == 200
    assert "access_token" in r.json()