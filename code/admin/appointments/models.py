from django.db import models
from providers.models import ProviderProfile
from providers.models import ProviderProfile
from users.models import PatientProfile
import uuid

class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    time = models.TimeField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appointment: {self.patient} with {self.provider} on {self.date} at {self.time}"

class ScheduleRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='schedule_rules')
    day_of_week = models.IntegerField(choices=[
        (1, 'Monday'), (2, 'Tuesday'), (3, 'Wednesday'), 
        (4, 'Thursday'), (5, 'Friday'), (6, 'Saturday'), (7, 'Sunday')
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.provider} - Day {self.day_of_week} ({self.start_time} - {self.end_time})"

class BlockedSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='blocked_slots')
    block_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.provider} - Blocked on {self.block_date} ({self.start_time} - {self.end_time})"
