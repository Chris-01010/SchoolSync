import secrets
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .relief_router import router as relief_router
from .relief_dispatch import expire_overdue_assignments
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List, Optional
from uuid import UUID
from datetime import timedelta, datetime, timezone 
from pathlib import Path 
import time
import collections
import logging
import os 
from pydantic import BaseModel
from .email_service import send_verification_email, send_password_reset_email
from dotenv import load_dotenv
from sqlalchemy.orm import selectinload
from pathlib import Path
import os

print("DATABASE_URL:", os.getenv("DATABASE_URL"))
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")
from .database import engine, Base, get_db
from . import models
from . import schemas
from . import relief
from . import auth
from . import leave_api
from . import relief_router
from . import leave_balance_api
from .worker import generate_timetable_task

from .email_service import (
    send_verification_email,
    send_password_reset_email,
)

from .crud import router as master_router
from .leave_api import router as leaves_router
from .admin_dashboard import router as admin_dashboard_router
from .rooms import router as rooms_router
from .blockedslot import router as blocked_slots_router

async def _validate_slot_modification(user: models.User, teacher_id, db: AsyncSession):
    if user.role == models.UserRole.ADMIN:
        return
    if user.role == models.UserRole.HOD:
        hod_t = (await db.execute(select(models.Teacher).where(models.Teacher.user_id == user.id))).scalar_one_or_none()
        if not hod_t or not hod_t.department_id:
            raise HTTPException(status_code=403, detail="HOD has no department assigned")
        target = (await db.execute(select(models.Teacher).where(models.Teacher.id == teacher_id))).scalar_one_or_none()
        if not target:
            raise HTTPException(status_code=404, detail="Target teacher not found")
        if str(target.department_id) != str(hod_t.department_id):
            raise HTTPException(status_code=403, detail="HOD can only modify slots in their department")
        return
    raise HTTPException(status_code=403, detail="Not authorized to modify timetable")



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
_RATE_LIMIT_MAX    = 5
_login_attempts: dict[str, list[float]] = collections.defaultdict(list)

def _check_rate_limit(email: str) -> None:
    now = time.monotonic()
    _login_attempts[email] = [t for t in _login_attempts[email] if now - t < _RATE_LIMIT_WINDOW]
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
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─── Startup ───────────────────────────────────────────────────────────────────
_scheduler = AsyncIOScheduler()

# ─── Routers ───────────────────────────────────────────────────────────────────

app.include_router(master_router, prefix="/api/v1")
app.include_router(admin_dashboard_router, prefix="/api/v1")
app.include_router(rooms_router, prefix="/api/v1")
app.include_router(blocked_slots_router, prefix="/api/v1")
app.include_router(leave_api.router, prefix="/leaves", tags=["leaves"])
app.include_router(relief_router.router, prefix="/relief", tags=["relief"])
app.include_router(leave_balance_api.router, prefix="/leave-balance", tags=["leave-balance"])


@app.on_event("startup")
async def startup():
    # DB is managed by Supabase/Alembic — never call create_all on a live DB.
    # It tries to CREATE TYPE for every Enum, but they already exist in PG,
    # which causes a mid-connection crash on startup.
    logger.info("SchoolSync API started. Schema managed externally — skipping create_all.")
    async def _expiry_job():
        # Always open a FRESH session for each scheduled run — never reuse
        # a session across invocations. get_db() is an async generator that
        # yields one session and closes it on exit, so use it as a context.
        async for db in get_db():
            try:
                await expire_overdue_assignments(db)
            except Exception:
                logger.exception("Error in relief expiry job")
            finally:
                await db.close()

    _scheduler.add_job(_expiry_job, "interval", minutes=1, id="relief_expiry")
    _scheduler.start()

@app.on_event("shutdown")
async def shutdown():
    _scheduler.shutdown()


app.include_router(master_router, prefix="/api/v1")
app.include_router(admin_dashboard_router, prefix="/api/v1")
app.include_router(rooms_router, prefix="/api/v1") 
app.include_router(blocked_slots_router, prefix="/api/v1")  
app.include_router(leaves_router, prefix="/leaves")
app.include_router(relief_router.router, prefix="/relief")


@app.get("/api/v1/my/teacher-profile")
async def get_my_teacher_profile(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(404, detail="Teacher profile not found")
    return {"id": str(teacher.id), "name": teacher.name, "email": teacher.email, "department_id": str(teacher.department_id) if teacher.department_id else None}

@app.get("/")
async def root():
    return {"message": "SchoolSync API is running"}

# ─── JSON email login ──────────────────────────────────────────────────────────
@app.post("/api/auth/login", response_model=schemas.Token)
async def login_json(payload: EmailLoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    _check_rate_limit(payload.email)
    result = await db.execute(select(models.User).filter(models.User.email == payload.email))
    user = result.scalars().first()
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please check your inbox or request a new verification email.")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.college_id, "role": user.role},
        expires_delta=access_token_expires,
    )
    refresh_token = auth.create_refresh_token()
    user.refresh_token = refresh_token
    user.refresh_token_expires_at = datetime.utcnow() + timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    await db.commit()
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax", max_age=int(timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()))
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax", max_age=int(access_token_expires.total_seconds()))
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/refresh", response_model=schemas.Token)
async def refresh_access_token(request: Request, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing.")
    result = await db.execute(select(models.User).filter(models.User.refresh_token == refresh_token))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token.")
    if user.refresh_token_expires_at < datetime.utcnow():
        user.refresh_token = None
        user.refresh_token_expires_at = None
        await db.commit()
        raise HTTPException(status_code=401, detail="Refresh token expired. Please log in again.")
    new_access_token = auth.create_access_token({"sub": user.college_id, "role": user.role})
    logger.info(f"Access token refreshed for user {user.college_id}")
    return {"access_token": new_access_token, "token_type": "bearer"}

@app.post("/auth/logout")
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        result = await db.execute(select(models.User).filter(models.User.refresh_token == refresh_token))
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
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == form_data.username))
    user = result.scalars().first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified.")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": user.college_id, "role": user.role}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# ─── Social OAuth stubs ────────────────────────────────────────────────────────
@app.get("/api/auth/google")
async def social_google():
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Google OAuth is not yet configured.")

@app.get("/api/auth/microsoft")
async def social_microsoft():
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Microsoft OAuth is not yet configured.")

@app.get("/api/auth/apple")
async def social_apple():
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Apple OAuth is not yet configured.")

# ─── Signup ────────────────────────────────────────────────────────────────────
@app.post("/auth/signup", response_model=schemas.User)
async def signup(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.college_id == user.college_id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="College ID already registered")
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
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

        leave_balance = models.TeacherLeaveBalance(
            teacher_id=teacher_profile.id,
            academic_year=leave_balance_api.get_current_academic_year(),
            balance=2.0,
            used_ytd=0.0,
            carry_over=0.0,
            last_credited_month=None,
        )
        db.add(leave_balance)
        await db.commit()

    
    # Generate verification token and send email
    token = secrets.token_urlsafe(32)
    db_user.verification_token = token
    db_user.verification_token_expires_at = datetime.utcnow() + timedelta(hours=24)
    await db.commit()
    send_verification_email(db_user.email, db_user.college_id, token)
    return db_user

# ─── Email Verification ────────────────────────────────────────────────────────
@app.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.verification_token == token))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token.")
    # Guard against NULL expiry (would throw TypeError and strip CORS headers)
    if user.verification_token_expires_at is None or user.verification_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification token expired.")
    if user.is_verified:
        return {"message": "Email verified successfully. You can now log in."}
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    await db.commit()
    logger.info(f"Email verified for user {user.college_id}")
    return {"message": "Email verified successfully. You can now log in."}

@app.post("/auth/resend-verification")
async def resend_verification(email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == email))
    user = result.scalars().first()
    if not user:
        return {"message": "If that email exists, a verification link has been sent."}
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified.")
    token = secrets.token_urlsafe(32)
    user.verification_token = token
    user.verification_token_expires_at = datetime.utcnow() + timedelta(hours=24)
    await db.commit()
    send_verification_email(user.email, user.college_id, token)
    return {"message": "If that email exists, a verification link has been sent."}

# ─── Forgot Password ───────────────────────────────────────────────────────────
@app.post("/auth/forgot-password")
async def forgot_password(email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == email))
    user = result.scalars().first()
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
    await db.commit()
    send_password_reset_email(user.email, user.college_id, token)
    logger.info(f"Password reset requested for {user.email}")
    return {"message": "If that email exists, a reset link has been sent."}

@app.post("/auth/reset-password")
async def reset_password(token: str, new_password: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.reset_token == token))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token.")
    if user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token expired.")
    user.password_hash = auth.get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    await db.commit()
    logger.info(f"Password reset successful for {user.college_id}")
    return {"message": "Password reset successfully. You can now log in."}

@app.get("/auth/me", response_model=schemas.User)
async def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ─── Sync Timetable Generation ─────────────────────────────────────────────────
@app.post("/generate-timetable-sync/", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def generate_timetable_sync(db: AsyncSession = Depends(get_db)):
    import uuid as uuid_module
    from collections import defaultdict

    teachers = (await db.execute(select(models.Teacher))).scalars().all()
    rooms = (await db.execute(select(models.Room))).scalars().all()
    subjects = (await db.execute(select(models.Subject))).scalars().all()
    classes = (await db.execute(select(models.ClassRoom))).scalars().all()

    if not teachers:
        raise HTTPException(status_code=400, detail="No teachers found in database")
    if not rooms:
        raise HTTPException(status_code=400, detail="No rooms found in database")
    if not subjects:
        raise HTTPException(status_code=400, detail="No subjects found in database")
    if not classes:
        raise HTTPException(status_code=400, detail="No classes found in database")

    # Wipe previous timetable data first
    await db.execute(delete(models.ReliefAssignment))
    await db.execute(delete(models.TimetableSlot))
    await db.execute(delete(models.TimetableVersion))
    await db.commit()

    # Create the new active version
    version = models.TimetableVersion(
        id=str(uuid_module.uuid4()),
        is_active=True,
        published_at=datetime.utcnow(),
        data_snapshot={},
    )
    db.add(version)
    await db.flush()
    # All IDs as strings, no UUID/string mixing
    room_ids = [str(r.id) for r in rooms]
    teacher_by_id = {str(t.id): t for t in teachers}
    subject_ids = [str(s.id) for s in subjects]

    ts_rows = (await db.execute(select(models.TeacherSubject))).scalars().all()
    subject_to_teachers = defaultdict(list)
    for ts in ts_rows:
        subject_to_teachers[str(ts.subject_id)].append(str(ts.teacher_id))

    def is_blocked(teacher, day, period):
        blocked = getattr(teacher, "blocked_slots", None) or []
        for b in blocked:
            if isinstance(b, dict) and b.get("day") == day and b.get("period") == period:
                return True
            if isinstance(b, str) and b == f"{day}:{period}":
                return True
        return False

    DAYS, PERIODS = 5, 6
    teacher_busy = defaultdict(set)
    room_busy = defaultdict(set)
    teacher_load = defaultdict(int)

    planned = []
    skipped = []

    for class_obj in classes:
        class_subject_count = defaultdict(int)
        for day in range(DAYS):
            for period in range(1, PERIODS + 1):
                key = (day, period)
                subjects_sorted = sorted(subject_ids, key=lambda sid: class_subject_count[sid])
                assigned = False
                reason = "no_qualified_teacher"

                for sid in subjects_sorted:
                    qualified = subject_to_teachers.get(sid, [])
                    if not qualified:
                        continue
                    qualified_sorted = sorted(qualified, key=lambda tid: teacher_load[tid])

                    for tid in qualified_sorted:
                        if tid in teacher_busy[key]:
                            continue
                        teacher = teacher_by_id.get(tid)
                        if not teacher or not teacher.is_active:
                            continue
                        if is_blocked(teacher, day, period):
                            continue

                        chosen_rid = None
                        for rid in room_ids:
                            if rid not in room_busy[key]:
                                chosen_rid = rid
                                break

                        if chosen_rid is None:
                            reason = "no_room"
                            break

                        planned.append({
                            "id": str(uuid_module.uuid4()),
                            "version_id": str(version.id),
                            "teacher_id": tid,
                            "class_id": str(class_obj.id),
                            "room_id": chosen_rid,
                            "subject_id": sid,
                            "day": day,
                            "period": period,
                        })
                        teacher_busy[key].add(tid)
                        room_busy[key].add(chosen_rid)
                        teacher_load[tid] += 1
                        class_subject_count[sid] += 1
                        assigned = True
                        break

                    if assigned or reason == "no_room":
                        break

                if not assigned:
                    skipped.append({
                        "class_id": str(class_obj.id),
                        "day": day,
                        "period": period,
                        "reason": reason,
                    })

    # Pre-flight duplicate check — fail fast with clear error if the planner has a bug
    seen_room, seen_teacher, seen_class = set(), set(), set()
    for s in planned:
        rk = (s["room_id"], s["day"], s["period"])
        tk = (s["teacher_id"], s["day"], s["period"])
        ck = (s["class_id"], s["day"], s["period"])
        if rk in seen_room:
            raise HTTPException(status_code=500, detail=f"Planner bug: duplicate room slot {rk}")
        if tk in seen_teacher:
            raise HTTPException(status_code=500, detail=f"Planner bug: duplicate teacher slot {tk}")
        if ck in seen_class:
            raise HTTPException(status_code=500, detail=f"Planner bug: duplicate class slot {ck}")
        seen_room.add(rk)
        seen_teacher.add(tk)
        seen_class.add(ck)

    for s in planned:
        db.add(models.TimetableSlot(
            id=s["id"],
            timetable_version_id=s["version_id"],
            teacher_id=s["teacher_id"],
            class_id=s["class_id"],
            room_id=s["room_id"],
            subject_id=s["subject_id"],
            day_of_week=s["day"],
            period=s["period"],
        ))

    await db.commit()
    return {
        "version_id": str(version.id),
        "slots_created": len(planned),
        "skipped_count": len(skipped),
        "skipped": skipped[:20],
    }

# ─── Departments ───────────────────────────────────────────────────────────────
@app.post("/departments/", response_model=schemas.Department, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def create_department(dept: schemas.DepartmentCreate, db: AsyncSession = Depends(get_db)):
    db_dept = models.Department(**dept.dict())
    db.add(db_dept)
    await db.commit()
    await db.refresh(db_dept)
    return db_dept

@app.get("/departments/", response_model=List[schemas.Department])
async def list_departments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Department))
    return result.scalars().all()

# ─── Teachers ──────────────────────────────────────────────────────────────────
@app.post("/teachers/", response_model=schemas.Teacher, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN, models.UserRole.HOD]))])
async def create_teacher(teacher: schemas.TeacherCreate, db: AsyncSession = Depends(get_db)):
    user_result = await db.execute(select(models.User).where(models.User.id == teacher.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    teacher_check = await db.execute(select(models.Teacher).where(models.Teacher.user_id == teacher.user_id))
    if teacher_check.scalars().first():
        raise HTTPException(status_code=400, detail="User is already linked to a teacher profile")
    db_teacher = models.Teacher(**teacher.dict())
    db.add(db_teacher)
    await db.commit()
    await db.refresh(db_teacher)
    return db_teacher

@app.get("/teachers/", response_model=List[schemas.Teacher])
async def list_teachers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Teacher))
    return result.scalars().all()

@app.get("/api/v1/teachers/me")
async def get_my_teacher_profile(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return {
        "id": str(teacher.id),
        "name": teacher.name,
        "email": teacher.email,
        "department_id": str(teacher.department_id) if teacher.department_id else None,
        "weekly_relief_cap": teacher.weekly_relief_cap,
        "current_relief_hours": teacher.current_relief_hours,
        "total_hours_worked": teacher.total_hours_worked,
        "is_active": teacher.is_active,
    }

# ─── Teacher Dashboard ─────────────────────────────────────────────────────────
@app.get("/teachers/me/dashboard", response_model=schemas.DashboardSummary, dependencies=[Depends(auth.check_role([models.UserRole.TEACHER, models.UserRole.HOD]))])
async def get_teacher_dashboard(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    relief_result = await db.execute(
        select(models.ReliefAssignment)
        .where(models.ReliefAssignment.relief_teacher_id == teacher.id, models.ReliefAssignment.status == models.ReliefStatus.PENDING)
    )
    pending_requests = relief_result.scalars().all()
    return {
        "timetable": [],
        "relief_duties": [],
        "total_hours": teacher.total_hours_worked,
        "relief_hours": teacher.current_relief_hours,
        "pending_requests": []
    }

# ─── Timetable Management ──────────────────────────────────────────────────────
@app.get("/timetable/versions", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def list_timetable_versions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TimetableVersion).order_by(models.TimetableVersion.published_at.desc()))
    return result.scalars().all()

# ─── Approve Leave ─────────────────────────────────────────────────────────────
@app.put("/absences/{absence_id}/approve", response_model=schemas.AbsenceOut, dependencies=[Depends(auth.check_role([models.UserRole.HOD]))])
async def approve_leave(
    absence_id: UUID,
    approval: schemas.AbsenceDecision,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Absence).where(models.Absence.id == absence_id))
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found")
    if absence.status != models.AbsenceStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Cannot update a leave that is already {absence.status}.")
    absence.status = approval.status
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.id == absence.teacher_id))
    teacher = teacher_result.scalar_one_or_none()
    if teacher:
        if approval.status == models.AbsenceStatus.APPROVED:
            title = "Leave Request Approved"
            content = f"Your leave on {absence.date} has been approved."
        else:
            title = "Leave Request Rejected"
            content = f"Your leave on {absence.date} has been rejected."
        db.add(models.Notification(user_id=teacher.user_id, title=title, content=content, is_read=False))
    await db.commit()
    await db.refresh(absence)
    return absence

# ─── Relief Assignment Response ────────────────────────────────────────────────
@app.put("/relief-assignments/{assignment_id}/respond", response_model=schemas.ReliefAssignmentBase, dependencies=[Depends(auth.check_role([models.UserRole.TEACHER, models.UserRole.HOD]))])
async def respond_to_relief(
    assignment_id: UUID,
    response: schemas.ReliefResponse,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    result = await db.execute(select(models.ReliefAssignment).where(models.ReliefAssignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Relief assignment not found")
    if assignment.relief_teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Not authorized to respond to this assignment")
    if response.status == models.ReliefStatus.FLAGGED:
        raise HTTPException(
            status_code=403,
            detail="Teachers cannot flag relief requests."
        )
    assignment.status = response.status
    if response.status == models.ReliefStatus.ACCEPTED:
        assignment.acknowledged_at = datetime.utcnow()
    await db.commit()
    await db.refresh(assignment)
    return assignment

# ─── Timetable Slots CRUD ──────────────────────────────────────────────────────
@app.get("/timetable/slots/admin-all", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def list_timetable_slots_admin(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TimetableSlot))
    return result.scalars().all()

@app.get("/timetable/slots")
async def get_timetable_slots(db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    result = await db.execute(select(models.TimetableVersion).filter(models.TimetableVersion.is_active == True))
    active_version = result.scalars().first()
    if not active_version:
        return []
    result = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.timetable_version_id == active_version.id))
    slots = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "teacher_id": str(s.teacher_id),
            "class_id": str(s.class_id),
            "subject_id": str(s.subject_id),
            "room_id": str(s.room_id),
            "day_of_week": s.day_of_week,
            "period": s.period,
            "is_relief": s.is_relief,
            "timetable_version_id": str(s.timetable_version_id),
        }
        for s in slots
    ]

@app.get("/timetable/view")
async def get_timetable_view(scope: str, scope_id: UUID, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role == models.UserRole.TEACHER:
        teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
        teacher = teacher_result.scalar_one_or_none()
        if not teacher or (scope == "teacher" and teacher.id != scope_id):
            raise HTTPException(status_code=403, detail="Teachers can only view their own timetable")
    query = select(models.TimetableSlot).join(models.TimetableVersion).where(models.TimetableVersion.is_active == True)
    if scope == "teacher":
        query = query.where(models.TimetableSlot.teacher_id == scope_id)
    elif scope == "class":
        query = query.where(models.TimetableSlot.class_id == scope_id)
    elif scope == "room":
        query = query.where(models.TimetableSlot.room_id == scope_id)
    else:
        raise HTTPException(status_code=400, detail="scope must be 'teacher', 'class', or 'room'")
    result = await db.execute(query)
    slots = result.scalars().all()
    grouped = {}
    for slot in slots:
        day = slot.day_of_week
        if day not in grouped:
            grouped[day] = []
        grouped[day].append(slot)
    return {"scope": scope, "scope_id": str(scope_id), "timetable": grouped}

@app.post("/timetable/slots", response_model=schemas.TimetableSlot, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def create_timetable_slot(slot: schemas.TimetableSlotCreate, db: AsyncSession = Depends(get_db)):
    db_slot = models.TimetableSlot(**slot.dict())
    db.add(db_slot)
    try:
        await db.commit()
        await db.refresh(db_slot)
        return db_slot
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Scheduling conflict: teacher, room or class already booked at this slot")

@app.delete("/timetable/slots/{slot_id}", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def delete_timetable_slot(slot_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TimetableSlot).where(models.TimetableSlot.id == slot_id))
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    await db.delete(slot)
    await db.commit()
    return {"status": "deleted"}

@app.post("/generate-timetable/", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def trigger_timetable_generation(request: schemas.TimetableGenerateRequest):
    task = generate_timetable_task.delay(str(request.school_id))
    return {"task_id": task.id, "status": "pending"}

@app.post("/timetable/versions/{version_id}/activate")
async def activate_timetable_version(version_id: str, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    all_versions = await db.execute(select(models.TimetableVersion))
    for v in all_versions.scalars().all():
        v.is_active = False
    result = await db.execute(select(models.TimetableVersion).filter(models.TimetableVersion.id == version_id))
    version = result.scalars().first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    version.is_active = True
    await db.commit()
    return {"status": "success"}

@app.get("/timetable/versions")
async def get_timetable_versions(db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    result = await db.execute(select(models.TimetableVersion).order_by(models.TimetableVersion.published_at.desc()))
    versions = result.scalars().all()
    return [{"id": str(v.id), "is_active": v.is_active, "published_at": str(v.published_at)} for v in versions]

@app.get("/timetable/meta")
async def get_timetable_meta(db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    teachers = (await db.execute(select(models.Teacher).filter(models.Teacher.is_active == True))).scalars().all()
    classes = (await db.execute(select(models.ClassRoom))).scalars().all()
    rooms = (await db.execute(select(models.Room))).scalars().all()
    subjects = (await db.execute(select(models.Subject))).scalars().all()
    return {
        "teachers": [{"id": str(t.id), "name": t.name, "department_id": str(t.department_id) if t.department_id else None} for t in teachers],
        "classes": [{"id": str(c.id), "name": c.name} for c in classes],
        "rooms": [{"id": str(r.id), "name": r.name} for r in rooms],
        "subjects": [{"id": str(s.id), "name": s.name} for s in subjects],
    }

# ─── Timetable Slot Models ─────────────────────────────────────────────────────
class TimetableSlotCreate(BaseModel):
    teacher_id: str
    class_id: str
    room_id: str
    subject_id: str
    day_of_week: int
    period: int
    timetable_version_id: Optional[str] = None

class TimetableSlotUpdate(BaseModel):
    teacher_id: Optional[str] = None
    class_id: Optional[str] = None
    room_id: Optional[str] = None
    subject_id: Optional[str] = None
    day_of_week: Optional[int] = None
    period: Optional[int] = None

@app.post("/timetable/slots/assign")
async def assign_timetable_slot(payload: TimetableSlotCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    await _validate_slot_modification(current_user, payload.teacher_id, db)
    day = payload.day_of_week
    period = payload.period
    version_id = payload.timetable_version_id
    if not version_id:
        result = await db.execute(select(models.TimetableVersion).filter(models.TimetableVersion.is_active == True))
        active = result.scalars().first()
        if not active:
            raise HTTPException(status_code=400, detail="No active timetable version found")
        version_id = str(active.id)
    teacher_conflict = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.teacher_id == payload.teacher_id, models.TimetableSlot.day_of_week == day, models.TimetableSlot.period == period))
    if teacher_conflict.scalars().first():
        raise HTTPException(status_code=409, detail="Teacher is already assigned to another class at this time")
    room_conflict = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.room_id == payload.room_id, models.TimetableSlot.day_of_week == day, models.TimetableSlot.period == period))
    if room_conflict.scalars().first():
        raise HTTPException(status_code=409, detail="Room is already booked at this time")
    class_conflict = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.class_id == payload.class_id, models.TimetableSlot.day_of_week == day, models.TimetableSlot.period == period))
    if class_conflict.scalars().first():
        raise HTTPException(status_code=409, detail="This class already has a slot at this time")
    import uuid as uuid_module
    slot = models.TimetableSlot(
        id=str(uuid_module.uuid4()),
        timetable_version_id=version_id,
        teacher_id=payload.teacher_id,
        class_id=payload.class_id,
        room_id=payload.room_id,
        subject_id=payload.subject_id,
        day_of_week=day,
        period=period,
        is_relief=False
    )
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return {"status": "success", "slot_id": str(slot.id)}

@app.put("/timetable/slots/{slot_id}")
async def update_timetable_slot(slot_id: str, payload: TimetableSlotUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    result = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.id == slot_id))
    slot = result.scalars().first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    await _validate_slot_modification(current_user, str(slot.teacher_id), db)
    if payload.teacher_id and str(payload.teacher_id) != str(slot.teacher_id):
        await _validate_slot_modification(current_user, payload.teacher_id, db)
    new_day = payload.day_of_week if payload.day_of_week is not None else slot.day_of_week
    new_period = payload.period if payload.period is not None else slot.period
    new_teacher = payload.teacher_id or str(slot.teacher_id)
    new_room = payload.room_id or str(slot.room_id)
    new_class = payload.class_id or str(slot.class_id)
    teacher_conflict = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.teacher_id == new_teacher, models.TimetableSlot.day_of_week == new_day, models.TimetableSlot.period == new_period, models.TimetableSlot.id != slot_id))
    if teacher_conflict.scalars().first():
        raise HTTPException(status_code=409, detail="Teacher is already assigned to another class at this time")
    room_conflict = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.room_id == new_room, models.TimetableSlot.day_of_week == new_day, models.TimetableSlot.period == new_period, models.TimetableSlot.id != slot_id))
    if room_conflict.scalars().first():
        raise HTTPException(status_code=409, detail="Room is already booked at this time")
    class_conflict = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.class_id == new_class, models.TimetableSlot.day_of_week == new_day, models.TimetableSlot.period == new_period, models.TimetableSlot.id != slot_id))
    if class_conflict.scalars().first():
        raise HTTPException(status_code=409, detail="This class already has a slot at this time")
    if payload.teacher_id:
        slot.teacher_id = payload.teacher_id
    if payload.class_id:
        slot.class_id = payload.class_id
    if payload.room_id:
        slot.room_id = payload.room_id
    if payload.subject_id:
        slot.subject_id = payload.subject_id
    if payload.day_of_week is not None:
        slot.day_of_week = payload.day_of_week
    if payload.period is not None:
        slot.period = payload.period
    await db.commit()
    return {"status": "success", "slot_id": slot_id}

@app.delete("/timetable/slots/{slot_id}")
async def delete_timetable_slot_by_id(slot_id: str, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    result = await db.execute(select(models.TimetableSlot).filter(models.TimetableSlot.id == slot_id))
    slot = result.scalars().first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    await _validate_slot_modification(current_user, str(slot.teacher_id), db)
    await db.delete(slot)
    await db.commit()
    return {"status": "success", "message": "Slot deleted"}

@app.get("/timetable/available")
async def get_available_resources(
    day: int,
    period: int,
    subject_id: str = None,
    exclude_slot_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = select(models.TimetableSlot).filter(models.TimetableSlot.day_of_week == day, models.TimetableSlot.period == period)
    if exclude_slot_id:
        query = query.filter(models.TimetableSlot.id != exclude_slot_id)
    booked = (await db.execute(query)).scalars().all()
    booked_teacher_ids = {str(s.teacher_id) for s in booked}
    booked_room_ids = {str(s.room_id) for s in booked}
    booked_class_ids = {str(s.class_id) for s in booked}
    all_teachers = (await db.execute(select(models.Teacher).filter(models.Teacher.is_active == True))).scalars().all()
    all_rooms = (await db.execute(select(models.Room))).scalars().all()
    all_classes = (await db.execute(select(models.ClassRoom))).scalars().all()
    all_subjects = (await db.execute(select(models.Subject))).scalars().all()
    qualified_ids = set()
    if subject_id:
        mappings = (await db.execute(select(models.TeacherSubject).filter(models.TeacherSubject.subject_id == subject_id))).scalars().all()
        for m in mappings:
            qualified_ids.add(str(m.teacher_id))
    teachers_out = []
    for t in all_teachers:
        tid = str(t.id)
        available = tid not in booked_teacher_ids
        group = "qualified" if (subject_id and tid in qualified_ids) else "other" if subject_id else "all"
        teachers_out.append({"id": tid, "name": t.name, "available": available, "group": group})
    group_order = {"qualified": 0, "other": 1, "all": 0}
    teachers_out.sort(key=lambda t: (group_order[t["group"]], not t["available"]))
    return {
        "teachers": teachers_out,
        "rooms": [{"id": str(r.id), "name": r.name, "available": str(r.id) not in booked_room_ids} for r in all_rooms],
        "classes": [{"id": str(c.id), "name": c.name, "available": str(c.id) not in booked_class_ids} for c in all_classes],
        "subjects": [{"id": str(s.id), "name": s.name, "available": True} for s in all_subjects],
    }

# ─── Teacher-Subject Mapping ──────────────────────────────────────────────────
class TeacherSubjectAssign(BaseModel):
    subject_id: str
    is_primary: Optional[bool] = True

@app.post("/teachers/{teacher_id}/subjects")
async def assign_subject_to_teacher(teacher_id: str, payload: TeacherSubjectAssign, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    import uuid as uuid_module
    existing = await db.execute(select(models.TeacherSubject).filter(models.TeacherSubject.teacher_id == teacher_id, models.TeacherSubject.subject_id == payload.subject_id))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Mapping already exists")
    mapping = models.TeacherSubject(id=str(uuid_module.uuid4()), teacher_id=teacher_id, subject_id=payload.subject_id)
    db.add(mapping)
    await db.commit()
    return {"status": "success"}

@app.get("/teachers/{teacher_id}/subjects")
async def get_teacher_subjects(teacher_id: str, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    result = await db.execute(select(models.TeacherSubject).filter(models.TeacherSubject.teacher_id == teacher_id))
    mappings = result.scalars().all()
    return [{"subject_id": str(m.subject_id)} for m in mappings]

@app.delete("/teachers/{teacher_id}/subjects/{subject_id}")
async def remove_subject_from_teacher(teacher_id: str, subject_id: str, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    result = await db.execute(select(models.TeacherSubject).filter(models.TeacherSubject.teacher_id == teacher_id, models.TeacherSubject.subject_id == subject_id))
    mapping = result.scalars().first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping not found")
    await db.delete(mapping)
    await db.commit()
    return {"status": "success"}


@app.get("/hod/profile")    
async def get_hod_profile(
    current_user: models.User = Depends(auth.check_role([models.UserRole.HOD])   # ← ensure HOD role is allowed
    ),
    db: AsyncSession = Depends(get_db),
):
    # Fetch the Teacher row linked to this user (has name, email, department)
    result = await db.execute(
        select(models.Teacher)
        .options(selectinload(models.Teacher.dept_link))
        .where(models.Teacher.user_id == current_user.id)
    )
    teacher = result.scalar_one_or_none()

    if not teacher:
        raise HTTPException(status_code=404, detail="HOD profile not found")

    return {
        "name":         teacher.name,
        "employee_id":  str(current_user.college_id),   # college_id is the employee ID
        "email":        teacher.email,
        "department":   teacher.dept_link.name if teacher.dept_link else None,
        "role":         current_user.role.value,         # "hod"
        "joining_date": current_user.created_at.date().isoformat() if current_user.created_at else None,
    }