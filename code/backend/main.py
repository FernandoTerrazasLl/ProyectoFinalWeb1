from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import auth, psychologists, specialties, ugc, triage, appointments

app = FastAPI(title="CuraMente API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(psychologists.router)
app.include_router(specialties.router)
app.include_router(appointments.router)
app.include_router(ugc.router)
app.include_router(triage.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to CuraMente API (FastAPI)"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
