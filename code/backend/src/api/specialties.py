from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/specialties", tags=["specialties"])

class SpecialtyResponse(BaseModel):
    id: str
    name: str

@router.get("/", response_model=List[SpecialtyResponse])
async def get_specialties():
    return [
        {"id": "clinica", "name": "Psicología Clínica"},
        {"id": "psiquiatria", "name": "Psiquiatría"},
        {"id": "pareja", "name": "Terapia de Pareja"},
        {"id": "infantil", "name": "Psicología Infantil"},
        {"id": "cognitivo_conductual", "name": "Terapia Cognitivo-Conductual"}
    ]
