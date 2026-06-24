import os
import json
import logging
from kafka import KafkaConsumer
from motor.motor_asyncio import AsyncIOMotorClient
import clickhouse_connect
import asyncio
from src.db.database import SessionLocal
import src.models.domain as models
from elasticsearch import Elasticsearch
import redis.asyncio as redis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "clickhouse")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
KAFKA_TOPIC = "ugc_events"

async def setup_clickhouse():
    try:
        client = clickhouse_connect.get_client(host=CLICKHOUSE_HOST, port=8123)
        client.command('''
            CREATE TABLE IF NOT EXISTS user_events (
                timestamp DateTime,
                event_type String,
                user_id String,
                metadata String
            ) ENGINE = MergeTree()
            ORDER BY (timestamp, event_type)
        ''')
        logger.info("ClickHouse setup complete.")
        return client
    except Exception as e:
        logger.error(f"ClickHouse setup failed: {e}")
        return None

async def process_message(msg_value, mongo_db, ch_client):
    try:
        event = json.loads(msg_value)
        event_type = event.get("type")

        if event_type == "review":
            await mongo_db.reviews.insert_one(event["data"])
            logger.info("Inserted review into MongoDB.")

            provider_id = event["data"].get("provider_id")
            if provider_id:
                cursor = mongo_db.reviews.find({"provider_id": provider_id})
                reviews = await cursor.to_list(length=None)

                if reviews:
                    total = sum(int(r.get("rating", 0)) for r in reviews)
                    count = len(reviews)
                    avg = round(total / count, 2)

                    with SessionLocal() as db:
                        profile = db.query(models.ProviderProfile).filter(models.ProviderProfile.id == provider_id).first()
                        if profile:
                            profile.average_rating = avg
                            profile.review_count = count
                            db.commit()
                            logger.info(f"Updated Postgres for provider {provider_id} with avg {avg} and count {count}")

                    ES_HOST = os.environ.get("ELASTICSEARCH_HOST", "http://elasticsearch:9200")
                    es = Elasticsearch([ES_HOST])
                    es.update(index="providers", id=provider_id, body={"doc": {"average_rating": avg, "review_count": count}}, ignore=[404])
                    logger.info(f"Updated ES for provider {provider_id} with avg {avg} and count {count}")

                    try:
                        redis_client = redis.from_url(REDIS_URL)
                        await redis_client.delete(f"psychs:detail:{provider_id}")
                        keys = await redis_client.keys("psychs:list:*")
                        if keys:
                            await redis_client.delete(*keys)
                        logger.info(f"Invalidated Redis cache for provider {provider_id}")
                    except Exception as redis_err:
                        logger.error(f"Failed to invalidate Redis cache: {redis_err}")
                    finally:
                        await redis_client.aclose()

        elif event_type == "triage_assessment":
            await mongo_db.triages.insert_one(event["data"])
            logger.info("Inserted triage assessment into MongoDB.")

        elif event_type == "metric_event":
            if ch_client:
                data = event["data"]
                timestamp = event["timestamp"].replace('T', ' ')[:19]
                ch_client.insert('user_events', [
                    [timestamp, data.get("event_type", "unknown"), data.get("user_id", ""), json.dumps(data.get("metadata", {}))]
                ], column_names=['timestamp', 'event_type', 'user_id', 'metadata'])
                logger.info("Inserted metric_event into ClickHouse.")

    except Exception as e:
        logger.error(f"Error processing message: {e}")

async def consume():
    mongo_client = AsyncIOMotorClient(MONGO_URL)
    mongo_db = mongo_client["curamente_ugc"]
    ch_client = await setup_clickhouse()

    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id="ugc_group",
        auto_offset_reset='earliest'
    )

    logger.info("Kafka UGC Consumer Worker started...")

    for message in consumer:
        await process_message(message.value, mongo_db, ch_client)

def main():
    asyncio.run(consume())

if __name__ == "__main__":
    main()

