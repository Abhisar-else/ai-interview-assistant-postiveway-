from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_red():
    response = client.get("/api/health")
    assert response.status_code == 200
    # This will fail: status is 'healthy' in reality
    assert response.json()["status"] == "incorrect_status"
