import os
import logging
from elasticsearch import AsyncElasticsearch

logger = logging.getLogger(__name__)

ES_HOST = os.getenv("ELASTICSEARCH_HOST", "http://elasticsearch:9200")

class ESClient:
    client: AsyncElasticsearch = None

    @classmethod
    def get_client(cls) -> AsyncElasticsearch:
        if cls.client is None:
            cls.client = AsyncElasticsearch([ES_HOST])
            logger.info(f"Connected to Elasticsearch at {ES_HOST}")
        return cls.client

    @classmethod
    async def close_client(cls):
        if cls.client:
            await cls.client.close()
            cls.client = None
            logger.info("Closed Elasticsearch connection")

async def get_es() -> AsyncElasticsearch:
    return ESClient.get_client()

from typing import Type, TypeVar, List
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

def parse_es_hits(es_response: dict, model_class: Type[T]) -> List[T]:
    """Extracts hits from an ES response and converts them to Pydantic models."""
    hits = es_response.get("hits", {}).get("hits", [])
    result = []
    for hit in hits:
        source = hit.get("_source", {})
        result.append(model_class(id=hit.get("_id"), **source))
    return result
