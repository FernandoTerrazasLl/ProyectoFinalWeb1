import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional

from src.services.kafka_producer import get_kafka_producer
from src.services.mongo_client import get_mongo_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from kafka import KafkaProducer
from fastapi import HTTPException

from src.models.schemas import *

router = APIRouter(prefix="/ugc", tags=["ugc"])
logger = logging.getLogger(__name__)

from src.core.events import dispatch_async_event

@router.post("/reviews", status_code=202)
async def submit_review(
    review: ReviewPayload,
    background_tasks: BackgroundTasks,
    producer: KafkaProducer = Depends(get_kafka_producer),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    existing = await mongo_db.reviews.find_one({
        "provider_id": review.provider_id,
        "user_id": review.user_id
    })

    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review for this professional.")

    await mongo_db.reviews.insert_one(review.dict())

    background_tasks.add_task(dispatch_async_event, producer, "review", review.dict())
    return {"status": "accepted", "message": "Review submitted successfully"}

@router.post("/events", status_code=202)
async def capture_event(
    event: EventPayload,
    background_tasks: BackgroundTasks,
    producer: KafkaProducer = Depends(get_kafka_producer)
):
    background_tasks.add_task(dispatch_async_event, producer, "metric_event", event.dict())
    return {"status": "accepted", "message": "Event captured successfully"}
