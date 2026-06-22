from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from src.db.database import get_db
import src.models.domain as models

from src.models.schemas import *
from src.services.schedule_service import generate_slots

router = APIRouter(prefix="/specialties", tags=["specialties"])

@router.get("/", response_model=List[SpecialtyResponse])
def get_specialties(db: Session = Depends(get_db)):
    specialties = db.query(models.Specialty).all()
    return [{"id": str(s.id), "name": s.name} for s in specialties]
