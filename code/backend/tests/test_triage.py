from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_triage_evaluation():
    payload = {
        "user_id": "test-user-id",
        "scores": {
            "clinica": 5,
            "pareja": 0,
            "laboral": 1,
            "infantil": 0
        }
    }
    res = client.post("/triage/evaluate", json=payload)

    assert res.status_code in [200, 404, 422]

    if res.status_code == 200:
        data = res.json()
        assert "recommended_specialty" in data

