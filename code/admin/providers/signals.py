import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ProviderProfile
from .tasks import sync_provider_to_es, delete_provider_from_es

logger = logging.getLogger(__name__)

@receiver(post_save, sender=ProviderProfile)
def trigger_provider_sync(sender, instance, created, **kwargs):
    logger.info(f"Signal caught for ProviderProfile {instance.id} (Created: {created}). Enqueueing sync task.")
    sync_provider_to_es.delay(str(instance.id))

@receiver(post_delete, sender=ProviderProfile)
def trigger_provider_deletion(sender, instance, **kwargs):
    logger.info(f"Signal caught for deleted ProviderProfile {instance.id}. Enqueueing delete task.")
    delete_provider_from_es.delay(str(instance.id))
