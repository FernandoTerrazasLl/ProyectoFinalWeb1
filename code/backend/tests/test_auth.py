from src.core.security import get_password_hash, verify_password

def test_security_utils():
    pwd = "secretpassword"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed)
    assert not verify_password("wrong", hashed)

def test_login_invalid(client):
    res = client.post("/auth/login", json={"email": "notexist@test.com", "password": "abc"})
    assert res.status_code == 401

def test_register_and_login(client):
    import uuid
    random_email = f"user_{uuid.uuid4()}@test.com"
    res = client.post("/auth/register", json={
        "email": random_email,
        "password": "password123",
        "first_name": "Test",
        "last_name": "User",
        "maternal_last_name": "",
        "ci": "1234567",
        "birth_date": "1990-01-01",
        "gender": "F",
        "phone_number": "70000000",
        "role": "PATIENT"
    })
    assert res.status_code == 200
    res = client.post("/auth/login", json={"email": random_email, "password": "password123"})
    assert res.status_code == 200
    assert "access_token" in res.json()

