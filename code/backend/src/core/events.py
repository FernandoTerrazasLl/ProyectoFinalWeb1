import logging
from datetime import datetime, timezone
from kafka import KafkaProducer
from typing import Dict, Any

logger = logging.getLogger(__name__)
KAFKA_TOPIC = "ugc_events"

def dispatch_async_event(producer: KafkaProducer, event_type: str, data: Dict[str, Any]):
    """Centralized dispatcher that formats and sends an event to Kafka."""
    if not producer:
        return
        
    payload = {
        "type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": data
    }
    
    try:
        producer.send(KAFKA_TOPIC, payload)
    except Exception as e:
        logger.error(f"Error publishing to Kafka topic {KAFKA_TOPIC}: {e}")
