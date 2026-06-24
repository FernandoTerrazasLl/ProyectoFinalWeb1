import uuid
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from src.db.database import get_db
import src.models.domain as models
from src.models.schemas import *
from src.services.mongo_client import get_mongo_db
from src.services.schedule_service import generate_slots
from src.services.availability_service import get_provider_slots, is_slot_blocked

router = APIRouter(prefix="/psychologists", tags=["psychologists"])


def _to_psychologist_response(provider: models.ProviderProfile) -> dict:
    user = provider.user

    return {
        "id": str(provider.id),
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "specialty": provider.specialty.name if provider.specialty else None,
        "session_price": float(provider.session_price) if provider.session_price else 0.0,
        "bio": provider.bio or "",
        "is_approved": bool(provider.is_approved),
        "average_rating": float(provider.average_rating) if provider.average_rating else 0.0,
        "review_count": provider.review_count or 0,
        "tags": [tag.name for tag in provider.tags],
        "avatar_url": user.avatar_url or "",
    }


def _query_psychologists_from_db(
    db: Session,
    skip: int,
    limit: int,
    q: Optional[str],
    specialty: Optional[str],
    maxRate: Optional[float],
) -> List[dict]:
    query = (
        db.query(models.ProviderProfile)
        .options(
            joinedload(models.ProviderProfile.user),
            joinedload(models.ProviderProfile.specialty),
            joinedload(models.ProviderProfile.tags),
        )
        .filter(models.ProviderProfile.is_approved.is_(True))
    )

    if q:
        term = f"%{q}%"
        query = query.join(models.ProviderProfile.user).filter(
            or_(
                models.User.first_name.ilike(term),
                models.User.last_name.ilike(term),
                models.ProviderProfile.bio.ilike(term),
            )
        )

    if specialty:
        query = query.join(models.ProviderProfile.specialty).filter(models.Specialty.name == specialty)

    if maxRate is not None:
        query = query.filter(models.ProviderProfile.session_price <= maxRate)

    providers = (
        query
        .order_by(models.ProviderProfile.average_rating.desc(), models.ProviderProfile.review_count.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [_to_psychologist_response(provider) for provider in providers]



@router.get("/", response_model=List[PsychologistResponse])
async def get_psychologists(
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = None,
    specialty: Optional[str] = None,
    maxRate: Optional[float] = None,
    db: Session = Depends(get_db)
):
    return _query_psychologists_from_db(db, skip, limit, q, specialty, maxRate)

@router.get("/{psychologist_id}", response_model=PsychologistResponse)
async def get_psychologist(
    psychologist_id: str,
    db: Session = Depends(get_db)
):
    try:
        provider_id = uuid.UUID(psychologist_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Psychologist not found")

    provider = (
        db.query(models.ProviderProfile)
        .options(
            joinedload(models.ProviderProfile.user),
            joinedload(models.ProviderProfile.specialty),
            joinedload(models.ProviderProfile.tags),
        )
        .filter(models.ProviderProfile.id == provider_id, models.ProviderProfile.is_approved.is_(True))
        .first()
    )

    if not provider:
        raise HTTPException(status_code=404, detail="Psychologist not found")

    return _to_psychologist_response(provider)



@router.get("/{psychologist_id}/availability", response_model=List[AvailabilitySlot])
def get_availability(
    psychologist_id: str,
    target_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db)
):
    try:
        prov_uuid = uuid.UUID(psychologist_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid provider ID")

    all_slots_set, blocked_exceptions = get_provider_slots(db, prov_uuid, target_date)

    if not all_slots_set and not blocked_exceptions:
        return []

    appointments = db.query(models.Appointment).filter(
        models.Appointment.provider_id == prov_uuid,
        models.Appointment.date == target_date,
        models.Appointment.status != "CANCELLED"
    ).all()

    booked_times = {app.time for app in appointments}

    availability = []
    for slot in all_slots_set:
        slot_str = slot.strftime("%H:%M")

        if is_slot_blocked(slot, blocked_exceptions):
            availability.append({"time": slot_str, "available": False})
            continue

        if slot in booked_times:
            availability.append({"time": slot_str, "available": False})
        else:
            availability.append({"time": slot_str, "available": True})

    return sorted(availability, key=lambda x: x["time"])

@router.get("/{psychologist_id}/reviews")
async def get_reviews(
    psychologist_id: str,
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    cursor = mongo_db.reviews.find({"provider_id": psychologist_id}).sort("rating", -1)
    reviews = await cursor.to_list(length=50)

    result = []
    for r in reviews:
        result.append({
            "id": str(r.get("_id")),
            "author": "Paciente Anónimo",
            "rating": r.get("rating", 0),
            "comment": r.get("comment", ""),
            "date": r.get("date", "2026-06-21"),
            "verified": True
        })
    return result

