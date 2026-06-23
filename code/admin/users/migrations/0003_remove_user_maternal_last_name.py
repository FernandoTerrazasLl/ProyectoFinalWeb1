from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_provider_id_alter_user_email_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='maternal_last_name',
        ),
    ]

