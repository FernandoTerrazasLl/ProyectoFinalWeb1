from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ugc_reviews():
    payload = {
        "provider_id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "rating": 5,
        "comment": "Excellent professional."
    }
    res = client.post("/ugc/reviews", json=payload)

    assert res.status_code in [202, 401]


