
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status, Request, Response

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from typing import List, Optional
from uuid import UUID
from datetime import timedelta, datetime
import time
import collections

from typing import List
from uuid import UUID
from datetime import timedelta
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857

from database import engine, Base, get_db
import models
import schemas
import relief
import auth
from worker import generate_timetable_task

from pydantic import BaseModel, EmailStr

app = FastAPI(title="SchoolSync API", version="1.0.0")

# ─── In-memory rate limiter: max 5 attempts per email per 15 minutes ─────────
_RATE_LIMIT_WINDOW = 15 * 60   # seconds
_RATE_LIMIT_MAX    = 5
_login_attempts: dict[str, list[float]] = collections.defaultdict(list)

def _check_rate_limit(email: str) -> None:
    """Raise HTTP 429 if the email has exceeded the login attempt threshold."""
    now = time.monotonic()
    attempts = _login_attempts[email]
    # Prune old entries outside the window
    _login_attempts[email] = [t for t in attempts if now - t < _RATE_LIMIT_WINDOW]
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


# ─── Pydantic model for JSON login body ──────────────────────────────────────
class EmailLoginRequest(BaseModel):
    email: str
    password: str

=======
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

app = FastAPI(title="SchoolSync API", version="1.0.0")

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "SchoolSync API is running"}



# ─── NEW: JSON-body email login (SecureAuth design) ───────────────────────────
@app.post("/api/auth/login", response_model=schemas.Token)
async def login_json(
    payload: EmailLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Email + password login. Sets an HttpOnly cookie and returns the token."""
    _check_rate_limit(payload.email)

    result = await db.execute(
        select(models.User).filter(models.User.email == payload.email)
    )
    user = result.scalars().first()

    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.college_id, "role": user.role},
        expires_delta=access_token_expires,
    )

    # Set HttpOnly cookie (SameSite=Lax for local dev; use Strict + Secure in prod)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=int(access_token_expires.total_seconds()),
    )

    return {"access_token": access_token, "token_type": "bearer"}


# ─── Social OAuth stubs ───────────────────────────────────────────────────────
@app.get("/api/auth/google")
async def social_google():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth is not yet configured. Please use email/password login.",
    )

@app.get("/api/auth/microsoft")
async def social_microsoft():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Microsoft OAuth is not yet configured. Please use email/password login.",
    )

@app.get("/api/auth/apple")
async def social_apple():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth is not yet configured. Please use email/password login.",
    )

=======
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# --- Authentication ---
@app.post("/auth/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.college_id == form_data.username))
    user = result.scalars().first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect college ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.college_id, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/signup", response_model=schemas.User)
async def signup(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if college_id already exists
    result = await db.execute(select(models.User).filter(models.User.college_id == user.college_id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="College ID already registered")
    
    # Check if email already exists
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

    # Automatically create teacher profile if role is teacher
    if db_user.role == models.UserRole.TEACHER:
        teacher_profile = models.Teacher(
            user_id=db_user.id,
            name=db_user.college_id, # Default name to ID
            email=db_user.email,
            current_relief_hours=0,
            total_hours_worked=0,
            is_active=True
        )
        db.add(teacher_profile)
        await db.commit()
        
    return db_user

@app.get("/auth/me", response_model=schemas.User)
async def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Users (Admin Only) ---
@app.post("/users/", response_model=schemas.User, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
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
    return db_user

# --- Departments ---
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

# --- Teachers ---
@app.post("/teachers/", response_model=schemas.Teacher, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN, models.UserRole.HOD]))])
async def create_teacher(teacher: schemas.TeacherCreate, db: AsyncSession = Depends(get_db)):
    # Verify user exists and isn't already a teacher
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

# --- Teacher Dashboard ---
@app.get("/teachers/me/dashboard", response_model=schemas.DashboardSummary, dependencies=[Depends(auth.check_role([models.UserRole.TEACHER, models.UserRole.HOD]))])
async def get_teacher_dashboard(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    # Fetch pending relief assignments
    relief_result = await db.execute(
        select(models.ReliefAssignment)
        .where(models.ReliefAssignment.relief_teacher_id == teacher.id, models.ReliefAssignment.status == models.ReliefStatus.PENDING)
    )
    pending_reliefs = relief_result.scalars().all()
    
    # Fetch active timetable slots
    slots_result = await db.execute(
        select(models.TimetableSlot)
        .join(models.TimetableVersion)
        .where(models.TimetableSlot.teacher_id == teacher.id, models.TimetableVersion.is_active == True)
    )
    slots = slots_result.scalars().all()
    
    timetable_data = []
    for s in slots:
        timetable_data.append({
            "day": s.day_of_week,
            "period": s.period,
            "subject": "Class Session", # Simplified for now
            "class": "Grade X", # Simplified for now
            "room": "Room Y" # Simplified for now
        })

    # Format pending requests
    pending_requests = []
    for r in pending_reliefs:
        pending_requests.append({
            "id": str(r.id),
            "type": "relief_request",
            "message": "New relief duty assigned",
            "date": r.assigned_at.isoformat() if r.assigned_at else ""
        })
        
    # Fetch leave applications (absences) for this teacher
    absence_result = await db.execute(
        select(models.Absence).where(models.Absence.teacher_id == teacher.id)
    )
    absences = absence_result.scalars().all()
    for a in absences:
        if a.status == models.AbsenceStatus.PENDING:
            pending_requests.append({
                "id": str(a.id),
                "type": "leave_application",
                "message": f"Leave application ({a.leave_type}) pending approval",
                "date": a.date.isoformat()
            })

    return {
        "timetable": timetable_data or [
            { "day": 0, "period": 1, "subject": "Maths", "class": "Grade 10A", "room": "201" },
            { "day": 0, "period": 2, "subject": "Maths", "class": "Grade 10B", "room": "202" }
        ],
        "relief_duties": [],
        "total_hours": teacher.total_hours_worked,
        "relief_hours": teacher.current_relief_hours,
        "pending_requests": pending_requests
    }

# --- Timetable Management ---
@app.get("/timetable/versions", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def list_timetable_versions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TimetableVersion).order_by(models.TimetableVersion.published_at.desc()))
    return result.scalars().all()

@app.post("/timetable/versions/{version_id}/activate", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def activate_timetable_version(version_id: UUID, db: AsyncSession = Depends(get_db)):
    # Deactivate all others
    await db.execute(models.TimetableVersion.__table__.update().values(is_active=False))
    
    # Activate target
    result = await db.execute(select(models.TimetableVersion).where(models.TimetableVersion.id == version_id))
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    version.is_active = True
    await db.commit()
    return {"status": "success", "message": "Timetable version activated"}


# --- Admin Operations ---
@app.get("/admin/stats", response_model=schemas.AdminDashboardStats, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    from datetime import date
    today = date.today()
    
    # 1. Active Absences (Today, not rejected, not resolved)
    active_abs_res = await db.execute(
        select(func.count(models.Absence.id))
        .where(models.Absence.date == today, models.Absence.status != models.AbsenceStatus.REJECTED, models.Absence.resolved == False)
    )
    active_absences = active_abs_res.scalar() or 0

    # 2. Relief Assigned Today
    relief_today_res = await db.execute(
        select(func.count(models.ReliefAssignment.id))
        .where(func.date(models.ReliefAssignment.assigned_at) == today)
    )
    relief_today = relief_today_res.scalar() or 0

    # 3. Total Staff
    staff_count_res = await db.execute(select(func.count(models.Teacher.id)))
    total_staff = staff_count_res.scalar() or 0

    # 4. Flagged Issues
    flagged_res = await db.execute(
        select(func.count(models.ReliefAssignment.id))
        .where(models.ReliefAssignment.status == models.ReliefStatus.FLAGGED)
    )
    flagged_issues = flagged_res.scalar() or 0

    # 5. Coverage Rate (Mocked for now)
    coverage_rate = 98.0

    return {
        "active_absences": active_absences,
        "relief_assigned_today": relief_today,
        "coverage_rate": coverage_rate,
        "staff_present_count": total_staff - active_absences,
        "total_staff_count": total_staff,
        "flagged_issues_count": flagged_issues,
        "pending_timetable_tasks": 0
    }

@app.get("/admin/relief/active", response_model=List[schemas.ReliefAssignmentBase], dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def get_active_reliefs(db: AsyncSession = Depends(get_db)):
    from datetime import date
    today = date.today()
    result = await db.execute(
        select(models.ReliefAssignment)
        .join(models.Absence)
        .where(models.Absence.date == today)
    )
    return result.scalars().all()

@app.get("/admin/relief/flagged", response_model=List[schemas.ReliefAssignmentBase], dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def get_flagged_reliefs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ReliefAssignment)
        .where(models.ReliefAssignment.status == models.ReliefStatus.FLAGGED)
    )
    return result.scalars().all()

@app.put("/teachers/{teacher_id}", response_model=schemas.Teacher, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def update_teacher(teacher_id: UUID, teacher_update: schemas.TeacherUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Teacher).where(models.Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    update_data = teacher_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(teacher, key, value)
    
    await db.commit()
    await db.refresh(teacher)
    return teacher

@app.get("/admin/settings", response_model=schemas.SystemSettings, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def get_system_settings():
    # Mock settings for now
    return {
        "max_weekly_hours_default": 30,
        "weekly_relief_cap_default": 3,
        "fairness_balance_factor": 0.5,
        "allow_hod_auto_approval": True
    }

@app.put("/admin/settings", response_model=schemas.SystemSettings, dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def update_system_settings(settings: schemas.SystemSettings):
    # In a real app, you'd save this to a Settings table or a config file
    return settings

=======
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# --- HOD Operations ---
@app.get("/hod/dashboard", response_model=schemas.HODDashboardSummary, dependencies=[Depends(auth.check_role([models.UserRole.HOD]))])
async def get_hod_dashboard(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    hod = teacher_result.scalar_one_or_none()
    if not hod or not hod.department_id:
        raise HTTPException(status_code=404, detail="HOD department not found")

    dept_result = await db.execute(select(models.Department).where(models.Department.id == hod.department_id))
    dept = dept_result.scalar_one_or_none()

    # Count staff
    staff_count_result = await db.execute(select(func.count(models.Teacher.id)).where(models.Teacher.department_id == hod.department_id))
    staff_count = staff_count_result.scalar()

    # Count pending leaves in department
    pending_leaves_result = await db.execute(
        select(func.count(models.Absence.id))
        .join(models.Teacher)
        .where(models.Teacher.department_id == hod.department_id, models.Absence.status == models.AbsenceStatus.PENDING)
    )
    pending_count = pending_leaves_result.scalar()

    # Active absences (approved but not resolved)
    active_absences_result = await db.execute(
        select(func.count(models.Absence.id))
        .join(models.Teacher)
        .where(models.Teacher.department_id == hod.department_id, models.Absence.status == models.AbsenceStatus.APPROVED, models.Absence.resolved == False)
    )
    active_count = active_absences_result.scalar()

    return {
        "department_name": dept.name if dept else "Unknown",
        "active_absences": active_count,
        "coverage_rate": 95.5, # Mocked
        "total_staff": staff_count,
        "pending_approvals_count": pending_count
    }

@app.get("/hod/leaves/pending", response_model=List[schemas.Absence], dependencies=[Depends(auth.check_role([models.UserRole.HOD]))])
async def get_pending_department_leaves(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    hod = teacher_result.scalar_one_or_none()
    if not hod or not hod.department_id:
        raise HTTPException(status_code=404, detail="HOD department not found")

    result = await db.execute(
        select(models.Absence)
        .join(models.Teacher)
        .where(models.Teacher.department_id == hod.department_id, models.Absence.status == models.AbsenceStatus.PENDING)
    )
    return result.scalars().all()

@app.put("/absences/{absence_id}/approve", response_model=schemas.Absence, dependencies=[Depends(auth.check_role([models.UserRole.HOD]))])
async def approve_leave(absence_id: UUID, approval: schemas.LeaveApproval, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    hod = teacher_result.scalar_one_or_none()
    
    result = await db.execute(select(models.Absence).where(models.Absence.id == absence_id))
    absence = result.scalar_one_or_none()
    
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found")
        
    absence.status = approval.status
    if approval.resolution_report_url:
        absence.resolution_report_url = approval.resolution_report_url
        
    await db.commit()
    await db.refresh(absence)
    return absence

# --- Absence & Relief ---
@app.post("/absences/", response_model=schemas.Absence, dependencies=[Depends(auth.check_role([models.UserRole.TEACHER, models.UserRole.HOD]))])
async def mark_absence(absence: schemas.AbsenceCreate, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    teacher = teacher_result.scalar_one_or_none()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    db_absence = models.Absence(
        teacher_id=teacher.id,
        date=absence.date,
        period_start=absence.period_start,
        period_end=absence.period_end,
        leave_type=absence.leave_type,
        reason=absence.reason,
        handover_url=absence.handover_url,
        status=models.AbsenceStatus.PENDING
    )
    db.add(db_absence)
    await db.commit()
    await db.refresh(db_absence)
    
    return db_absence

    
    # Get all teachers for relief ranking
    all_teachers_result = await db.execute(select(models.Teacher))
    all_teachers = []
    for t in all_teachers_result.scalars().all():
        all_teachers.append({
            "id": t.id,
            "name": t.name,
            "department_id": t.department_id,
            "blocked_slots": t.blocked_slots,
            "weekly_relief_cap": t.weekly_relief_cap,
            "is_active": t.is_active
        })
    
    # Mock counts
    weekly_relief_counts = {t['id']: 0 for t in all_teachers}
    
    candidates = relief.rank_relief_candidates(
        absent_teacher_id=absent_teacher.id,
        absent_teacher_dept_id=absent_teacher.department_id,
        day_of_week=day_of_week,
        period=absence.period_start,
        all_teachers=all_teachers,
        current_slots=[],
        weekly_relief_counts=weekly_relief_counts
    )
    
    return {
        "absence_id": db_absence.id,
        "candidates": candidates[:5]
    }



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
        from datetime import datetime
        assignment.acknowledged_at = datetime.utcnow()

        # In a real system, you would update the timetable slot here to mark it as relief



    await db.commit()
    await db.refresh(assignment)
    return assignment

=======
# --- Timetable Slots CRUD ---

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
async def get_timetable_view(
    scope: str,  # "teacher", "class", or "room"
    scope_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Role-scoped access control
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

    # Group by day
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
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857

@app.post("/generate-timetable/", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def trigger_timetable_generation(request: schemas.TimetableGenerateRequest):
    task = generate_timetable_task.delay(str(request.school_id))
    return {"task_id": task.id, "status": "pending"}
