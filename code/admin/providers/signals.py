import logging
from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from .models import ProviderProfile, Specialty, Tag
from users.models import User
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

@receiver(post_save, sender=Specialty)
def trigger_sync_on_specialty_change(sender, instance, **kwargs):
    logger.info(f"Specialty '{instance.name}' changed. Enqueueing sync for related providers.")
    for profile in instance.providers.all():
        sync_provider_to_es.delay(str(profile.id))

@receiver(post_save, sender=Tag)
def trigger_sync_on_tag_change(sender, instance, **kwargs):
    logger.info(f"Tag '{instance.name}' changed. Enqueueing sync for related providers.")
    for profile in instance.providerprofile_set.all():
        sync_provider_to_es.delay(str(profile.id))

@receiver(post_save, sender=User)
def trigger_sync_on_user_change(sender, instance, **kwargs):
    if instance.role == "PROVIDER" and hasattr(instance, "provider_profile"):
        logger.info(f"User '{instance.email}' changed. Enqueueing sync for related provider profile.")
        sync_provider_to_es.delay(str(instance.provider_profile.id))
