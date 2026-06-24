import uuid
import random
from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User, PatientProfile
from providers.models import Specialty, Tag, ProviderProfile
from appointments.models import Appointment, ScheduleRule, ScheduleException

class Command(BaseCommand):
    help = 'Seeds the database with test data'

    def handle(self, *args, **options):
        pass

        self.stdout.write("Clearing existing data...")
        Appointment.objects.all().delete()
        ScheduleException.objects.all().delete()
        ScheduleRule.objects.all().delete()
        ProviderProfile.objects.all().delete()
        PatientProfile.objects.all().delete()
        Specialty.objects.all().delete()
        Tag.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Clearing Elasticsearch index...")
        import urllib.request
        try:
            req = urllib.request.Request("http://elasticsearch:9200/providers", method="DELETE")
            urllib.request.urlopen(req)
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Elasticsearch index check: {e}"))

        self.stdout.write("Creating Specialties...")
        specialty_names = ["Psicologia Clinica", "Terapia de Pareja", "Psicologia Laboral", "Psicologia Infantil"]
        specialties = [Specialty.objects.create(name=n, description=f"{n} description") for n in specialty_names]

        self.stdout.write("Creating Tags...")
        tag_names = ["Ansiedad", "Depresion", "Estres", "Autoestima", "Terapia Familiar", "Duelo", "Insomnio"]
        tags = [Tag.objects.create(name=n) for n in tag_names]

        self.stdout.write("Creating Admin...")
        User.objects.create_superuser(email="admin@test.com", password="password", first_name="Admin", role="ADMIN", username="admin@test.com")

        self.stdout.write("Creating Providers...")
        providers_data = [
            {"email": "provA@test.com", "first": "Carlos", "last": "Vega", "gender": "MALE", "price": 100, "rating": 4.8, "reviews": 12, "address": "Av. Arce 1234, Consultorio 12"},
            {"email": "provB@test.com", "first": "Mariana", "last": "Rios", "gender": "FEMALE", "price": 120, "rating": 4.0, "reviews": 3, "address": "Edificio Los Pinos, Piso 3, Of 301"},
            {"email": "provC@test.com", "first": "Fernando", "last": "Terrazas", "gender": "MALE", "price": 80, "rating": 0, "reviews": 0, "address": "Calle 21 de Calacoto, Centro Médico Integral"},
        ]

        provider_profiles = []
        for p in providers_data:
            user = User.objects.create_user(
                username=p["email"], email=p["email"], password="password",
                first_name=p["first"], last_name=p["last"], role="PROVIDER", gender=p["gender"],
                birth_date=date(1980, 1, 1), ci=str(random.randint(1000000, 9999999)), phone_number="70000000"
            )
            profile = ProviderProfile.objects.create(
                user=user, bio=f"Soy {p['first']} {p['last']}.", session_price=p["price"],
                specialty=random.choice(specialties), is_approved=True, office_address=p["address"]
            )
            profile.tags.set(random.sample(tags, k=random.randint(2, 5)))
            p["profile_id"] = profile.id
            provider_profiles.append(profile)

        self.stdout.write("Synchronously syncing providers to Elasticsearch...")
        from providers.tasks import sync_provider_to_es
        for profile in provider_profiles:
            sync_provider_to_es(str(profile.id))

        self.stdout.write("Creating Patients...")
        patient_profiles = []
        for i in range(1, 6):
            user = User.objects.create_user(
                username=f"patient{i}@test.com", email=f"patient{i}@test.com", password="password",
                first_name=f"Paciente", last_name=str(i), role="PATIENT", gender="OTHER",
                birth_date=date(1995, 5, 15), ci=str(random.randint(1000000, 9999999)), phone_number="70000001"
            )
            profile = PatientProfile.objects.create(user=user)
            patient_profiles.append(profile)

        self.stdout.write("Creating Schedule Rules...")

        for profile in provider_profiles:
            for day in range(1, 6):
                for h in range(8, 12):
                    
                    ScheduleRule.objects.create(provider=profile, day_of_week=day, start_time=time(h, 0), end_time=time(h, 30))
                for h in range(14, 18):
                    
                    ScheduleRule.objects.create(provider=profile, day_of_week=day, start_time=time(h, 0), end_time=time(h, 30))
        self.stdout.write("Creating Schedule Exceptions...")
        today = timezone.now().date()

        ScheduleException.objects.create(
            provider=provider_profiles[0], date=today + timedelta(days=1),
            start_time=time(10, 0), end_time=time(11, 0), exception_type="BLOCKED"
        )

        sunday = today + timedelta(days=(6 - today.weekday() + 7) % 7)
        if sunday == today:
            sunday += timedelta(days=7)

        ScheduleException.objects.create(
            provider=provider_profiles[1], date=sunday,
            start_time=time(15, 0), end_time=time(16, 0), exception_type="EXTRA"
        )

        self.stdout.write("Creating Appointments...")

        Appointment.objects.create(
            provider=provider_profiles[0], patient=patient_profiles[0], date=today - timedelta(days=2),
            time=time(9, 0), status="COMPLETED", price_charged=100.00
        )

        Appointment.objects.create(
            provider=provider_profiles[1], patient=patient_profiles[1], date=today + timedelta(days=2),
            time=time(14, 0), status="PENDING"
        )

        Appointment.objects.create(
            provider=provider_profiles[2], patient=patient_profiles[2], date=today + timedelta(days=3),
            time=time(16, 0), status="CONFIRMED"
        )

        Appointment.objects.create(
            provider=provider_profiles[0], patient=patient_profiles[3], date=today + timedelta(days=4),
            time=time(11, 0), status="CANCELLED"
        )

        Appointment.objects.create(
            provider=provider_profiles[0], patient=patient_profiles[4], date=today,
            time=time(8, 0), status="COMPLETED"
        )
        Appointment.objects.create(
            provider=provider_profiles[0], patient=patient_profiles[2], date=today,
            time=time(9, 0), status="COMPLETED"
        )

        self.stdout.write("Database seeded successfully with test appointments!")

        self.stdout.write("Seeding reviews via Backend API to populate UGC pipeline...")
        import urllib.request
        import json
        import time as time_mod

        for p in providers_data:
            target_reviews = p["reviews"]
            if target_reviews > 0:
                self.stdout.write(f"Generating {target_reviews} reviews for {p['first']} {p['last']}...")
                for i in range(target_reviews):

                    rating = int(p["rating"]) if i % 2 == 0 else min(5, int(p["rating"]) + 1)
                    if rating == 0: rating = 4

                    data = json.dumps({
                        "provider_id": str(p["profile_id"]),
                        "user_id": str(uuid.uuid4()),
                        "rating": rating,
                        "comment": f"Mensaje de prueba #{i+1} para el doctor."
                    }).encode('utf-8')

                    req = urllib.request.Request("http://backend:8001/ugc/reviews", data=data, headers={'Content-Type': 'application/json'})
                    try:
                        urllib.request.urlopen(req)
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Failed to submit review: {e}"))


                time_mod.sleep(1)

        self.stdout.write(self.style.SUCCESS('Successfully seeded reviews! Note: Kafka workers may take a few seconds to update Postgres/ES.'))

