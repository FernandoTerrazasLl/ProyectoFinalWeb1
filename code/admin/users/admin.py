from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, PatientProfile

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'ci', 'phone_number')
    search_fields = ('user__username', 'ci')

admin.site.register(User, CustomUserAdmin)
