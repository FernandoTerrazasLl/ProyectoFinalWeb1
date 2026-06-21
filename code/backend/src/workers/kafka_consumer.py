import os
import json
import logging
from kafka import KafkaConsumer
from motor.motor_asyncio import AsyncIOMotorClient
import clickhouse_connect
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "clickhouse")
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
            
        elif event_type == "triage_assessment":
            await mongo_db.triages.insert_one(event["data"])
            logger.info("Inserted triage assessment into MongoDB.")
            
        elif event_type == "metric_event":
            if ch_client:
                data = event["data"]
                timestamp = event["timestamp"].replace('T', ' ')[:19] # Basic formatting
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
