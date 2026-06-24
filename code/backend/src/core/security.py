from passlib.hash import django_pbkdf2_sha256
from datetime import datetime, timedelta, timezone
import jwt
import os
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "super-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

def verify_password(plain_password, hashed_password):
    if not hashed_password or hashed_password.startswith("!"):
        return False
    return django_pbkdf2_sha256.verify(plain_password, hashed_password)

def get_password_hash(password):
    if not password:
        return "!" + str(uuid.uuid4())
    return django_pbkdf2_sha256.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access", "jti": str(uuid.uuid4())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = {"sub": data.get("sub")}
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh", "jti": str(uuid.uuid4())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except Exception as e:
        import logging
        logging.error(f"Google Token Verification Failed: {e}")
        raise ValueError(str(e))
