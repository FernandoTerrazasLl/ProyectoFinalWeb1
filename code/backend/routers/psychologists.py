import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from elasticsearch import AsyncElasticsearch
from elasticsearch.exceptions import NotFoundError
import redis.asyncio as redis

from src.services.es_client import get_es
from src.services.redis_client import get_redis

router = APIRouter(prefix="/psychologists", tags=["psychologists"])
logger = logging.getLogger(__name__)

class PsychologistResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    specialty: Optional[str] = None
    session_price: float
    bio: str
    is_approved: bool
    average_rating: float = 0.0
    review_count: int = 0

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

    hits = es_response.get("hits", {}).get("hits", [])
    result = []
    for hit in hits:
        source = hit["_source"]
        result.append(PsychologistResponse(id=hit["_id"], **source).dict())
        
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
