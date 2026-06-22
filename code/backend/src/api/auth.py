from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from src.db.database import get_db
import src.models.domain as models
from src.core.security import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, decode_token, verify_google_token
)
from pydantic import BaseModel
from typing import Optional
from src.services.redis_client import get_redis
import redis.asyncio as redis

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "PATIENT"

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    id_token: str

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    
    name_parts = user.name.strip().split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    new_user = models.User(
        email=user.email,
        username=user.email,
        password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        role=user.role,
        is_staff=False,
        is_active=True,
        auth_provider="local"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id}

@router.post("/login")
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not db_user or db_user.auth_provider != "local":
        raise HTTPException(status_code=401, detail="Invalid credentials or account belongs to OAuth")
    
    if not verify_password(user_credentials.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/google")
def google_login(data: GoogleLogin, db: Session = Depends(get_db)):
    idinfo = verify_google_token(data.id_token)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google Token")
        
    email = idinfo.get("email")
    first_name = idinfo.get("given_name", "")
    last_name = idinfo.get("family_name", "")
    provider_id = idinfo.get("sub")
    
    db_user = db.query(models.User).filter(models.User.email == email).first()
    
    if not db_user:
        db_user = models.User(
            email=email,
            username=email,
            password=get_password_hash(None),
            first_name=first_name,
            last_name=last_name,
            role="PATIENT",
            is_staff=False,
            is_active=True,
            auth_provider="google",
            provider_id=provider_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    elif db_user.auth_provider == "local":
        db_user.auth_provider = "google_and_local"
        db_user.provider_id = provider_id
        db.commit()

    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
async def refresh(refresh_token: str = Header(...), redis_client: redis.Redis = Depends(get_redis)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
    jti = payload.get("jti")
    is_blacklisted = await redis_client.get(f"blacklist:{jti}")
    if is_blacklisted:
        raise HTTPException(status_code=401, detail="Token has been revoked")
        
    email = payload.get("sub")
    new_access = create_access_token(data={"sub": email, "role": "PATIENT"}) 
    return {"access_token": new_access, "token_type": "bearer"}

@router.post("/logout")
async def logout(refresh_token: str = Header(...), redis_client: redis.Redis = Depends(get_redis)):
    payload = decode_token(refresh_token)
    if payload:
        jti = payload.get("jti")
        await redis_client.setex(f"blacklist:{jti}", 7 * 24 * 60 * 60, "true")
    
    return {"message": "Successfully logged out"}
