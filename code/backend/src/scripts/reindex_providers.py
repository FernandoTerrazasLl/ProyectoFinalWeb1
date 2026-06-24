import os
import logging
import redis
from elasticsearch import Elasticsearch
from sqlalchemy import text
from src.db.database import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ES_HOST = os.getenv("ELASTICSEARCH_HOST", "http://elasticsearch:9200")

PROVIDERS_QUERY = text("""
    SELECT pp.id, u.first_name, u.last_name, u.avatar_url, pp.bio, pp.session_price,
           pp.is_approved, pp.average_rating, pp.review_count, s.name AS specialty
    FROM providers_providerprofile pp
    JOIN users_user u ON u.id = pp.user_id
    LEFT JOIN providers_specialty s ON s.id = pp.specialty_id
""")

TAGS_QUERY = text("""
    SELECT t.name
    FROM providers_providerprofile_tags pt
    JOIN providers_tag t ON t.id = pt.tag_id
    WHERE pt.providerprofile_id = :provider_id
""")


def build_document(row, tags):
    return {
        "first_name": row.first_name or "",
        "last_name": row.last_name or "",
        "bio": row.bio or "",
        "session_price": float(row.session_price) if row.session_price else 0.0,
        "specialty": row.specialty,
        "is_approved": bool(row.is_approved),
        "average_rating": float(row.average_rating) if row.average_rating else 0.0,
        "review_count": int(row.review_count) if row.review_count else 0,
        "tags": tags,
        "avatar_url": row.avatar_url or "",
    }


def reindex_providers():
    es = Elasticsearch([ES_HOST])

    with SessionLocal() as db:
        providers = db.execute(PROVIDERS_QUERY).fetchall()
        for provider in providers:
            tags = [tag.name for tag in db.execute(TAGS_QUERY, {"provider_id": provider.id}).fetchall()]
            es.index(index="providers", id=str(provider.id), body=build_document(provider, tags))

    print("Force refreshing the index to make docs immediately searchable...")
    es.indices.refresh(index="providers")

    # Invalidate Redis Cache globally after batch update
    print("Invalidating Redis cache...")
    try:
        redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
        
        # Invalidate all detail caches
        detail_keys = redis_client.keys("psychs:detail:*")
        if detail_keys:
            redis_client.delete(*detail_keys)
            
        # Invalidate all list caches
        list_keys = redis_client.keys("psychs:list:*")
        if list_keys:
            redis_client.delete(*list_keys)
            
        print("Redis cache invalidated successfully.")
    except Exception as e:
        print(f"Warning: Failed to invalidate Redis cache: {e}")
    finally:
        redis_client.close()

    print("Reindex complete!")
    logger.info(f"Indexed {len(providers)} providers into Elasticsearch")


if __name__ == "__main__":
    reindex_providers()
