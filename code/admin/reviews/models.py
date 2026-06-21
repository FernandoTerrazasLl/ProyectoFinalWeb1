from django.db import models
from providers.models import ProviderProfile
from users.models import PatientProfile
from appointments.models import Appointment
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='review')
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='reviews')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.patient} for {self.provider} ({self.rating} stars)"
