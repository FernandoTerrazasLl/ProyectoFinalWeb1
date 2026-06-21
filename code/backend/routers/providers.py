from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/providers", tags=["providers"])

class ProviderResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    specialty: str | None
    session_price: float
    bio: str
    is_approved: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProviderResponse])
def get_providers(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    providers = db.query(models.ProviderProfile).offset(skip).limit(limit).all()
    
    result = []
    for provider in providers:
        user = provider.user
        specialty_name = provider.specialty.name if provider.specialty else None
        
        result.append({
            "id": provider.id,
            "first_name": user.first_name if user else "",
            "last_name": user.last_name if user else "",
            "specialty": specialty_name,
            "session_price": float(provider.session_price),
            "bio": provider.bio,
            "is_approved": provider.is_approved
        })
    
    return result

@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    provider = db.query(models.ProviderProfile).filter(models.ProviderProfile.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
        
    user = provider.user
    specialty_name = provider.specialty.name if provider.specialty else None
    
    return {
        "id": provider.id,
        "first_name": user.first_name if user else "",
        "last_name": user.last_name if user else "",
        "specialty": specialty_name,
        "session_price": float(provider.session_price),
        "bio": provider.bio,
        "is_approved": provider.is_approved
    }
