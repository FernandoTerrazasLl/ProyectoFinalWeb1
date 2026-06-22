import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from elasticsearch import AsyncElasticsearch
from elasticsearch.exceptions import NotFoundError
import redis.asyncio as redis
from sqlalchemy.orm import Session
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



@router.get("/", response_model=List[PsychologistResponse])
async def get_psychologists(
    skip: int = 0, 
    limit: int = 10, 
    q: Optional[str] = None,
    specialty: Optional[str] = None,
    maxRate: Optional[float] = None,
    es: AsyncElasticsearch = Depends(get_es),
    redis_client: redis.Redis = Depends(get_redis)
):
    cache_key = f"psychs:list:skip_{skip}:limit_{limit}:q_{q}:spec_{specialty}:max_{maxRate}"
    
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        logger.error(f"Redis error: {e}")
        
    must_clauses = []
    
    if q:
        must_clauses.append({
            "multi_match": {
                "query": q,
                "fields": ["first_name", "last_name", "bio"]
            }
        })
    if specialty:
        must_clauses.append({
            "match": {"specialty": specialty}
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
        es_response = await es.get(index="providers", id=psychologist_id)
        source = es_response["_source"]
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
        
    weekday = target_date.weekday()
    
    rules = db.query(models.ScheduleRule).filter(
        models.ScheduleRule.provider_id == prov_uuid,
        models.ScheduleRule.day_of_week == weekday
    ).all()
    
    if not rules:
        return []
        
    blocked = db.query(models.BlockedSlot).filter(
        models.BlockedSlot.provider_id == prov_uuid,
        models.BlockedSlot.block_date == target_date
    ).all()
    
    appointments = db.query(models.Appointment).filter(
        models.Appointment.provider_id == prov_uuid,
        models.Appointment.date == target_date,
        models.Appointment.status != "cancelled"
    ).all()
    
    booked_times = {app.time for app in appointments}
    
    availability = []
    for rule in rules:
        slots = generate_slots(rule.start_time, rule.end_time)
        for slot in slots:
            slot_str = slot.strftime("%H:%M")
            if slot in booked_times:
                availability.append({"time": slot_str, "available": False})
                continue
            
            is_blocked = False
            for b in blocked:
                if b.start_time <= slot < b.end_time:
                    is_blocked = True
                    break
            
            availability.append({"time": slot_str, "available": not is_blocked})
                
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
        # Map MongoDB _id object to string if needed
        result.append({
            "id": str(r.get("_id")),
            "author": "Paciente Anónimo", # Fallback since we only have user_id
            "rating": r.get("rating", 0),
            "comment": r.get("comment", ""),
            "date": r.get("date", "2026-06-21"),
            "verified": True
        })
    return result
