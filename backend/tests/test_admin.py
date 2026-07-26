from fastapi.testclient import TestClient
from app.main import app
from app.core.db import SessionLocal, Base, engine
from app.core.security import create_access_token, get_password_hash
from app.models.models import Admin

Base.metadata.create_all(bind=engine)
client = TestClient(app)


def _make_admin_token():
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.email == "test-admin@example.com").first()
        if not admin:
            admin = Admin(
                name="Test Admin",
                email="test-admin@example.com",
                password_hash=get_password_hash("irrelevant"),
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        return create_access_token({"sub": str(admin.id), "role": "admin"})
    finally:
        db.close()


def test_admin_report_for_session_without_report_returns_404_not_500():
    """
    Reproduces: GET /admin/interviews/{id}/report for a session with no
    report yet (still in_progress, or a nonexistent id) must return a clean
    404 -- not crash. admin.py raised HTTPException without importing it,
    so this 500s with NameError in production, reachable from the admin
    dashboard's unconditional "View Report" button.
    """
    token = _make_admin_token()
    response = client.get(
        "/api/admin/interviews/999999/report",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Report not found"