from fastapi.testclient import TestClient
from main import app
from src.core.security import get_password_hash, verify_password

client = TestClient(app)

def test_security_utils():
    pwd = "secretpassword"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed)
    assert not verify_password("wrong", hashed)

def test_login_invalid():
    res = client.post("/auth/login", json={"email": "notexist@test.com", "password": "abc"})
    assert res.status_code in [401, 404]

def test_register_and_login():
    import uuid
    random_email = f"user_{uuid.uuid4()}@test.com"
    res = client.post("/auth/register", json={
        "email": random_email,
        "password": "password123",
        "first_name": "Test",
        "last_name": "User",
        "role": "PATIENT"
    })
    assert res.status_code in [200, 201, 422]
    res = client.post("/auth/login", json={"email": random_email, "password": "password123"})
    assert res.status_code in [200, 401]
    assert "access_token" in res.json()

