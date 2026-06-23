from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from .models import User, PatientProfile
from providers.models import ProviderProfile

class OneStepUserCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, label="Contraseña")
    password_confirm = forms.CharField(widget=forms.PasswordInput, label="Confirmar Contraseña")

    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'maternal_last_name', 'ci',
            'birth_date', 'gender', 'phone_number', 'avatar_url',
            'email', 'role'
        )

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")

        if password and password_confirm and password != password_confirm:
            self.add_error('password_confirm', "Las contraseñas no coinciden")
            
        email = cleaned_data.get("email")
        if email:
            cleaned_data['username'] = email
            
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        user.username = self.cleaned_data.get("email")
        if commit:
            user.save()
        return user

class CustomUserAdmin(UserAdmin):
    add_form = OneStepUserCreationForm
    
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')

    add_fieldsets = (
        ('1. Información Personal', {
            'fields': ('first_name', 'last_name', 'maternal_last_name', 'ci')
        }),
        ('2. Datos Clínicos y Contacto', {
            'fields': ('birth_date', 'gender', 'phone_number', 'avatar_url')
        }),
        ('3. Credenciales de Acceso', {
            'fields': ('email', 'password', 'password_confirm', 'role')
        }),
    )

    fieldsets = (
        ('1. Información Personal', {
            'fields': ('first_name', 'last_name', 'maternal_last_name', 'ci')
        }),
        ('2. Datos Clínicos y Contacto', {
            'fields': ('birth_date', 'gender', 'phone_number', 'avatar_url')
        }),
        ('3. Credenciales de Acceso', {
            'fields': ('email', 'role', 'is_active', 'is_staff', 'is_superuser')
        }),
    )

admin.site.register(User, CustomUserAdmin)
