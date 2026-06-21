from django.core.management.base import BaseCommand
from providers.models import ProviderProfile
from providers.tasks import sync_provider_to_es

class Command(BaseCommand):
    help = 'Sync all ProviderProfiles to Elasticsearch'

    def handle(self, *args, **kwargs):
        providers = ProviderProfile.objects.all()
        count = providers.count()
        
        self.stdout.write(self.style.NOTICE(f'Starting sync of {count} providers to Elasticsearch...'))
        
        for provider in providers:
            sync_provider_to_es.delay(str(provider.id))
            
        self.stdout.write(self.style.SUCCESS(f'Successfully queued {count} providers for syncing.'))
