import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from elasticsearch import AsyncElasticsearch
from elasticsearch.exceptions import NotFoundError
import redis.asyncio as redis

# Using the new services
from src.services.es_client import get_es
from src.services.redis_client import get_redis

router = APIRouter(prefix="/providers", tags=["providers"])
logger = logging.getLogger(__name__)

class ProviderResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    specialty: Optional[str] = None
    session_price: float
    bio: str
    is_approved: bool
    average_rating: float = 0.0
    review_count: int = 0

@router.get("/", response_model=List[ProviderResponse])
async def get_providers(
    skip: int = 0, 
    limit: int = 10, 
    es: AsyncElasticsearch = Depends(get_es),
    redis_client: redis.Redis = Depends(get_redis)
):
    cache_key = f"providers:list:skip_{skip}:limit_{limit}"
    
    # 1. Try Cache (Redis)
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        logger.error(f"Redis error: {e}")
        # Continue even if cache fails (Resilience)
        
    # 2. Query Elasticsearch
    try:
        es_response = await es.search(
            index="providers",
            body={
                "query": {"match_all": {}},
                "sort": [
                    {"average_rating": {"order": "desc"}}
                ],
                "from": skip,
                "size": limit
            }
        )
    except NotFoundError:
        # Index doesn't exist yet (ETL hasn't run), return empty list gracefully
        return []
    except Exception as e:
        logger.error(f"Elasticsearch error: {e}")
        raise HTTPException(status_code=503, detail="Service Unavailable")

    # Format the ES result
    hits = es_response.get("hits", {}).get("hits", [])
    result = []
    for hit in hits:
        source = hit["_source"]
        result.append(ProviderResponse(id=hit["_id"], **source).dict())
        
    # 3. Save to Cache with 60 seconds TTL
    try:
        await redis_client.setex(cache_key, 60, json.dumps(result))
    except Exception as e:
        logger.error(f"Redis error on set: {e}")

    return result

@router.get("/{provider_id}", response_model=ProviderResponse)
async def get_provider(
    provider_id: str, 
    es: AsyncElasticsearch = Depends(get_es),
    redis_client: redis.Redis = Depends(get_redis)
):
    cache_key = f"providers:detail:{provider_id}"
    
    # 1. Try Cache
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        logger.error(f"Redis error: {e}")

    # 2. Fetch from Elasticsearch
    try:
        es_response = await es.get(index="providers", id=provider_id)
        source = es_response["_source"]
        result = ProviderResponse(id=es_response["_id"], **source).dict()
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Provider not found")
    except Exception as e:
        logger.error(f"Elasticsearch error: {e}")
        raise HTTPException(status_code=503, detail="Service Unavailable")

    # 3. Save to Cache with 60 seconds TTL
    try:
        await redis_client.setex(cache_key, 60, json.dumps(result))
    except Exception:
        pass

    return result
