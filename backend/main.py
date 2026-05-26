import os
import secrets
import time
import collections
import logging

from uuid import UUID
from datetime import timedelta, datetime
from typing import List, Optional

from dotenv import load_dotenv
from pydantic import BaseModel

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    BackgroundTasks,
    status,
    Request,
    Response,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from .database import engine, Base, get_db
from . import models
from . import schemas
from . import relief
from . import auth
from . import leave_api
from . import relief_router

from .email_service import (
    send_verification_email,
    send_password_reset_email,
)

from .crud import router as master_router
from .admin_dashboard import router as admin_dashboard_router
from .rooms import router as rooms_router
from .blockedslot import router as blocked_slots_router

from .worker import generate_timetable_task


load_dotenv()
env_path = "C:/Users/hp/Desktop/SchoolSync/.env"
load_dotenv(dotenv_path=env_path)


# ─── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


# ─── Rate Limiter ──────────────────────────────────────────────────────────────

_RATE_LIMIT_WINDOW = 15 * 60
_RATE_LIMIT_MAX = 5

_login_attempts: dict[str, list[float]] = collections.defaultdict(list)


def _check_rate_limit(email: str) -> None:
    now = time.monotonic()

    _login_attempts[email] = [
        t for t in _login_attempts[email]
        if now - t < _RATE_LIMIT_WINDOW
    ]

    if len(_login_attempts[email]) >= _RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "too_many_attempts",
                "message": "Too many login attempts. Please wait 15 minutes before trying again.",
                "retry_after_minutes": 15,
            },
        )

    _login_attempts[email].append(now)


class EmailLoginRequest(BaseModel):
    email: str
    password: str


# ─── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="SchoolSync API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5177",
        "http://127.0.0.1:5177",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Routers ───────────────────────────────────────────────────────────────────

app.include_router(master_router, prefix="/api/v1")
app.include_router(admin_dashboard_router, prefix="/api/v1")
app.include_router(rooms_router, prefix="/api/v1")
app.include_router(blocked_slots_router, prefix="/api/v1")

app.include_router(leave_api.router, prefix="/leaves", tags=["leaves"])
app.include_router(relief_router.router, prefix="/relief", tags=["relief"])


# ─── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root():
    return {"message": "SchoolSync API is running"}


# ─── JSON email login ──────────────────────────────────────────────────────────

@app.post("/api/auth/login", response_model=schemas.Token)
async def login_json(
    payload: EmailLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    _check_rate_limit(payload.email)

    result = await db.execute(
        select(models.User).filter(models.User.email == payload.email)
    )

    user = result.scalars().first()

    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please check your inbox or request a new verification email."
        )

    access_token_expires = timedelta(
        minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = auth.create_access_token(
        data={
            "sub": user.college_id,
            "role": user.role
        },
        expires_delta=access_token_expires,
    )

    refresh_token = auth.create_refresh_token()

    user.refresh_token = refresh_token
    user.refresh_token_expires_at = (
        datetime.utcnow() +
        timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    await db.commit()

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=int(
            timedelta(
                days=auth.REFRESH_TOKEN_EXPIRE_DAYS
            ).total_seconds()
        )
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=int(access_token_expires.total_seconds())
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post("/auth/refresh", response_model=schemas.Token)
async def refresh_access_token(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh token missing."
        )

    result = await db.execute(
        select(models.User).filter(
            models.User.refresh_token == refresh_token
        )
    )

    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token."
        )

    if user.refresh_token_expires_at < datetime.utcnow():
        user.refresh_token = None
        user.refresh_token_expires_at = None

        await db.commit()

        raise HTTPException(
            status_code=401,
            detail="Refresh token expired. Please log in again."
        )

    new_access_token = auth.create_access_token({
        "sub": user.college_id,
        "role": user.role
    })

    logger.info(
        f"Access token refreshed for user {user.college_id}"
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@app.post("/auth/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        result = await db.execute(
            select(models.User).filter(
                models.User.refresh_token == refresh_token
            )
        )

        user = result.scalars().first()

        if user:
            user.refresh_token = None
            user.refresh_token_expires_at = None
            await db.commit()

    response.delete_cookie("refresh_token")
    response.delete_cookie("access_token")

    return {"message": "Logged out successfully."}


# ─── Form login ────────────────────────────────────────────────────────────────

@app.post("/auth/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.User).filter(
            models.User.email == form_data.username
        )
    )

    user = result.scalars().first()

    if not user or not auth.verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please check your inbox or request a new verification email."
        )

    access_token_expires = timedelta(
        minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = auth.create_access_token(
        data={
            "sub": user.college_id,
            "role": user.role
        },
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ─── Social OAuth stubs ────────────────────────────────────────────────────────

@app.get("/api/auth/google")
async def social_google():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth is not yet configured."
    )


@app.get("/api/auth/microsoft")
async def social_microsoft():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Microsoft OAuth is not yet configured."
    )


@app.get("/api/auth/apple")
async def social_apple():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth is not yet configured."
    )


# ─── Signup ────────────────────────────────────────────────────────────────────

@app.post("/auth/signup", response_model=schemas.User)
async def signup(
    user: schemas.UserCreate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.User).filter(
            models.User.college_id == user.college_id
        )
    )

    if result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="College ID already registered"
        )

    result = await db.execute(
        select(models.User).filter(
            models.User.email == user.email
        )
    )

    if result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    db_user = models.User(
        college_id=user.college_id,
        email=user.email,
        password_hash=auth.get_password_hash(user.password),
        role=user.role
    )

    db.add(db_user)

    await db.commit()
    await db.refresh(db_user)

    if db_user.role == models.UserRole.TEACHER:
        teacher_profile = models.Teacher(
            user_id=db_user.id,
            name=user.name or db_user.college_id,
            email=db_user.email,
            current_relief_hours=0,
            total_hours_worked=0,
            is_active=True
        )

        db.add(teacher_profile)
        await db.commit()

    token = secrets.token_urlsafe(32)

    db_user.verification_token = token
    db_user.verification_token_expires_at = (
        datetime.utcnow() + timedelta(hours=24)
    )

    if os.getenv("DEV_AUTO_VERIFY", "").lower() == "true":
        db_user.is_verified = True

    await db.commit()

    send_verification_email(
        db_user.email,
        db_user.college_id,
        token
    )

    return db_user


# ─── Email Verification ────────────────────────────────────────────────────────

@app.get("/verify-email")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.User).filter(
            models.User.verification_token == token
        )
    )

    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token."
        )

    if user.verification_token_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Verification token expired."
        )

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None

    await db.commit()

    logger.info(
        f"Email verified for user {user.college_id}"
    )

    return {
        "message": "Email verified successfully. You can now log in."
    }


# ─── Password Reset ────────────────────────────────────────────────────────────

@app.post("/auth/forgot-password")
async def forgot_password(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.User).filter(
            models.User.email == email
        )
    )

    user = result.scalars().first()

    if not user:
        return {
            "message": "If that email exists, a reset link has been sent."
        }

    token = secrets.token_urlsafe(32)

    user.reset_token = token
    user.reset_token_expires_at = (
        datetime.utcnow() + timedelta(hours=1)
    )

    await db.commit()

    send_password_reset_email(
        user.email,
        user.college_id,
        token
    )

    logger.info(
        f"Password reset requested for {user.email}"
    )

    return {
        "message": "If that email exists, a reset link has been sent."
    }


@app.post("/auth/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.User).filter(
            models.User.reset_token == token
        )
    )

    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid reset token."
        )

    if user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Reset token expired."
        )

    user.password_hash = auth.get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None

    await db.commit()

    logger.info(
        f"Password reset successful for {user.college_id}"
    )

    return {
        "message": "Password reset successfully."
    }


# ─── Auth User ─────────────────────────────────────────────────────────────────

@app.get("/auth/me", response_model=schemas.User)
async def get_me(
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user


# ─── Sync Timetable Generation ─────────────────────────────────────────────────

@app.post(
    "/generate-timetable-sync/",
    dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))]
)
async def generate_timetable_sync(
    db: AsyncSession = Depends(get_db)
):
    import uuid as uuid_module

    teachers_res = await db.execute(select(models.Teacher))
    teachers = teachers_res.scalars().all()

    rooms_res = await db.execute(select(models.Room))
    rooms = rooms_res.scalars().all()

    subjects_res = await db.execute(select(models.Subject))
    subjects = subjects_res.scalars().all()

    classes_res = await db.execute(select(models.ClassRoom))
    classes = classes_res.scalars().all()

    if not teachers:
        raise HTTPException(
            status_code=400,
            detail="No teachers found in database"
        )

    if not rooms:
        raise HTTPException(
            status_code=400,
            detail="No rooms found in database"
        )

    if not subjects:
        raise HTTPException(
            status_code=400,
            detail="No subjects found in database"
        )

    if not classes:
        raise HTTPException(
            status_code=400,
            detail="No classes found in database"
        )

    await db.execute(
        models.TimetableVersion.__table__.update().values(
            is_active=False
        )
    )

    version = models.TimetableVersion(
        school_id=uuid_module.uuid4(),
        published_at=datetime.utcnow(),
        is_active=True,
        data_snapshot={}
    )

    db.add(version)

    await db.commit()
    await db.refresh(version)

    await db.execute(delete(models.TimetableSlot))
    await db.commit()

    slots_created = 0
    subject_idx = 0

    for class_idx, class_obj in enumerate(classes):
        room = rooms[class_idx % len(rooms)]
        teacher_idx = class_idx

        for day in range(5):
            for period in range(1, 7):
                teacher = teachers[teacher_idx % len(teachers)]
                subject = subjects[subject_idx % len(subjects)]

                slot = models.TimetableSlot(
                    timetable_version_id=version.id,
                    teacher_id=teacher.id,
                    class_id=class_obj.id,
                    room_id=room.id,
                    subject_id=subject.id,
                    day_of_week=day,
                    period=period
                )

                db.add(slot)

                slots_created += 1
                teacher_idx += 1
                subject_idx += 1

    await db.commit()

    return {
        "status": "success",
        "task_id": str(version.id),
        "version_id": str(version.id),
        "slots_created": slots_created
    }


# ─── Celery Timetable Generation ───────────────────────────────────────────────

@app.post(
    "/generate-timetable/",
    dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))]
)
async def trigger_timetable_generation(
    request: schemas.TimetableGenerateRequest
):
    task = generate_timetable_task.delay(
        str(request.school_id)
    )

    return {
        "task_id": task.id,
        "status": "pending"
    }