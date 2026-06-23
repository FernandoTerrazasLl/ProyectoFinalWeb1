import os
import json
import logging
from kafka import KafkaProducer

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")

class KafkaProducerClient:
    producer: KafkaProducer = None

    @classmethod
    def get_producer(cls) -> KafkaProducer:
        if cls.producer is None:
            try:
                cls.producer = KafkaProducer(
                    bootstrap_servers=KAFKA_BROKER,
                    value_serializer=lambda v: json.dumps(v).encode('utf-8')
                )
                logger.info(f"Connected to Kafka Producer at {KAFKA_BROKER}")
            except Exception as e:
                logger.error(f"Failed to connect to Kafka: {e}")
        return cls.producer

    @classmethod
    def close_producer(cls):
        if cls.producer:
            cls.producer.close()
            cls.producer = None

def get_kafka_producer() -> KafkaProducer:
    return KafkaProducerClient.get_producer()

