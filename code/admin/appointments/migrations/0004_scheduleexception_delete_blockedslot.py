import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0003_appointment_price_charged'),
        ('providers', '0003_alter_providerprofile_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScheduleException',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date', models.DateField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('exception_type', models.CharField(choices=[('EXTRA', 'Extra Slot'), ('BLOCKED', 'Blocked Slot')], default='BLOCKED', max_length=10)),
                ('reason', models.CharField(blank=True, max_length=255)),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedule_exceptions', to='providers.providerprofile')),
            ],
        ),
        migrations.DeleteModel(
            name='BlockedSlot',
        ),
    ]

