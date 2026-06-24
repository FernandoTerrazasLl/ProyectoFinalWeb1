from enum import Enum

class UserRole(str, Enum):
    PATIENT = "PATIENT"
    PROVIDER = "PROVIDER"
    ADMIN = "ADMIN"

class AppointmentStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class ExceptionType(str, Enum):
    BLOCKED = "BLOCKED"
    EXTRA = "EXTRA"

class AuthProvider(str, Enum):
    LOCAL = "local"
    GOOGLE = "google"
    GOOGLE_AND_LOCAL = "google_and_local"
