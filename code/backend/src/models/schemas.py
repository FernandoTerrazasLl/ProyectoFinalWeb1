from pydantic import BaseModel, UUID4, EmailStr
from typing import List, Optional, Dict, Any
from datetime import date, time, datetime

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    maternal_last_name: str = ""
    ci: str
    birth_date: date
    gender: str
    phone_number: str
    role: str

class UserProfileResponse(BaseModel):
    first_name: str
    last_name: str
    maternal_last_name: str
    ci: str
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    phone_number: str

class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    maternal_last_name: str
    ci: str
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    phone_number: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLogin(BaseModel):
    id_token: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str

# --- APPOINTMENT SCHEMAS ---
class AppointmentCreate(BaseModel):
    provider_id: UUID4
    date: date
    time: time
    reason: str

class AppointmentResponse(BaseModel):
    id: UUID4
    provider_id: UUID4
    date: date
    time: time
    reason: str
    status: str
    created_at: datetime

class PatientDetailResponse(BaseModel):
    name: str
    age: int
    phone: str
    email: str
    time: time
    reason: str
    ci: Optional[str] = None
    gender: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str
    date: date
    created_at: datetime
    previous_appointments_count: int

# --- ME (PROFILE/SCHEDULE) SCHEMAS ---
class MyAppointmentResponse(BaseModel):
    id: UUID4
    provider_id: UUID4
    provider_name: str
    provider_phone: str
    provider_address: str
    date: date
    time: time
    state: str

class BlockedSlotCreate(BaseModel):
    date: date
    time: time

class ScheduleItemResponse(BaseModel):
    appointment_id: Optional[UUID4] = None
    time: time
    state: str
    patient_name: Optional[str] = None

class ProviderProfileUpdate(BaseModel):
    bio: str
    session_price: float
    tags: List[str]

class ProviderProfileResponse(BaseModel):
    bio: str
    session_price: float
    tags: List[str]

# --- PSYCHOLOGISTS SCHEMAS ---
class PsychologistResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    specialty: Optional[str] = None
    session_price: float
    bio: str
    is_approved: bool
    average_rating: float = 0.0
    review_count: int = 0
    tags: List[str] = []
    avatar_url: Optional[str] = ""

class AvailabilitySlot(BaseModel):
    time: str
    available: bool

# --- SPECIALTIES SCHEMAS ---
class SpecialtyResponse(BaseModel):
    id: str
    name: str

# --- TRIAGE SCHEMAS ---
class TriageScores(BaseModel):
    clinica: int = 0
    pareja: int = 0
    laboral: int = 0
    infantil: int = 0

class TriageRequest(BaseModel):
    user_id: str
    scores: TriageScores

class TriageResponse(BaseModel):
    recommended_specialty: str
    risk_level: str
    recommended_providers: List[PsychologistResponse]

# --- UGC SCHEMAS ---
class ReviewPayload(BaseModel):
    provider_id: str
    user_id: str
    rating: int
    comment: str

class EventPayload(BaseModel):
    user_id: Optional[str] = None
    event_type: str
    metadata: Dict[str, Any]
