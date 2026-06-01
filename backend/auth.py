import os
import logging
from . import models
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from dotenv import load_dotenv
from . import models
from .database import get_db
from .models import UserRole
import secrets

# Load .env from this file's directory regardless of where uvicorn is started.
# Calling load_dotenv twice is safe — python-dotenv won't override values
# that another module already loaded.
load_dotenv(Path(__file__).parent / ".env")
# ─── Logging ───────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ─── Configuration ─────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15       # 15 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7          # 7 days

# ─── Password Hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# ─── JWT Token ─────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token() -> str:
    """Generate a secure random refresh token."""
    return secrets.token_urlsafe(64)

def create_access_token_from_refresh(user) -> str:
    """Create a new access token from a valid user object."""
    return create_access_token({
        "sub": user.college_id,
        "role": user.role
    })

# ─── Get Current User (Bearer token → User object) ─────────────────────────────
import logging
logger = logging.getLogger(__name__)

async def get_current_user(token: str = Depends(...)):
    logger.info(f"Token received: {token[:30] if token else 'NONE'}")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f"Decoded payload: {payload}")
    except Exception as e:
        logger.error(f"JWT decode failed: {type(e).__name__}: {e}")
        raise
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        college_id: str = payload.get("sub")
        if college_id is None:
            logger.warning("Token received but 'sub' claim is missing.")
            raise credentials_exception
    except JWTError:
        logger.warning("Invalid or expired JWT token received.")
        raise credentials_exception

    result = await db.execute(select(models.User).filter(models.User.college_id == college_id))
    user = result.scalars().first()
    if user is None:
        logger.warning(f"Token valid but no user found for college_id: {college_id}")
        raise credentials_exception

    logger.info(f"User {user.college_id} ({user.role}) authenticated successfully.")
    return user

# ─── Token-string variant (for SSE / EventSource which can't send headers) ────
async def get_current_user_from_token(token: str, db: AsyncSession) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        college_id: str = payload.get("sub")
        if college_id is None:
            logger.warning("Token received but 'sub' claim is missing.")
            raise credentials_exception
    except JWTError:
        logger.warning("Invalid or expired JWT token received.")
        raise credentials_exception

    result = await db.execute(select(models.User).filter(models.User.college_id == college_id))
    user = result.scalars().first()
    if user is None:
        logger.warning(f"Token valid but no user found for college_id: {college_id}")
        raise credentials_exception

    logger.info(f"User {user.college_id} ({user.role}) authenticated via token param.")
    return user

# ─── Role-Based Access Control ─────────────────────────────────────────────────
def check_role(roles: list[UserRole]):
    async def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in roles:
            logger.warning(
                f"User {current_user.college_id} ({current_user.role}) "
                f"denied access — required: {[r.value for r in roles]}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return role_checker

# ─── Convenience Dependencies (import these in main.py) ────────────────────────
AdminOnly  = Depends(check_role([UserRole.ADMIN]))
HODOrAdmin = Depends(check_role([UserRole.HOD, UserRole.ADMIN]))
AnyUser    = Depends(get_current_user)
