from django.db import models
from django.conf import settings

class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class ProviderProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='provider_profile')
    bio = models.TextField(blank=True)
    session_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True, related_name='providers')
    tags = models.ManyToManyField(Tag, blank=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} (Provider)"
