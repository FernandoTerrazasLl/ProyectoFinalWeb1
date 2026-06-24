from datetime import date, time
from typing import Tuple, Set, List
from sqlalchemy.orm import Session
from pydantic import UUID4

import src.models.domain as models
from src.services.schedule_service import generate_slots

def get_provider_slots(db: Session, provider_id: UUID4, target_date: date) -> Tuple[Set[time], List[models.ScheduleException]]:
    """
    Retrieves and generates all possible time slots for a provider on a specific date,
    considering schedule rules and extra exceptions. Also returns a list of blocked exceptions.
    """
    weekday = target_date.isoweekday()

    rules = db.query(models.ScheduleRule).filter(
        models.ScheduleRule.provider_id == provider_id,
        models.ScheduleRule.day_of_week == weekday
    ).all()

    exceptions = db.query(models.ScheduleException).filter(
        models.ScheduleException.provider_id == provider_id,
        models.ScheduleException.date == target_date
    ).all()

    all_slots_set = set()
    for rule in rules:
        slots = generate_slots(rule.start_time, rule.end_time)
        all_slots_set.update(slots)

    extra_exceptions = [e for e in exceptions if e.exception_type == "EXTRA"]
    for e in extra_exceptions:
        slots = generate_slots(e.start_time, e.end_time)
        all_slots_set.update(slots)

    blocked_exceptions = [e for e in exceptions if e.exception_type == "BLOCKED"]

    return all_slots_set, blocked_exceptions

def is_slot_blocked(slot: time, blocked_exceptions: List[models.ScheduleException]) -> bool:
    """
    Checks if a specific time slot falls within any of the provided blocked exceptions.
    """
    for b in blocked_exceptions:
        if b.start_time <= slot < b.end_time:
            return True
    return False
