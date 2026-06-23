from django.contrib import admin
from .models import Appointment, ScheduleRule, ScheduleException

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'provider', 'date', 'time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('patient__user__username', 'provider__user__username')

@admin.register(ScheduleRule)
class ScheduleRuleAdmin(admin.ModelAdmin):
    list_display = ('provider', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week',)

@admin.register(ScheduleException)
class ScheduleExceptionAdmin(admin.ModelAdmin):
    list_display = ('provider', 'exception_type', 'date', 'start_time', 'end_time', 'reason')
    list_filter = ('exception_type', 'date')
    search_fields = ('provider__user__username', 'provider__user__email')
