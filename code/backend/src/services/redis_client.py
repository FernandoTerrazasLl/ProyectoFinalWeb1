import os
import logging
import redis.asyncio as redis

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

class RedisClient:
    client: redis.Redis = None

    @classmethod
    def get_client(cls) -> redis.Redis:
        if cls.client is None:
            cls.client = redis.from_url(REDIS_URL, decode_responses=True)
            logger.info(f"Connected to Redis at {REDIS_URL}")
        return cls.client

    @classmethod
    async def close_client(cls):
        if cls.client:
            await cls.client.close()
            cls.client = None
            logger.info("Closed Redis connection")

async def get_redis() -> redis.Redis:
    return RedisClient.get_client()

