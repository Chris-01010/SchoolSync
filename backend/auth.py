import os
<<<<<<< HEAD
=======
import logging
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
import models
<<<<<<< HEAD

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

=======
from models import UserRole

# ─── Logging ───────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ─── Configuration ─────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ─── Password Hashing ──────────────────────────────────────────────────────────
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

<<<<<<< HEAD
=======
# ─── JWT Token ─────────────────────────────────────────────────────────────────
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
<<<<<<< HEAD
        expire = datetime.utcnow() + timedelta(minutes=15)
=======
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

<<<<<<< HEAD
=======
# ─── Get Current User (Bearer token → User object) ─────────────────────────────
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
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
<<<<<<< HEAD
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(models.User).filter(models.User.college_id == college_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

def check_role(roles: list[models.UserRole]):
    async def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in roles:
=======
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

# ─── Role-Based Access Control ─────────────────────────────────────────────────
def check_role(roles: list[UserRole]):
    async def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in roles:
            logger.warning(
                f"User {current_user.college_id} ({current_user.role}) "
                f"denied access — required: {[r.value for r in roles]}"
            )
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return role_checker
<<<<<<< HEAD
=======

# ─── Convenience Dependencies (import these in main.py) ────────────────────────
AdminOnly  = Depends(check_role([UserRole.ADMIN]))
HODOrAdmin = Depends(check_role([UserRole.HOD, UserRole.ADMIN]))
AnyUser    = Depends(get_current_user)
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
