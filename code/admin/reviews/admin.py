from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'provider', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('patient__user__username', 'provider__user__username')
