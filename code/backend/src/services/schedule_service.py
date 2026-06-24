from datetime import date, time, datetime, timedelta
from typing import List

def generate_slots(start_time: time, end_time: time, interval_minutes: int = 30) -> List[time]:
    """Generates a list of time slots given a start time, end time, and interval."""
    slots = []
    current = datetime.combine(date.today(), start_time)
    end = datetime.combine(date.today(), end_time)

    if end_time <= start_time:
        end += timedelta(days=1)

    while current + timedelta(minutes=interval_minutes) <= end:
        slots.append(current.time())
        current += timedelta(minutes=interval_minutes)
    return slots
