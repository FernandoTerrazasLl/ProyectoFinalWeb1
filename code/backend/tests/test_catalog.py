from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_specialties():
    res = client.get("/specialties")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_psychologists():
    res = client.get("/psychologists?page=1&size=10")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_psychologist_detail():
    res = client.get("/psychologists/123e4567-e89b-12d3-a456-426614174000")
    assert res.status_code in [200, 404]


