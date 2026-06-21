from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        PATIENT = 'PATIENT', 'Patient'
        PROVIDER = 'PROVIDER', 'Provider'
    
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PATIENT)
    auth_provider = models.CharField(max_length=20, default='local')

class PatientProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    ci = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} (Patient)"
