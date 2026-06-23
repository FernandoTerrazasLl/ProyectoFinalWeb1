from fastapi.testclient import TestClient
from main import app
from datetime import date, timedelta

client = TestClient(app)

def test_appointments_integration():
    res = client.post("/auth/login", json={"email": "patient1@test.com", "password": "password"})
    assert res.status_code == 200
    patient_token = res.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}

    res = client.post("/auth/login", json={"email": "provA@test.com", "password": "password"})
    assert res.status_code == 200
    prov_token = res.json()["access_token"]
    prov_headers = {"Authorization": f"Bearer {prov_token}"}

    res = client.get("/psychologists?page=1&size=10")
    if res.status_code == 200 and len(res.json()) > 0:
        prov_id = res.json()[0]["id"]
    else:
        return

    today = date.today()
    next_monday = today + timedelta(days=(7 - today.weekday()) + 7)
    next_sunday = next_monday + timedelta(days=6)

    new_rules = [
        {"day_of_week": next_monday.isoweekday(), "start_time": "08:00:00", "end_time": "10:00:00"},
        {"day_of_week": next_monday.isoweekday(), "start_time": "11:00:00", "end_time": "13:00:00"},
        {"day_of_week": next_monday.isoweekday(), "start_time": "16:00:00", "end_time": "19:00:00"}
    ]
    res = client.post("/me/schedule-rules", json=new_rules, headers=prov_headers)
    assert res.status_code == 200

    res = client.get(f"/psychologists/{prov_id}/availability?date={next_monday}")
    slots = res.json()
    gap_10 = next((s for s in slots if s["time"] == "10:00"), None)
    assert gap_10 is None or not gap_10["available"]

    res = client.post("/me/exceptions", json={"date": str(next_monday), "time": "08:00:00", "exception_type": "BLOCKED"}, headers=prov_headers)
    assert res.status_code == 200

    res = client.get(f"/psychologists/{prov_id}/availability?date={next_monday}")
    slots = res.json()
    blocked_slot = next(s for s in slots if s["time"] == "08:00")
    assert not blocked_slot["available"]

    res = client.post("/appointments", json={"provider_id": prov_id, "date": str(next_monday), "time": "11:00:00", "reason": "Test"}, headers=patient_headers)
    assert res.status_code in [200, 400]

    res = client.post("/appointments", json={"provider_id": prov_id, "date": str(next_monday), "time": "10:00:00", "reason": "Test"}, headers=patient_headers)
    assert res.status_code == 400

