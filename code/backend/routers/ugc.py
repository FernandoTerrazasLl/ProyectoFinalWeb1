import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional

from src.services.kafka_producer import get_kafka_producer
from kafka import KafkaProducer

router = APIRouter(prefix="/ugc", tags=["ugc"])
logger = logging.getLogger(__name__)

KAFKA_TOPIC = "ugc_events"

class ReviewPayload(BaseModel):
    provider_id: str
    user_id: str
    rating: int
    comment: str

class EventPayload(BaseModel):
    user_id: Optional[str] = None
    event_type: str # e.g. "page_view", "click", "search"
    metadata: Dict[str, Any]

def publish_event(producer: KafkaProducer, payload: dict):
    if producer:
        try:
            producer.send(KAFKA_TOPIC, payload)
        except Exception as e:
            logger.error(f"Error publishing to Kafka: {e}")

@router.post("/reviews", status_code=202)
async def submit_review(
    review: ReviewPayload, 
    background_tasks: BackgroundTasks,
    producer: KafkaProducer = Depends(get_kafka_producer)
):
    event_payload = {
        "type": "review",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": review.dict()
    }
    background_tasks.add_task(publish_event, producer, event_payload)
    return {"status": "accepted", "message": "Review submitted successfully"}

@router.post("/events", status_code=202)
async def capture_event(
    event: EventPayload, 
    background_tasks: BackgroundTasks,
    producer: KafkaProducer = Depends(get_kafka_producer)
):
    event_payload = {
        "type": "metric_event",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": event.dict()
    }
    background_tasks.add_task(publish_event, producer, event_payload)
    return {"status": "accepted", "message": "Event captured successfully"}
