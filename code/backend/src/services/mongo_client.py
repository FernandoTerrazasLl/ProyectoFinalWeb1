import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
DATABASE_NAME = "curamente_ugc"

class MongoClient:
    client: AsyncIOMotorClient = None
    
    @classmethod
    def get_db(cls):
        if cls.client is None:
            cls.client = AsyncIOMotorClient(MONGO_URL)
            logger.info(f"Connected to MongoDB at {MONGO_URL}")
        return cls.client[DATABASE_NAME]

async def get_mongo_db():
    return MongoClient.get_db()
