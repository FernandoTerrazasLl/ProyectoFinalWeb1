from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, time, datetime, timezone
from zoneinfo import ZoneInfo
from pydantic import BaseModel, UUID4
import src.models.domain as models
from src.db.database import get_db
from src.core.dependencies import get_current_patient, get_current_provider, get_current_user

from src.models.schemas import *
from src.services.schedule_service import generate_slots
from src.services.availability_service import get_provider_slots, is_slot_blocked

router = APIRouter(prefix="/appointments", tags=["appointments"])
LOCAL_TIMEZONE = ZoneInfo("America/La_Paz")

def local_now() -> datetime:
    return datetime.now(LOCAL_TIMEZONE).replace(tzinfo=None)

@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    appt: AppointmentCreate,
    patient: models.PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    naive_time = appt.time.replace(tzinfo=None)

    now = local_now()
    appointment_dt = datetime.combine(appt.date, naive_time)
    if appointment_dt < now:
        raise HTTPException(status_code=400, detail="No se puede reservar una cita en el pasado.")

    existing = db.query(models.Appointment).filter(
        models.Appointment.provider_id == appt.provider_id,
        models.Appointment.date == appt.date,
        models.Appointment.time == naive_time,
        models.Appointment.status != "CANCELLED"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Time slot is already booked")

    valid_slots, blocked_exceptions = get_provider_slots(db, appt.provider_id, appt.date)

    if naive_time not in valid_slots:
        raise HTTPException(status_code=400, detail="Requested time is outside provider's working hours")

    if is_slot_blocked(naive_time, blocked_exceptions):
        raise HTTPException(status_code=400, detail="Requested time is blocked by the provider")

    provider_profile = db.query(models.ProviderProfile).filter(models.ProviderProfile.id == appt.provider_id).first()

    if provider_profile and provider_profile.user_id == patient.user_id:
        raise HTTPException(status_code=400, detail="No puedes agendar una cita contigo mismo.")

    price = provider_profile.session_price if provider_profile else None

    new_appt = models.Appointment(
        provider_id=appt.provider_id,
        patient_id=patient.id,
        date=appt.date,
        time=naive_time,
        reason=appt.reason,
        status="PENDING",
        price_charged=price,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        updated_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )

    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)

    return {
        "id": new_appt.id,
        "provider_id": new_appt.provider_id,
        "date": new_appt.date,
        "time": new_appt.time,
        "reason": new_appt.reason,
        "status": new_appt.status,
        "created_at": new_appt.created_at
    }

@router.get("/{id}/patient", response_model=PatientDetailResponse)
def get_appointment_patient(
    id: UUID4,
    provider: models.ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == id,
        models.Appointment.provider_id == provider.id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found or not yours")

    patient_profile = appointment.patient
    user = patient_profile.user

    age = 0
    if user.birth_date:
        today = date.today()
        age = today.year - user.birth_date.year - ((today.month, today.day) < (user.birth_date.month, user.birth_date.day))

    past_count = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_profile.id,
        models.Appointment.provider_id == provider.id,
        models.Appointment.status == "COMPLETED"
    ).count()

    return {
        "name": f"{user.first_name} {user.last_name} {user.maternal_last_name}".strip().replace("  ", " "),
        "age": age,
        "phone": user.phone_number or "N/A",
        "email": user.email,
        "time": appointment.time,
        "reason": appointment.reason,
        "ci": user.ci or "N/A",
        "gender": user.gender,
        "avatar_url": user.avatar_url,
        "status": appointment.status,
        "date": appointment.date,
        "created_at": appointment.created_at,
        "previous_appointments_count": past_count
    }

@router.patch("/{id}/cancel")
def cancel_appointment(
    id: UUID4,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    is_patient = current_user.patient_profile and current_user.patient_profile.id == appointment.patient_id
    is_provider = current_user.provider_profile and current_user.provider_profile.id == appointment.provider_id

    if not (is_patient or is_provider):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment")

    if appointment.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Appointment is already cancelled")

    appointment.status = "CANCELLED"
    appointment.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()

    return {"detail": "Appointment cancelled successfully"}

@router.patch("/{id}/complete")
def complete_appointment(
    id: UUID4,
    provider: models.ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == id,
        models.Appointment.provider_id == provider.id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status == "COMPLETED":
        raise HTTPException(status_code=400, detail="Appointment is already completed")
    if appointment.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Cancelled appointments cannot be completed")

    appointment.status = "COMPLETED"
    appointment.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()

    return {"detail": "Appointment completed successfully"}
