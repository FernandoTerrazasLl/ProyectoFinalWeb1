import asyncio
import uuid
import datetime
from motor.motor_asyncio import AsyncIOMotorClient

async def seed_mongodb():
    client = AsyncIOMotorClient("mongodb://mongodb:27017")
    db = client["curamente_ugc"]
    
    provider_id = "d4c91e0c-e786-4d0f-8e63-65f27d7874e1"
    
    # Check if already seeded
    count = await db.reviews.count_documents({"provider_id": provider_id})
    if count > 0:
        print(f"Already seeded {count} reviews.")
        return

    reviews = [
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "Excelente atención, muy profesional.", "date": "2026-06-20"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "Me ayudó muchísimo con mi ansiedad.", "date": "2026-06-19"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 4, "comment": "Muy buen doctor, lo recomiendo.", "date": "2026-06-18"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "Gran empatía y dedicación.", "date": "2026-06-15"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "El mejor psicólogo que he visitado.", "date": "2026-06-10"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 4, "comment": "Me sentí muy cómoda.", "date": "2026-06-05"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "Muy recomendado.", "date": "2026-06-01"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 4, "comment": "Buen trato y puntual.", "date": "2026-05-28"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "Excelente.", "date": "2026-05-20"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "Me ayudó a superar mis miedos.", "date": "2026-05-15"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "100% recomendado.", "date": "2026-05-10"},
        {"provider_id": provider_id, "user_id": str(uuid.uuid4()), "rating": 5, "comment": "Una gran persona y profesional.", "date": "2026-05-05"},
    ]
    
    await db.reviews.insert_many(reviews)
    print(f"Successfully seeded {len(reviews)} reviews to MongoDB for provider {provider_id}.")

if __name__ == "__main__":
    asyncio.run(seed_mongodb())
