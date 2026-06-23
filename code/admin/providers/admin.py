from django.contrib import admin
from .models import Specialty, Tag, ProviderProfile

@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialty', 'session_price', 'office_address', 'is_approved')
    list_filter = ('is_approved', 'specialty')
    search_fields = ('user__username', 'user__email')
    filter_horizontal = ('tags',)
    readonly_fields = ('average_rating', 'review_count')

    def get_exclude(self, request, obj=None):
        if obj is None:
            return ('average_rating', 'review_count')
        return super().get_exclude(request, obj)

