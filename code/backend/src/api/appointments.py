from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, time, datetime, timezone
from pydantic import BaseModel, UUID4
import src.models.domain as models
from src.db.database import get_db
from src.core.dependencies import get_current_patient, get_current_provider

from src.models.schemas import *
from src.services.schedule_service import generate_slots

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    appt: AppointmentCreate,
    patient: models.PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Appointment).filter(
        models.Appointment.provider_id == appt.provider_id,
        models.Appointment.date == appt.date,
        models.Appointment.time == appt.time,
        models.Appointment.status != "cancelled"
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot is already booked")
        
    new_appt = models.Appointment(
        provider_id=appt.provider_id,
        patient_id=patient.id,
        date=appt.date,
        time=appt.time,
        reason=appt.reason,
        status="pending",
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
    
    # Calculate age naively
    age = 0
    if patient_profile.birth_date:
        today = date.today()
        age = today.year - patient_profile.birth_date.year - ((today.month, today.day) < (patient_profile.birth_date.month, patient_profile.birth_date.day))
        
    return {
        "name": f"{user.first_name} {user.last_name}".strip(),
        "age": age,
        "phone": patient_profile.phone_number or "N/A",
        "reason": appointment.reason
    }
