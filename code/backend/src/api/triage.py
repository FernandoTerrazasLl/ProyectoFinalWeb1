import json
import logging
from datetime import datetime, timezone
from typing import Dict, List
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
from elasticsearch import AsyncElasticsearch
from kafka import KafkaProducer

from src.services.es_client import get_es, parse_es_hits
from src.services.kafka_producer import get_kafka_producer

from src.models.schemas import *
from src.services.schedule_service import generate_slots

router = APIRouter(prefix="/triage", tags=["triage"])
logger = logging.getLogger(__name__)

from src.core.events import dispatch_async_event

@router.post("/evaluate", response_model=TriageResponse)
async def evaluate_triage(
    triage: TriageRequest,
    background_tasks: BackgroundTasks,
    es: AsyncElasticsearch = Depends(get_es),
    producer: KafkaProducer = Depends(get_kafka_producer)
):
    scores_dict = triage.scores.dict()
    top_specialty = max(scores_dict, key=scores_dict.get)
    max_score = scores_dict[top_specialty]
    
    if max_score > 6:
        risk_level = "Severe"
    elif max_score > 3:
        risk_level = "Moderate"
    else:
        risk_level = "Low"
        
    payload_data = {
        "user_id": triage.user_id,
        "scores": scores_dict,
        "recommended_specialty": top_specialty,
        "risk_level": risk_level
    }
    background_tasks.add_task(dispatch_async_event, producer, "triage_assessment", payload_data)
    
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
        recommended_providers = parse_es_hits(es_response, PsychologistResponse)
    except Exception as e:
        logger.error(f"Error fetching recommended providers: {e}")
        
    return TriageResponse(
        recommended_specialty=top_specialty,
        risk_level=risk_level,
        recommended_providers=recommended_providers
    )
