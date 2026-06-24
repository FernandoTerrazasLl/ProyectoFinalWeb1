import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from elasticsearch import AsyncElasticsearch
from elasticsearch.exceptions import NotFoundError
import redis.asyncio as redis
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from datetime import date, time, datetime, timedelta

from src.services.es_client import get_es, parse_es_hits
from src.services.redis_client import get_redis
from src.services.mongo_client import get_mongo_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.db.database import get_db
import src.models.domain as models
import uuid

from src.models.schemas import *
from src.services.schedule_service import generate_slots

router = APIRouter(prefix="/psychologists", tags=["psychologists"])
logger = logging.getLogger(__name__)


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
    db: Session = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    es: AsyncElasticsearch = Depends(get_es)
):
    cache_key = f"psychs:list:skip_{skip}:limit_{limit}:q_{q}:spec_{specialty}:max_{maxRate}"

    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        logger.error(f"Redis error: {e}")

    must_clauses = [
        {"match": {"is_approved": True}}
    ]

    if q:
        must_clauses.append({
            "multi_match": {
                "query": q,
                "fields": ["first_name", "last_name", "bio", "tags", "specialty"]
            }
        })
    if specialty:
        must_clauses.append({
            "match_phrase": {"specialty": specialty}
        })
    if maxRate is not None:
        must_clauses.append({
            "range": {
                "session_price": {"lte": maxRate}
            }
        })

    es_query = {"bool": {"must": must_clauses}} if must_clauses else {"match_all": {}}

    try:
        es_response = await es.search(
            index="providers",
            body={
                "query": es_query,
                "sort": [
                    {"average_rating": {"order": "desc"}}
                ],
                "from": skip,
                "size": limit
            }
        )
    except NotFoundError:
        return []
    except Exception as e:
        logger.error(f"Elasticsearch error: {e}")
        raise HTTPException(status_code=503, detail="Service Unavailable")

    result = [p.dict() for p in parse_es_hits(es_response, PsychologistResponse)]

    try:
        await redis_client.setex(cache_key, 60, json.dumps(result))
    except Exception as e:
        logger.error(f"Redis error on set: {e}")

    return result

@router.get("/{psychologist_id}", response_model=PsychologistResponse)
async def get_psychologist(
    psychologist_id: str,
    db: Session = Depends(get_db),
    es: AsyncElasticsearch = Depends(get_es),
    redis_client: redis.Redis = Depends(get_redis)
):
    cache_key = f"psychs:detail:{psychologist_id}"

    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        logger.error(f"Redis error: {e}")

    try:
        provider_id = uuid.UUID(psychologist_id)
    except ValueError:
        provider_id = None

    if provider_id:
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

        if provider:
            result = _to_psychologist_response(provider)
            try:
                await redis_client.setex(cache_key, 60, json.dumps(result))
            except Exception:
                pass

            return result

    try:
        es_response = await es.get(index="providers", id=psychologist_id)
        source = es_response["_source"]
        source.pop("id", None)
        result = PsychologistResponse(id=es_response["_id"], **source).dict()
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Psychologist not found")
    except Exception as e:
        logger.error(f"Elasticsearch error: {e}")
        raise HTTPException(status_code=503, detail="Service Unavailable")

    try:
        await redis_client.setex(cache_key, 60, json.dumps(result))
    except Exception:
        pass

    return result



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

    weekday = target_date.isoweekday()

    rules = db.query(models.ScheduleRule).filter(
        models.ScheduleRule.provider_id == prov_uuid,
        models.ScheduleRule.day_of_week == weekday
    ).all()

    exceptions = db.query(models.ScheduleException).filter(
        models.ScheduleException.provider_id == prov_uuid,
        models.ScheduleException.date == target_date
    ).all()

    if not rules and not exceptions:
        return []

    appointments = db.query(models.Appointment).filter(
        models.Appointment.provider_id == prov_uuid,
        models.Appointment.date == target_date,
        models.Appointment.status != "CANCELLED"
    ).all()

    booked_times = {app.time for app in appointments}

    all_slots_set = set()
    for rule in rules:
        slots = generate_slots(rule.start_time, rule.end_time)
        all_slots_set.update(slots)

    extra_exceptions = [e for e in exceptions if e.exception_type == "EXTRA"]
    for e in extra_exceptions:
        slots = generate_slots(e.start_time, e.end_time)
        all_slots_set.update(slots)

    blocked_exceptions = [e for e in exceptions if e.exception_type == "BLOCKED"]

    availability = []
    for slot in all_slots_set:
        slot_str = slot.strftime("%H:%M")

        is_blocked = False
        for b in blocked_exceptions:
            if b.start_time <= slot < b.end_time:
                is_blocked = True
                break

        if is_blocked:
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

