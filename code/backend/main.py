from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, providers

app = FastAPI(title="CuraMente API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(providers.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to CuraMente API (FastAPI)"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
