from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, time, datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel, UUID4
import src.models.domain as models
from src.db.database import get_db
from src.core.dependencies import get_current_patient, get_current_provider, get_current_user
from src.services.es_client import get_es
from elasticsearch import AsyncElasticsearch
import logging

logger = logging.getLogger(__name__)

from src.models.schemas import *
from src.services.schedule_service import generate_slots

router = APIRouter(prefix="/me", tags=["me"])

@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(current_user: models.User = Depends(get_current_user)):
    return {
        "first_name": current_user.first_name or "",
        "last_name": current_user.last_name or "",
        "maternal_last_name": current_user.maternal_last_name or "",
        "ci": current_user.ci or "",
        "birth_date": current_user.birth_date,
        "gender": current_user.gender,
        "phone_number": current_user.phone_number or "",
        "email": current_user.email
    }

@router.put("/profile", response_model=UserProfileResponse)
def update_user_profile(
    profile_data: UserProfileUpdate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.email and profile_data.email != current_user.email:
        existing = db.query(models.User).filter(models.User.email == profile_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = profile_data.email

    current_user.first_name = profile_data.first_name
    current_user.last_name = profile_data.last_name
    current_user.maternal_last_name = profile_data.maternal_last_name
    current_user.ci = profile_data.ci
    current_user.birth_date = profile_data.birth_date
    current_user.gender = profile_data.gender
    current_user.phone_number = profile_data.phone_number
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "first_name": current_user.first_name or "",
        "last_name": current_user.last_name or "",
        "maternal_last_name": current_user.maternal_last_name or "",
        "ci": current_user.ci or "",
        "birth_date": current_user.birth_date,
        "gender": current_user.gender,
        "phone_number": current_user.phone_number or "",
        "email": current_user.email
    }

@router.get("/appointments", response_model=List[MyAppointmentResponse])
def get_my_appointments(
    patient: models.PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient.id
    ).order_by(models.Appointment.date.desc(), models.Appointment.time.desc()).all()
    
    result = []
    for appt in appointments:
        provider_profile = appt.provider
        user = provider_profile.user
        
        result.append({
            "id": appt.id,
            "provider_id": appt.provider_id,
            "provider_name": f"{user.first_name} {user.last_name}".strip(),
            "provider_phone": "N/A",  # Not in provider schema
            "provider_address": "N/A",  # Not in provider schema
            "date": appt.date,
            "time": appt.time,
            "state": appt.status
        })
    return result


@router.get("/schedule", response_model=List[ScheduleItemResponse])
def get_my_schedule(
    target_date: date = Query(..., alias="date"),
    provider: models.ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    weekday = target_date.isoweekday()
    
    rules = db.query(models.ScheduleRule).filter(
        models.ScheduleRule.provider_id == provider.id,
        models.ScheduleRule.day_of_week == weekday
    ).all()
    
    exceptions = db.query(models.ScheduleException).filter(
        models.ScheduleException.provider_id == provider.id,
        models.ScheduleException.date == target_date
    ).all()
    
    appointments = db.query(models.Appointment).filter(
        models.Appointment.provider_id == provider.id,
        models.Appointment.date == target_date,
        models.Appointment.status != "CANCELLED"
    ).all()
    
    booked_map = {app.time: app for app in appointments}
    
    all_slots_set = set()
    for rule in rules:
        slots = generate_slots(rule.start_time, rule.end_time)
        all_slots_set.update(slots)
        
    extra_exceptions = [e for e in exceptions if e.exception_type == "EXTRA"]
    for e in extra_exceptions:
        slots = generate_slots(e.start_time, e.end_time)
        all_slots_set.update(slots)
        
    blocked_exceptions = [e for e in exceptions if e.exception_type == "BLOCKED"]

    schedule_items = []
    for slot in all_slots_set:
        is_blocked = False
        for b in blocked_exceptions:
            if b.start_time <= slot < b.end_time:
                is_blocked = True
                break
                
        if is_blocked:
            schedule_items.append({
                "time": slot,
                "state": "blocked"
            })
            continue
            
        if slot in booked_map:
            appt = booked_map[slot]
            patient_name = f"{appt.patient.user.first_name} {appt.patient.user.last_name}".strip()
            schedule_items.append({
                "appointment_id": appt.id,
                "time": slot,
                "state": appt.status,
                "patient_name": patient_name
            })
        else:
            schedule_items.append({
                "time": slot,
                "state": "available"
            })
            
    return sorted(schedule_items, key=lambda x: x["time"])

@router.post("/exceptions")
def create_exception(
    exc: ScheduleExceptionCreate,
    provider: models.ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    dt = datetime.combine(date.today(), exc.time)
    end_time = (dt + timedelta(hours=1)).time()
    
    new_exc = models.ScheduleException(
        provider_id=provider.id,
        date=exc.date,
        start_time=exc.time,
        end_time=end_time,
        exception_type=exc.exception_type
    )
    db.add(new_exc)
    db.commit()
    return {"status": "success", "message": "Exception created successfully"}

@router.get("/schedule-rules", response_model=List[ScheduleRuleResponse])
def get_schedule_rules(
    provider: models.ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    rules = db.query(models.ScheduleRule).filter(
        models.ScheduleRule.provider_id == provider.id
    ).all()
    return rules

@router.post("/schedule-rules", response_model=List[ScheduleRuleResponse])
def update_schedule_rules(
    rules: List[ScheduleRuleCreate],
    provider: models.ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    # 1. Delete existing rules for this provider
    db.query(models.ScheduleRule).filter(
        models.ScheduleRule.provider_id == provider.id
    ).delete()
    
    # 2. Insert new rules
    new_rules = []
    for rule in rules:
        new_rule = models.ScheduleRule(
            provider_id=provider.id,
            day_of_week=rule.day_of_week,
            start_time=rule.start_time,
            end_time=rule.end_time
        )
        db.add(new_rule)
        new_rules.append(new_rule)
        
    db.commit()
    for nr in new_rules:
        db.refresh(nr)
        
    return new_rules

@router.get("/provider-profile", response_model=ProviderProfileResponse)
def get_provider_profile(
    provider: models.ProviderProfile = Depends(get_current_provider)
):
    return {
        "first_name": provider.user.first_name or "",
        "last_name": provider.user.last_name or "",
        "maternal_last_name": provider.user.maternal_last_name or "",
        "ci": provider.user.ci or "",
        "birth_date": provider.user.birth_date,
        "gender": provider.user.gender,
        "phone_number": provider.user.phone_number or "",
        "email": provider.user.email,
        "bio": provider.bio or "",
        "session_price": float(provider.session_price) if provider.session_price else 0.0,
        "tags": [tag.name for tag in provider.tags],
        "specialty": provider.specialty.name if provider.specialty else None,
        "office_address": getattr(provider, "office_address", "")
    }

@router.put("/provider-profile", response_model=ProviderProfileResponse)
async def update_provider_profile(
    profile_update: ProviderProfileUpdate,
    provider: models.ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db),
    es: AsyncElasticsearch = Depends(get_es)
):
    current_user = provider.user
    
    if profile_update.email and profile_update.email != current_user.email:
        existing = db.query(models.User).filter(models.User.email == profile_update.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = profile_update.email

    current_user.first_name = profile_update.first_name
    current_user.last_name = profile_update.last_name
    current_user.maternal_last_name = profile_update.maternal_last_name
    current_user.ci = profile_update.ci
    current_user.birth_date = profile_update.birth_date
    current_user.gender = profile_update.gender
    current_user.phone_number = profile_update.phone_number
    
    provider.bio = profile_update.bio
    provider.session_price = profile_update.session_price
    
    if hasattr(provider, 'office_address'):
        provider.office_address = profile_update.office_address
        
    if profile_update.specialty:
        spec = db.query(models.Specialty).filter(models.Specialty.name == profile_update.specialty).first()
        if not spec:
            spec = models.Specialty(name=profile_update.specialty, description="")
            db.add(spec)
            db.commit()
            db.refresh(spec)
        provider.specialty_id = spec.id
    
    provider.tags.clear()
    for tag_name in profile_update.tags:
        tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
        if not tag:
            tag = models.Tag(name=tag_name)
            db.add(tag)
        provider.tags.append(tag)
        
    db.commit()
    db.refresh(provider)
    
    tags_list = [tag.name for tag in provider.tags]
    price = float(provider.session_price) if provider.session_price else 0.0
    
    try:
        await es.update(
            index="providers",
            id=str(provider.id),
            body={
                "doc": {
                    "first_name": current_user.first_name,
                    "last_name": current_user.last_name,
                    "bio": provider.bio,
                    "session_price": price,
                    "tags": tags_list,
                    "specialty": profile_update.specialty
                }
            }
        )
    except Exception as e:
        logger.error(f"Failed to sync provider profile update to ES: {e}")
    
    return {
        "first_name": current_user.first_name or "",
        "last_name": current_user.last_name or "",
        "maternal_last_name": current_user.maternal_last_name or "",
        "ci": current_user.ci or "",
        "birth_date": current_user.birth_date,
        "gender": current_user.gender,
        "phone_number": current_user.phone_number or "",
        "email": current_user.email,
        "bio": provider.bio or "",
        "session_price": price,
        "tags": tags_list,
        "specialty": profile_update.specialty,
        "office_address": getattr(provider, "office_address", "")
    }
