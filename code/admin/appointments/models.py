from django.db import models
from providers.models import ProviderProfile
from users.models import PatientProfile
import uuid
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime

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
    price_charged = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.time and (self.time.minute != 0 or self.time.second != 0):
            raise ValidationError({'time': 'Appointments can only be booked exactly on the hour (e.g., 14:00:00).'})
            
        if self._state.adding and self.date and self.time:
            dt = datetime.combine(self.date, self.time)
            if timezone.is_naive(dt):
                dt = timezone.make_aware(dt)
            if dt < timezone.now():
                raise ValidationError('Cannot book an appointment in the past.')

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

    def clean(self):
        super().clean()
        if self.start_time and (self.start_time.minute != 0 or self.start_time.second != 0):
            raise ValidationError({'start_time': 'Start time must be exactly on the hour.'})
        if self.end_time and (self.end_time.minute != 0 or self.end_time.second != 0):
            raise ValidationError({'end_time': 'End time must be exactly on the hour.'})
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError('End time must be strictly after start time.')

    def __str__(self):
        return f"{self.provider} - Day {self.day_of_week} ({self.start_time} - {self.end_time})"

class ScheduleException(models.Model):
    class ExceptionType(models.TextChoices):
        EXTRA = 'EXTRA', 'Extra Slot'
        BLOCKED = 'BLOCKED', 'Blocked Slot'
        
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='schedule_exceptions')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    exception_type = models.CharField(max_length=10, choices=ExceptionType.choices, default=ExceptionType.BLOCKED)

    def clean(self):
        super().clean()
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError('End time must be strictly after start time.')
        if self._state.adding and self.date:
            if self.date < timezone.now().date():
                raise ValidationError({'date': 'Cannot add an exception for a date in the past.'})

    def __str__(self):
        return f"{self.provider} - {self.exception_type} on {self.date} ({self.start_time} - {self.end_time})"
