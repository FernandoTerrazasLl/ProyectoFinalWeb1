from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import auth, psychologists, specialties, ugc, triage, appointments, me

import logging
from pythonjsonlogger import jsonlogger

app = FastAPI(title="CuraMente API", root_path="/api")

logger = logging.getLogger()
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
logHandler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(logHandler)
else:
    logger.handlers[0].setFormatter(formatter)


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
app.include_router(me.router)
app.include_router(ugc.router)
app.include_router(triage.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a CuraMente"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

