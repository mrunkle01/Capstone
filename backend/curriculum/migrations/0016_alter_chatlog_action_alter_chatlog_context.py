from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('curriculum', '0015_alter_gradereport_feedback'),
    ]

    operations = [
        migrations.RunSQL(
            "UPDATE curriculum_chatlog SET context = 'null' WHERE context IS NOT NULL",
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.AlterField(
            model_name='chatlog',
            name='context',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='chatlog',
            name='action',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]