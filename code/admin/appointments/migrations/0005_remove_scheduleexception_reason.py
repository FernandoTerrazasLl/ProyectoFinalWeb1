from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0004_scheduleexception_delete_blockedslot'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='scheduleexception',
            name='reason',
        ),
    ]

