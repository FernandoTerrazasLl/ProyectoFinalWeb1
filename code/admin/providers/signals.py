import logging
from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.core.exceptions import ValidationError
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

@receiver(m2m_changed, sender=ProviderProfile.tags.through)
def limit_tags(sender, instance, action, **kwargs):
    if action == "pre_add":
        new_tags_count = len(kwargs.get('pk_set', []))
        current_tags_count = instance.tags.count()
        if current_tags_count + new_tags_count > 5:
            raise ValidationError("Un psicólogo no puede tener más de 5 etiquetas (tags) asignadas.")

