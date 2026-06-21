from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Time, Text, Numeric, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users_user"

    id = Column(Integer, primary_key=True, index=True)
    password = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_staff = Column(Boolean, default=False)
    role = Column(String)
    auth_provider = Column(String, default="local")

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    provider_profile = relationship("ProviderProfile", back_populates="user", uselist=False)

class PatientProfile(Base):
    __tablename__ = "users_patientprofile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_user.id"), unique=True)
    ci = Column(String)
    birth_date = Column(Date)
    phone_number = Column(String)

    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")

class Specialty(Base):
    __tablename__ = "providers_specialty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(Text)

provider_tags = Table(
    "providers_providerprofile_tags",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("providerprofile_id", Integer, ForeignKey("providers_providerprofile.id")),
    Column("tag_id", Integer, ForeignKey("providers_tag.id")),
)

class Tag(Base):
    __tablename__ = "providers_tag"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class ProviderProfile(Base):
    __tablename__ = "providers_providerprofile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_user.id"), unique=True)
    bio = Column(Text)
    session_price = Column(Numeric(8, 2))
    specialty_id = Column(Integer, ForeignKey("providers_specialty.id"))
    is_approved = Column(Boolean, default=False)
    average_rating = Column(Numeric(3, 2), default=0.00)
    review_count = Column(Integer, default=0)

    user = relationship("User", back_populates="provider_profile")
    specialty = relationship("Specialty")
    tags = relationship("Tag", secondary=provider_tags)
    appointments = relationship("Appointment", back_populates="provider")
    schedule_rules = relationship("ScheduleRule", back_populates="provider")
    blocked_slots = relationship("BlockedSlot", back_populates="provider")

class Appointment(Base):
    __tablename__ = "appointments_appointment"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers_providerprofile.id"))
    patient_id = Column(Integer, ForeignKey("users_patientprofile.id"))
    date = Column(Date)
    time = Column(Time)
    reason = Column(Text)
    status = Column(String)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    provider = relationship("ProviderProfile", back_populates="appointments")
    patient = relationship("PatientProfile", back_populates="appointments")

class ScheduleRule(Base):
    __tablename__ = "appointments_schedulerule"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers_providerprofile.id"))
    day_of_week = Column(Integer)
    start_time = Column(Time)
    end_time = Column(Time)

    provider = relationship("ProviderProfile", back_populates="schedule_rules")

class BlockedSlot(Base):
    __tablename__ = "appointments_blockedslot"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers_providerprofile.id"))
    block_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    reason = Column(String)

    provider = relationship("ProviderProfile", back_populates="blocked_slots")
