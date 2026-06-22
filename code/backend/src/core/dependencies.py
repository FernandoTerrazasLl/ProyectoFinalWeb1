from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from src.db.database import get_db
import src.models.domain as models
from src.core.security import decode_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    return user

def get_current_patient(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.PatientProfile).filter(models.PatientProfile.user_id == current_user.id).first()
    if not patient:
        patient = models.PatientProfile(user_id=current_user.id)
        db.add(patient)
        db.commit()
        db.refresh(patient)
    return patient

def get_current_provider(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    provider = db.query(models.ProviderProfile).filter(models.ProviderProfile.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not registered as a psychologist/provider")
    return provider
