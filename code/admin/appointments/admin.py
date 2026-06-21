from django.contrib import admin
from .models import Appointment, ScheduleRule, BlockedSlot

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'provider', 'date', 'time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('patient__user__username', 'provider__user__username')

@admin.register(ScheduleRule)
class ScheduleRuleAdmin(admin.ModelAdmin):
    list_display = ('provider', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week',)

@admin.register(BlockedSlot)
class BlockedSlotAdmin(admin.ModelAdmin):
    list_display = ('provider', 'block_date', 'start_time', 'end_time', 'reason')
    list_filter = ('block_date',)
