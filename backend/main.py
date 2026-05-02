import secrets
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from datetime import timedelta, datetime
import time
import collections
import logging
from pydantic import BaseModel
from .email_service import send_verification_email, send_password_reset_email

from backend.database import engine, Base, get_db
from backend import models, schemas, relief, auth
from backend.worker import generate_timetable_task
from backend import leave_api

from backend.crud import router as master_router
from backend.admin_dashboard import router as admin_dashboard_router
from backend.rooms import router as rooms_router


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
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───────────────────────────────────────────────────────────────────
app.include_router(master_router, prefix="/api/v1")
app.include_router(admin_dashboard_router, prefix="/api/v1")
app.include_router(rooms_router, prefix="/api/v1")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "SchoolSync API is running"}

# ─── JSON email login (used by frontend LoginPage) ─────────────────────────────
@app.post("/api/auth/login", response_model=schemas.Token)
async def login_json(payload: EmailLoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    _check_rate_limit(payload.email)
    result = await db.execute(select(models.User).filter(models.User.email == payload.email))
    user = result.scalars().first()
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please check your inbox or request a new verification email."
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.college_id, "role": user.role}, expires_delta=access_token_expires
    )
    response.set_cookie(
        key="access_token", value=access_token, httponly=True,
        samesite="lax", max_age=int(access_token_expires.total_seconds())
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ─── Token refresh ─────────────────────────────────────────────────────────────
@app.post("/auth/refresh", response_model=schemas.Token)
async def refresh_access_token(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Takes the refresh token from the HttpOnly cookie,
    validates it, and returns a new access token.
    """
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing.")

    result = await db.execute(
        select(models.User).filter(models.User.refresh_token == refresh_token)
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token.")

    if user.refresh_token_expires_at < datetime.utcnow():
        user.refresh_token = None
        user.refresh_token_expires_at = None
        await db.commit()
        raise HTTPException(status_code=401, detail="Refresh token expired. Please log in again.")

    new_access_token = auth.create_access_token({
        "sub": user.college_id,
        "role": user.role
    })

    logger.info(f"Access token refreshed for user {user.college_id}")
    return {"access_token": new_access_token, "token_type": "bearer"}

# ─── Logout ────────────────────────────────────────────────────────────────────
@app.post("/auth/logout")
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Invalidate refresh token on logout."""
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        result = await db.execute(
            select(models.User).filter(models.User.refresh_token == refresh_token)
        )
        user = result.scalars().first()
        if user:
            user.refresh_token = None
            user.refresh_token_expires_at = None
            await db.commit()

    response.delete_cookie("refresh_token")
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully."}

# ─── Form login (used by Postman / OAuth2 standard) ───────────────────────────
@app.post("/auth/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == form_data.username))
    user = result.scalars().first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
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
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.college_id, "role": user.role}, expires_delta=access_token_expires
    )
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

    token = secrets.token_urlsafe(32)
    db_user.verification_token = token
    db_user.verification_token_expires_at = datetime.utcnow() + timedelta(hours=24)
    db_user.is_verified = True   # ← local dev: skip email verification gate
    await db.commit()
    try:
        send_verification_email(db_user.email, db_user.college_id, token)
    except Exception:
        pass  # don't crash if email fails locally
    return db_user

# ─── Email Verification ────────────────────────────────────────────────────────
@app.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.User).filter(models.User.verification_token == token)
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token.")

    if user.verification_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification token expired. Please request a new one.")

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
    result = await db.execute(
        select(models.User).filter(models.User.reset_token == token)
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    if user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token expired. Please request a new one.")

    user.password_hash = auth.get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    await db.commit()

    logger.info(f"Password reset successful for {user.college_id}")
    return {"message": "Password reset successfully. You can now log in."}

@app.get("/auth/me", response_model=schemas.User)
async def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ─── Users (Admin Only) ────────────────────────────────────────────────────────
@app.post("/users/", response_model=schemas.User, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(
        college_id=user.college_id, email=user.email,
        password_hash=auth.get_password_hash(user.password), role=user.role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

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
    pending_reliefs = relief_result.scalars().all()
    slots_result = await db.execute(
        select(models.TimetableSlot).join(models.TimetableVersion)
        .where(models.TimetableSlot.teacher_id == teacher.id, models.TimetableVersion.is_active == True)
    )
    slots = slots_result.scalars().all()
    timetable_data = [{"day": s.day_of_week, "period": s.period, "subject": "Class Session", "class": "Grade X", "room": "Room Y"} for s in slots]
    pending_requests = [{"id": str(r.id), "type": "relief_request", "message": "New relief duty assigned", "date": r.assigned_at.isoformat() if r.assigned_at else ""} for r in pending_reliefs]
    absence_result = await db.execute(select(models.Absence).where(models.Absence.teacher_id == teacher.id))
    for a in absence_result.scalars().all():
        if a.status == models.AbsenceStatus.PENDING:
            pending_requests.append({"id": str(a.id), "type": "leave_application", "message": f"Leave application ({a.leave_type}) pending approval", "date": a.date.isoformat()})
    return {
        "timetable": timetable_data or [{"day": 0, "period": 1, "subject": "Maths", "class": "Grade 10A", "room": "201"}],
        "relief_duties": [], "total_hours": teacher.total_hours_worked,
        "relief_hours": teacher.current_relief_hours, "pending_requests": pending_requests
    }

# ─── Timetable Management ──────────────────────────────────────────────────────
@app.get("/timetable/versions", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def list_timetable_versions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TimetableVersion).order_by(models.TimetableVersion.published_at.desc()))
    return result.scalars().all()

@app.post("/timetable/versions/{version_id}/activate", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def activate_timetable_version(version_id: UUID, db: AsyncSession = Depends(get_db)):
    await db.execute(models.TimetableVersion.__table__.update().values(is_active=False))
    result = await db.execute(select(models.TimetableVersion).where(models.TimetableVersion.id == version_id))
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    version.is_active = True
    await db.commit()
    return {"status": "success", "message": "Timetable version activated"}

# ─── Admin Operations ──────────────────────────────────────────────────────────
@app.get("/admin/stats", response_model=schemas.AdminDashboardStats, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    from datetime import date
    today = date.today()
    active_abs_res = await db.execute(select(func.count(models.Absence.id)).where(models.Absence.date == today, models.Absence.status != models.AbsenceStatus.REJECTED, models.Absence.resolved == False))
    active_absences = active_abs_res.scalar() or 0
    relief_today_res = await db.execute(select(func.count(models.ReliefAssignment.id)).where(func.date(models.ReliefAssignment.assigned_at) == today))
    relief_today = relief_today_res.scalar() or 0
    staff_count_res = await db.execute(select(func.count(models.Teacher.id)))
    total_staff = staff_count_res.scalar() or 0
    flagged_res = await db.execute(select(func.count(models.ReliefAssignment.id)).where(models.ReliefAssignment.status == models.ReliefStatus.FLAGGED))
    flagged_issues = flagged_res.scalar() or 0
    return {"active_absences": active_absences, "relief_assigned_today": relief_today, "coverage_rate": 98.0, "staff_present_count": total_staff - active_absences, "total_staff_count": total_staff, "flagged_issues_count": flagged_issues, "pending_timetable_tasks": 0}

@app.get("/admin/relief/active", response_model=List[schemas.ReliefAssignmentBase], dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def get_active_reliefs(db: AsyncSession = Depends(get_db)):
    from datetime import date
    today = date.today()
    result = await db.execute(select(models.ReliefAssignment).join(models.Absence).where(models.Absence.date == today))
    return result.scalars().all()

@app.get("/admin/relief/flagged", response_model=List[schemas.ReliefAssignmentBase], dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def get_flagged_reliefs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ReliefAssignment).where(models.ReliefAssignment.status == models.ReliefStatus.FLAGGED))
    return result.scalars().all()

@app.put("/teachers/{teacher_id}", response_model=schemas.Teacher, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def update_teacher(teacher_id: UUID, teacher_update: schemas.TeacherUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Teacher).where(models.Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    for key, value in teacher_update.dict(exclude_unset=True).items():
        setattr(teacher, key, value)
    await db.commit()
    await db.refresh(teacher)
    return teacher

@app.get("/admin/settings", response_model=schemas.SystemSettings, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def get_system_settings():
    return {"max_weekly_hours_default": 30, "weekly_relief_cap_default": 3, "fairness_balance_factor": 0.5, "allow_hod_auto_approval": True}

@app.put("/admin/settings", response_model=schemas.SystemSettings, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def update_system_settings(settings: schemas.SystemSettings):
    return settings

# ─── HOD Operations ────────────────────────────────────────────────────────────
@app.get("/hod/dashboard", response_model=schemas.HODDashboardSummary, dependencies=[Depends(auth.check_role([models.UserRole.HOD]))])
async def get_hod_dashboard(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    hod = teacher_result.scalar_one_or_none()
    if not hod or not hod.department_id:
        raise HTTPException(status_code=404, detail="HOD department not found")
    dept_result = await db.execute(select(models.Department).where(models.Department.id == hod.department_id))
    dept = dept_result.scalar_one_or_none()
    staff_count_result = await db.execute(select(func.count(models.Teacher.id)).where(models.Teacher.department_id == hod.department_id))
    staff_count = staff_count_result.scalar()
    pending_leaves_result = await db.execute(select(func.count(models.Absence.id)).join(models.Teacher).where(models.Teacher.department_id == hod.department_id, models.Absence.status == models.AbsenceStatus.PENDING))
    pending_count = pending_leaves_result.scalar()
    active_absences_result = await db.execute(select(func.count(models.Absence.id)).join(models.Teacher).where(models.Teacher.department_id == hod.department_id, models.Absence.status == models.AbsenceStatus.APPROVED, models.Absence.resolved == False))
    active_count = active_absences_result.scalar()
    return {"department_name": dept.name if dept else "Unknown", "active_absences": active_count, "coverage_rate": 95.5, "total_staff": staff_count, "pending_approvals_count": pending_count}

@app.get("/hod/leaves/pending", response_model=List[schemas.Absence], dependencies=[Depends(auth.check_role([models.UserRole.HOD]))])
async def get_pending_department_leaves(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    hod = teacher_result.scalar_one_or_none()
    if not hod or not hod.department_id:
        raise HTTPException(status_code=404, detail="HOD department not found")
    result = await db.execute(select(models.Absence).join(models.Teacher).where(models.Teacher.department_id == hod.department_id, models.Absence.status == models.AbsenceStatus.PENDING))
    return result.scalars().all()

# ─── Absence & Relief ──────────────────────────────────────────────────────────
@app.get(
    "/absences/my",
    response_model=List[schemas.AbsenceOut],
    dependencies=[Depends(auth.check_role([models.UserRole.TEACHER, models.UserRole.HOD]))]
)
async def get_my_absences(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    result = await db.execute(
        select(models.Absence)
        .where(models.Absence.teacher_id == teacher.id)
        .order_by(models.Absence.date.desc())
    )
    return result.scalars().all()

@app.post(
    "/absences/",
    response_model=schemas.AbsenceOut,
    dependencies=[Depends(auth.check_role([models.UserRole.TEACHER, models.UserRole.HOD]))]
)
async def mark_absence(
    absence: schemas.AbsenceCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    overlap_result = await db.execute(
        select(models.Absence).where(
            models.Absence.teacher_id == teacher.id,
            models.Absence.date == absence.date,
            models.Absence.status != models.AbsenceStatus.REJECTED
        )
    )
    if overlap_result.scalars().first():
        raise HTTPException(
            status_code=409,
            detail="You already have a leave request for this date."
        )

    db_absence = models.Absence(
        teacher_id=teacher.id,
        date=absence.date,
        period_start=absence.period_start,
        period_end=absence.period_end,
        leave_type=absence.leave_type,
        reason=absence.reason,
        handover_url=absence.handover_url,
        status=models.AbsenceStatus.PENDING,
        resolved=False,
    )
    db.add(db_absence)
    await db.flush()

    db.add(models.Notification(
        user_id=current_user.id,
        title="Leave Request Submitted",
        content=f"Your {absence.leave_type} leave on {absence.date} is pending HOD approval."
    ))

    if teacher.department_id:
        dept_result = await db.execute(
            select(models.Department).where(models.Department.id == teacher.department_id)
        )
        dept = dept_result.scalar_one_or_none()
        if dept and dept.hod_id:
            hod_teacher_result = await db.execute(
                select(models.Teacher).where(models.Teacher.id == dept.hod_id)
            )
            hod_teacher = hod_teacher_result.scalar_one_or_none()
            if hod_teacher:
                db.add(models.Notification(
                    user_id=hod_teacher.user_id,
                    title="New Leave Request",
                    content=f"{teacher.name} has applied for {absence.leave_type} leave on {absence.date}."
                ))

    await db.commit()
    await db.refresh(db_absence)
    return db_absence

@app.put(
    "/absences/{absence_id}/approve",
    response_model=schemas.AbsenceOut,
    dependencies=[Depends(auth.check_role([models.UserRole.HOD]))]
)
async def approve_leave(
    absence_id: UUID,
    approval: schemas.AbsenceDecision,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.Absence).where(models.Absence.id == absence_id)
    )
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found")

    if absence.status != models.AbsenceStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update a leave that is already {absence.status}."
        )

    absence.status = approval.status

    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    teacher = teacher_result.scalar_one_or_none()
    if teacher:
        if approval.status == models.AbsenceStatus.APPROVED:
            title = "Leave Request Approved"
            content = f"Your leave on {absence.date} has been approved."
        else:
            title = "Leave Request Rejected"
            content = f"Your leave on {absence.date} has been rejected."

        db.add(models.Notification(
            user_id=teacher.user_id,
            title=title,
            content=content,
            is_read=False,
        ))

    await db.commit()
    await db.refresh(absence)
    return absence

@app.put("/relief-assignments/{assignment_id}/respond", response_model=schemas.ReliefAssignmentBase, dependencies=[Depends(auth.check_role([models.UserRole.TEACHER, models.UserRole.HOD]))])
async def respond_to_relief(assignment_id: UUID, response: schemas.ReliefResponse, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
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
    assignment.status = response.status
    if response.status == models.ReliefStatus.FLAGGED:
        assignment.flag_reason = response.flag_reason
    elif response.status == models.ReliefStatus.ACCEPTED:
        assignment.acknowledged_at = datetime.utcnow()
    await db.commit()
    await db.refresh(assignment)
    return assignment

# ─── Timetable Slots CRUD ──────────────────────────────────────────────────────
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

@app.get("/timetable/slots", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def list_timetable_slots(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TimetableSlot))
    return result.scalars().all()

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

@app.put("/timetable/slots/{slot_id}", response_model=schemas.TimetableSlot, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def update_timetable_slot(slot_id: UUID, slot_update: schemas.TimetableSlotCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TimetableSlot).where(models.TimetableSlot.id == slot_id))
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    for key, value in slot_update.dict(exclude_unset=True).items():
        setattr(slot, key, value)
    await db.commit()
    await db.refresh(slot)
    return slot

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
app.include_router(leave_api.router, prefix="/leaves", tags=["leaves"])