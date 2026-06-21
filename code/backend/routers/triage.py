import json
import logging
from datetime import datetime, timezone
from typing import Dict, List
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
from elasticsearch import AsyncElasticsearch
from kafka import KafkaProducer

from src.services.es_client import get_es
from src.services.kafka_producer import get_kafka_producer
from routers.providers import ProviderResponse

router = APIRouter(prefix="/triage", tags=["triage"])
logger = logging.getLogger(__name__)

KAFKA_TOPIC = "ugc_events"

class TriageScores(BaseModel):
    clinica: int = 0
    pareja: int = 0
    laboral: int = 0
    infantil: int = 0

class TriageRequest(BaseModel):
    user_id: str
    scores: TriageScores

class TriageResponse(BaseModel):
    recommended_specialty: str
    risk_level: str
    recommended_providers: List[ProviderResponse]

def publish_event(producer: KafkaProducer, payload: dict):
    if producer:
        try:
            producer.send(KAFKA_TOPIC, payload)
        except Exception as e:
            logger.error(f"Error publishing to Kafka: {e}")

@router.post("/evaluate", response_model=TriageResponse)
async def evaluate_triage(
    triage: TriageRequest,
    background_tasks: BackgroundTasks,
    es: AsyncElasticsearch = Depends(get_es),
    producer: KafkaProducer = Depends(get_kafka_producer)
):
    # 1. Evaluate top specialty
    scores_dict = triage.scores.dict()
    top_specialty = max(scores_dict, key=scores_dict.get)
    max_score = scores_dict[top_specialty]
    
    # 2. Evaluate risk level based on max_score (mock logic)
    if max_score > 6:
        risk_level = "Severe"
    elif max_score > 3:
        risk_level = "Moderate"
    else:
        risk_level = "Low"
        
    # 3. Publish to Kafka (Persist in MongoDB)
    event_payload = {
        "type": "triage_assessment",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "user_id": triage.user_id,
            "scores": scores_dict,
            "recommended_specialty": top_specialty,
            "risk_level": risk_level
        }
    }
    background_tasks.add_task(publish_event, producer, event_payload)
    
    # 4. Query Elasticsearch for the top 3 providers in that specialty sorted by rating
    recommended_providers = []
    try:
        es_response = await es.search(
            index="providers",
            body={
                "query": {
                    "match": {"specialty": top_specialty}
                },
                "sort": [
                    {"average_rating": {"order": "desc"}}
                ],
                "size": 3
            }
        )
        hits = es_response.get("hits", {}).get("hits", [])
        for hit in hits:
            source = hit["_source"]
            recommended_providers.append(ProviderResponse(id=hit["_id"], **source))
    except Exception as e:
        logger.error(f"Error fetching recommended providers: {e}")
        # Not raising 500, we gracefully return an empty list of providers
        
    return TriageResponse(
        recommended_specialty=top_specialty,
        risk_level=risk_level,
        recommended_providers=recommended_providers
    )
