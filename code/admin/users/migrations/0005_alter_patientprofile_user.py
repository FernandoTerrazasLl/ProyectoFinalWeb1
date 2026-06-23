import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_user_maternal_last_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patientprofile',
            name='user',
            field=models.OneToOneField(limit_choices_to={'role': 'PATIENT'}, on_delete=django.db.models.deletion.CASCADE, related_name='patient_profile', to=settings.AUTH_USER_MODEL),
        ),
    ]

