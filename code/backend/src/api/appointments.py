from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import date, time, datetime, timedelta
from typing import List
from pydantic import BaseModel
import src.models.domain as models
from src.db.database import get_db
from src.core.dependencies import get_current_patient
import uuid

router = APIRouter(prefix="/appointments", tags=["appointments"])

class AppointmentCreate(BaseModel):
    provider_id: str
    date: date
    time: time
    reason: str

class AppointmentResponse(BaseModel):
    id: str
    provider_id: str
    date: date
    time: time
    reason: str
    status: str
    created_at: datetime
    
class ScheduleResponse(BaseModel):
    available_slots: List[time]

def generate_slots(start_time: time, end_time: time, interval_minutes: int = 60) -> List[time]:
    slots = []
    current = datetime.combine(date.today(), start_time)
    end = datetime.combine(date.today(), end_time)
    
    while current + timedelta(minutes=interval_minutes) <= end:
        slots.append(current.time())
        current += timedelta(minutes=interval_minutes)
    return slots

@router.get("/psychologists/{provider_id}/schedule", response_model=ScheduleResponse)
def get_provider_schedule(
    provider_id: str,
    target_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db)
):
    try:
        prov_uuid = uuid.UUID(provider_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid provider ID")
        
    provider = db.query(models.ProviderProfile).filter(models.ProviderProfile.id == prov_uuid).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    weekday = target_date.weekday()
    
    rules = db.query(models.ScheduleRule).filter(
        models.ScheduleRule.provider_id == prov_uuid,
        models.ScheduleRule.day_of_week == weekday
    ).all()
    
    if not rules:
        return {"available_slots": []}
        
    blocked = db.query(models.BlockedSlot).filter(
        models.BlockedSlot.provider_id == prov_uuid,
        models.BlockedSlot.block_date == target_date
    ).all()
    
    appointments = db.query(models.Appointment).filter(
        models.Appointment.provider_id == prov_uuid,
        models.Appointment.date == target_date,
        models.Appointment.status != "Cancelled"
    ).all()
    
    booked_times = {app.time for app in appointments}
    
    available_slots = []
    for rule in rules:
        slots = generate_slots(rule.start_time, rule.end_time)
        for slot in slots:
            # Check if booked
            if slot in booked_times:
                continue
            
            is_blocked = False
            for b in blocked:
                if b.start_time <= slot < b.end_time:
                    is_blocked = True
                    break
            
            if not is_blocked:
                available_slots.append(slot)
                
    return {"available_slots": sorted(available_slots)}

@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    appt: AppointmentCreate,
    patient: models.PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    try:
        prov_uuid = uuid.UUID(appt.provider_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid provider ID")
        
    existing = db.query(models.Appointment).filter(
        models.Appointment.provider_id == prov_uuid,
        models.Appointment.date == appt.date,
        models.Appointment.time == appt.time,
        models.Appointment.status != "Cancelled"
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot is already booked")
        
    new_appt = models.Appointment(
        provider_id=prov_uuid,
        patient_id=patient.id,
        date=appt.date,
        time=appt.time,
        reason=appt.reason,
        status="Scheduled",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    
    return {
        "id": str(new_appt.id),
        "provider_id": str(new_appt.provider_id),
        "date": new_appt.date,
        "time": new_appt.time,
        "reason": new_appt.reason,
        "status": new_appt.status,
        "created_at": new_appt.created_at
    }

@router.get("/me", response_model=List[AppointmentResponse])
def get_my_appointments(
    patient: models.PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient.id
    ).order_by(models.Appointment.date.desc(), models.Appointment.time.desc()).all()
    
    result = []
    for appt in appointments:
        result.append({
            "id": str(appt.id),
            "provider_id": str(appt.provider_id),
            "date": appt.date,
            "time": appt.time,
            "reason": appt.reason,
            "status": appt.status,
            "created_at": appt.created_at
        })
    return result
