from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID
from datetime import timedelta

from database import engine, Base, get_db
import models
import schemas
import relief
import auth
from worker import generate_timetable_task

app = FastAPI(title="SchoolSync API", version="1.0.0")

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

    await db.commit()
    await db.refresh(assignment)
    return assignment
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

@app.post("/generate-timetable/", dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
async def trigger_timetable_generation(request: schemas.TimetableGenerateRequest):
    task = generate_timetable_task.delay(str(request.school_id))
    return {"task_id": task.id, "status": "pending"}
