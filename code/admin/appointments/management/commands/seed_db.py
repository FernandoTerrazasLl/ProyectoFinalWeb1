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
            {"email": "provA@test.com", "first": "Carlos", "last": "Vega", "gender": "MALE", "price": 100, "rating": 4.8, "reviews": 12},
            {"email": "provB@test.com", "first": "Mariana", "last": "Rios", "gender": "FEMALE", "price": 120, "rating": 4.0, "reviews": 3},
            {"email": "provC@test.com", "first": "Fernando", "last": "Terrazas", "gender": "MALE", "price": 80, "rating": 0, "reviews": 0},
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
                specialty=random.choice(specialties), is_approved=True
            )
            # We no longer spoof the average_rating and review_count.
            # They will be populated via actual Kafka events.
            
            profile.tags.set(random.sample(tags, k=random.randint(2, 5)))
            
            # Save target reviews to populate later
            p["profile_id"] = profile.id
            provider_profiles.append(profile)

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
        # Providers work Monday to Friday, 08:00 to 12:00 and 14:00 to 18:00
        for profile in provider_profiles:
            for day in range(1, 6): # 1=Monday, 5=Friday
                ScheduleRule.objects.create(provider=profile, day_of_week=day, start_time=time(8, 0), end_time=time(12, 0))
                ScheduleRule.objects.create(provider=profile, day_of_week=day, start_time=time(14, 0), end_time=time(18, 0))

        self.stdout.write("Creating Schedule Exceptions...")
        today = timezone.now().date()
        # Prov A has a block tomorrow from 10 to 11
        ScheduleException.objects.create(
            provider=provider_profiles[0], date=today + timedelta(days=1),
            start_time=time(10, 0), end_time=time(11, 0), exception_type="BLOCKED"
        )
        # Prov B has an extra shift on Sunday from 15 to 16
        sunday = today + timedelta(days=(6 - today.weekday() + 7) % 7) # Next Sunday
        if sunday == today:
            sunday += timedelta(days=7)
            
        ScheduleException.objects.create(
            provider=provider_profiles[1], date=sunday,
            start_time=time(15, 0), end_time=time(16, 0), exception_type="EXTRA"
        )

        self.stdout.write("Creating Appointments...")
        # Past appointment
        Appointment.objects.create(
            provider=provider_profiles[0], patient=patient_profiles[0], date=today - timedelta(days=2),
            time=time(9, 0), status="COMPLETED", price_charged=100.00
        )
        # Future appointment pending
        Appointment.objects.create(
            provider=provider_profiles[1], patient=patient_profiles[1], date=today + timedelta(days=2),
            time=time(14, 0), status="PENDING"
        )
        # Future appointment confirmed
        Appointment.objects.create(
            provider=provider_profiles[2], patient=patient_profiles[2], date=today + timedelta(days=3),
            time=time(16, 0), status="CONFIRMED"
        )
        # Cancelled appointment
        Appointment.objects.create(
            provider=provider_profiles[0], patient=patient_profiles[3], date=today + timedelta(days=4),
            time=time(11, 0), status="CANCELLED"
        )
        
        # Appointments for "Today"
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
                    # Slight variation around the target rating
                    rating = int(p["rating"]) if i % 2 == 0 else min(5, int(p["rating"]) + 1)
                    if rating == 0: rating = 4 # Fallback
                    
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
                
                # Small sleep to avoid bombarding Kafka simultaneously
                time_mod.sleep(1)
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded reviews! Note: Kafka workers may take a few seconds to update Postgres/ES.'))
