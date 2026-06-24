def test_profile_updates(client):
    res = client.post("/auth/login", json={"email": "patient2@test.com", "password": "password"})
    assert res.status_code == 200
    patient_token = res.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}

    patient_payload = {
        "first_name": "Carlos",
        "last_name": "Mendoza",
        "maternal_last_name": "",
        "ci": "1234567",
        "birth_date": "1990-05-15",
        "gender": "Masculino",
        "phone_number": "+591 78945612",
        "email": "patient2@test.com"
    }

    res = client.put("/me/profile", json=patient_payload, headers=patient_headers)
    assert res.status_code == 200

    res = client.get("/me/profile", headers=patient_headers)
    data = res.json()
    assert data["first_name"] == "Carlos"

    res = client.post("/auth/login", json={"email": "provA@test.com", "password": "password"})
    prov_token = res.json()["access_token"]
    prov_headers = {"Authorization": f"Bearer {prov_token}"}

    provider_payload = {
        "first_name": "Marcos",
        "last_name": "Vega",
        "maternal_last_name": "",
        "ci": "1234567",
        "birth_date": "1985-08-20",
        "gender": "Masculino",
        "phone_number": "+591 71234567",
        "email": "provA@test.com",
        "bio": "Soy psicólogo clínico con más de 10 años de experiencia...",
        "session_price": 250.0,
        "specialty": "Psicología Infantil",
        "office_address": "Oficina central",
        "tags": ["Ansiedad"]
    }

    res = client.put("/me/provider-profile", json=provider_payload, headers=prov_headers)
    assert res.status_code == 200

    res = client.get("/me/provider-profile", headers=prov_headers)
    data = res.json()
    assert data["first_name"] == "Marcos"

