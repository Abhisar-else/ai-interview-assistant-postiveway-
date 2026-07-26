from fastapi.testclient import TestClient
from app.main import app
from app.core.db import Base, engine

Base.metadata.create_all(bind=engine)
client = TestClient(app)


def _register_and_login():
    client.post(
        "/api/auth/register",
        json={"name": "Complete Tester", "email": "complete-tester@example.com", "password": "testpass123"},
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": "complete-tester@example.com", "password": "testpass123"},
    )
    return resp.json()["access_token"]


def test_interview_can_be_completed_without_500():
    """
    Reproduces: POST /interview/{id}/complete crashes with
    "ON CONFLICT clause does not match any PRIMARY KEY or UNIQUE
    constraint" on a database provisioned via Base.metadata.create_all()
    alone, because interview_reports.session_id was not declared
    unique=True in models.py even though the ON CONFLICT upsert in
    interview.py targets it as the conflict key.
    """
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    start = client.post(
        "/api/interview/start",
        headers=headers,
        json={"job_role": "Software Engineer", "interview_type": "Technical", "difficulty": "Easy"},
    )
    session_id = start.json()["id"]

    client.post(
        f"/api/interview/{session_id}/answer",
        headers=headers,
        json={"answer": "I have three years of experience with Python and FastAPI."},
    )

    complete = client.post(f"/api/interview/{session_id}/complete", headers=headers)
    assert complete.status_code == 200, complete.text
