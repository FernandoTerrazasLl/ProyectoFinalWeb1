import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from main import app
from src.db.database import get_db

@pytest.fixture(scope="module")
def client() -> TestClient:
    """
    Fixture muy sencillo para proveer el cliente de pruebas de FastAPI.
    En un entorno real, aquí se configuraría una base de datos de pruebas aislada,
    pero para este proyecto académico aprovecharemos los contenedores de Docker.
    """
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def db_session() -> Session:
    """
    Provee una sesión de base de datos directa para verificar cosas en los tests.
    """
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()
