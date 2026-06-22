import os
import logging
from celery import shared_task
from elasticsearch import Elasticsearch

logger = logging.getLogger(__name__)

ES_HOST = os.environ.get("ELASTICSEARCH_HOST", "http://elasticsearch:9200")
INDEX_NAME = "providers"

def get_es_client():
    return Elasticsearch([ES_HOST])

@shared_task
def sync_provider_to_es(provider_id: str):
    from providers.models import ProviderProfile
    try:
        provider = ProviderProfile.objects.select_related('user', 'specialty').get(id=provider_id)
        
        doc = {
            "id": str(provider.id),
            "first_name": provider.user.first_name if provider.user else "",
            "last_name": provider.user.last_name if provider.user else "",
            "specialty": provider.specialty.name if provider.specialty else None,
            "session_price": float(provider.session_price),
            "bio": provider.bio,
            "is_approved": provider.is_approved,
            "average_rating": float(provider.average_rating),
            "review_count": provider.review_count,
            "tags": [tag.name for tag in provider.tags.all()],
            "avatar_url": provider.user.avatar_url if provider.user else ""
        }
        
        es = get_es_client()
        es.index(index=INDEX_NAME, id=str(provider.id), document=doc)
        logger.info(f"Successfully synced provider {provider_id} to ES.")
        
    except ProviderProfile.DoesNotExist:
        logger.error(f"Provider {provider_id} does not exist.")
    except Exception as e:
        logger.error(f"Failed to sync provider {provider_id} to ES: {str(e)}")

@shared_task
def delete_provider_from_es(provider_id: str):
    es = get_es_client()
    try:
        es.delete(index=INDEX_NAME, id=str(provider_id))
        logger.info(f"Successfully deleted provider {provider_id} from ES.")
    except Exception as e:
        logger.error(f"Failed to delete provider {provider_id} from ES (or not found): {str(e)}")
