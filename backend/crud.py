from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from database import get_db
from models import Teacher, Department, Subject, User, UserRole, AuditLog
from schemas import (
    TeacherCreate, TeacherUpdate, Teacher as TeacherSchema,
    DepartmentCreate, Department as DepartmentSchema,
    SubjectCreate, Subject as SubjectSchema,
    UserAdminCreate, UserAdminUpdate, AuditLogOut, BulkActionPayload,
)
import auth

router = APIRouter()


# ──────────────────────────────────────────────
# DEPENDENCY: Admin-only guard
# ──────────────────────────────────────────────

def require_admin(current_user: User = Depends(auth.get_current_user)) -> User:
    """Allow only Admin users to write. Raises 403 for anyone else."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


# ══════════════════════════════════════════════
# TEACHER ENDPOINTS
# ══════════════════════════════════════════════

@router.post("/teachers", response_model=TeacherSchema, status_code=status.HTTP_201_CREATED, tags=["Teachers"], summary="Create a new teacher (Admin only)")
async def create_teacher(payload: TeacherCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    # Check user exists
    user_result = await db.execute(select(User).where(User.id == payload.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent duplicate
    existing = await db.execute(select(Teacher).where(Teacher.user_id == payload.user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A teacher record already exists for this user.")

    teacher = Teacher(**payload.model_dump())
    db.add(teacher)
    await db.commit()
    await db.refresh(teacher)
    return teacher


@router.get("/teachers", response_model=List[TeacherSchema], tags=["Teachers"], summary="List all teachers (all roles)")
async def list_teachers(db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Teacher).where(Teacher.is_active == True))
    return result.scalars().all()


@router.get("/teachers/{teacher_id}", response_model=TeacherSchema, tags=["Teachers"], summary="Get a single teacher by ID (all roles)")
async def get_teacher(teacher_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    return teacher


@router.patch("/teachers/{teacher_id}", response_model=TeacherSchema, tags=["Teachers"], summary="Update a teacher (Admin only)")
async def update_teacher(teacher_id: UUID, payload: TeacherUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(teacher, field, value)

    await db.commit()
    await db.refresh(teacher)
    return teacher


@router.delete("/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Teachers"], summary="Soft-delete a teacher (Admin only)")
async def delete_teacher(teacher_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")

    teacher.is_active = False  # Soft delete
    await db.commit()


# ══════════════════════════════════════════════
# DEPARTMENT ENDPOINTS
# ══════════════════════════════════════════════

@router.post("/departments", response_model=DepartmentSchema, status_code=status.HTTP_201_CREATED, tags=["Departments"], summary="Create a department (Admin only)")
async def create_department(payload: DepartmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    dept = Department(**payload.model_dump())
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept


@router.get("/departments", response_model=List[DepartmentSchema], tags=["Departments"], summary="List all departments (all roles)")
async def list_departments(db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Department))
    return result.scalars().all()


@router.get("/departments/{dept_id}", response_model=DepartmentSchema, tags=["Departments"], summary="Get a single department (all roles)")
async def get_department(dept_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    return dept


@router.patch("/departments/{dept_id}", response_model=DepartmentSchema, tags=["Departments"], summary="Update a department (Admin only)")
async def update_department(dept_id: UUID, payload: DepartmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)

    await db.commit()
    await db.refresh(dept)
    return dept


@router.delete("/departments/{dept_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Departments"], summary="Delete a department (Admin only)")
async def delete_department(dept_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")

    await db.delete(dept)
    await db.commit()


# ══════════════════════════════════════════════
# SUBJECT ENDPOINTS
# ══════════════════════════════════════════════

@router.post("/subjects", response_model=SubjectSchema, status_code=status.HTTP_201_CREATED, tags=["Subjects"], summary="Create a subject (Admin only)")
async def create_subject(payload: SubjectCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    subject = Subject(**payload.model_dump())
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.get("/subjects", response_model=List[SubjectSchema], tags=["Subjects"], summary="List all subjects (all roles)")
async def list_subjects(db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Subject))
    return result.scalars().all()


@router.get("/subjects/{subject_id}", response_model=SubjectSchema, tags=["Subjects"], summary="Get a single subject (all roles)")
async def get_subject(subject_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalar_one_or_none()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    return subject


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Subjects"], summary="Delete a subject (Admin only)")
async def delete_subject(subject_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalar_one_or_none()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    await db.delete(subject)
    await db.commit()

# ══════════════════════════════════════════════
# USER MANAGEMENT ENDPOINTS (Admin Only)
# ══════════════════════════════════════════════

from schemas import UserAdminView
from pydantic import BaseModel
from datetime import datetime

class ResetPasswordPayload(BaseModel):
    new_password: str

class StatusPayload(BaseModel):
    is_active: bool

# ── Helper ────────────────────────────────────────────────────────────────────

async def _write_audit(
    db: AsyncSession,
    action: str,
    performed_by_college_id: str,
    target_college_id: str = None,
    details: dict = None,
):
    db.add(AuditLog(
        performed_by_college_id=performed_by_college_id,
        action=action,
        target_college_id=target_college_id,
        details=details,
    ))

async def _get_teacher_info(db: AsyncSession, user: User):
    """Return (teacher, dept_name, dept_id) for TEACHER/HOD users."""
    if user.role not in [UserRole.TEACHER, UserRole.HOD]:
        return None, None, None
    teacher_res = await db.execute(select(Teacher).where(Teacher.user_id == user.id))
    teacher = teacher_res.scalar_one_or_none()
    if not teacher:
        return None, None, None
    dept_name, dept_id = None, None
    if teacher.department_id:
        dept_res = await db.execute(select(Department).where(Department.id == teacher.department_id))
        dept = dept_res.scalar_one_or_none()
        if dept:
            dept_name = dept.name
            dept_id = dept.id
    return teacher, dept_name, dept_id


# ══════════════════════════════════════════════
# USER MANAGEMENT ENDPOINTS (Admin Only)
# ══════════════════════════════════════════════

@router.get("/users/admin-view", response_model=List[UserAdminView], tags=["Users"], summary="List all users for Admin Dashboard")
async def list_users_admin_view(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    admin_views = []
    for user in users:
        teacher, dept_name, dept_id = await _get_teacher_info(db, user)
        display_name = (teacher.name if teacher else None) or user.college_id
        admin_views.append(UserAdminView(
            id=user.id,
            college_id=user.college_id,
            name=display_name,
            email=user.email,
            role=user.role.value.upper(),
            department=dept_name,
            department_id=dept_id,
            is_active=user.is_active,
            status="Active" if user.is_active else "Disabled",
            last_active="Just now",
            created_at=user.created_at,
        ))

    return admin_views


@router.post("/users/admin-create", response_model=UserAdminView, status_code=status.HTTP_201_CREATED, tags=["Users"], summary="Create a user account (Admin only)")
async def admin_create_user(payload: UserAdminCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    # Duplicate checks
    dup_id = await db.execute(select(User).where(User.college_id == payload.college_id))
    if dup_id.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="College ID already registered.")
    dup_email = await db.execute(select(User).where(User.email == payload.email))
    if dup_email.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    new_user = User(
        college_id=payload.college_id,
        email=payload.email,
        password_hash=auth.get_password_hash(payload.password),
        role=payload.role,
        is_active=True,
        is_verified=True,
    )
    db.add(new_user)
    await db.flush()

    teacher = None
    dept_name = None
    if payload.role in [UserRole.TEACHER, UserRole.HOD]:
        teacher = Teacher(
            user_id=new_user.id,
            name=payload.name,
            email=payload.email,
            department_id=payload.department_id,
            is_active=True,
        )
        db.add(teacher)
        if payload.department_id:
            dept_res = await db.execute(select(Department).where(Department.id == payload.department_id))
            dept = dept_res.scalar_one_or_none()
            if dept:
                dept_name = dept.name

    await _write_audit(db, "user_created", admin.college_id, payload.college_id,
                       {"role": payload.role.value, "email": payload.email})
    await db.commit()
    await db.refresh(new_user)

    return UserAdminView(
        id=new_user.id,
        college_id=new_user.college_id,
        name=payload.name if teacher else new_user.college_id,
        email=new_user.email,
        role=new_user.role.value.upper(),
        department=dept_name,
        department_id=payload.department_id,
        is_active=new_user.is_active,
        status="Active",
        last_active="Just now",
        created_at=new_user.created_at,
    )


@router.patch("/users/{user_id}", response_model=UserAdminView, tags=["Users"], summary="Edit a user account (Admin only)")
async def admin_update_user(user_id: UUID, payload: UserAdminUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    changed = {}

    if payload.email and payload.email != user.email:
        dup = await db.execute(select(User).where(User.email == payload.email, User.id != user_id))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use by another account.")
        user.email = payload.email
        changed["email"] = payload.email

    if payload.role and payload.role != user.role:
        user.role = payload.role
        changed["role"] = payload.role.value

    teacher, dept_name, dept_id = await _get_teacher_info(db, user)

    if payload.name or payload.department_id is not None:
        if user.role in [UserRole.TEACHER, UserRole.HOD]:
            if not teacher:
                teacher = Teacher(user_id=user.id, name=payload.name or user.college_id, email=user.email, is_active=True)
                db.add(teacher)
                await db.flush()
            if payload.name:
                teacher.name = payload.name
                changed["name"] = payload.name
            if payload.department_id is not None:
                teacher.department_id = payload.department_id
                changed["department_id"] = str(payload.department_id)

    await _write_audit(db, "user_updated", admin.college_id, user.college_id, changed)
    await db.commit()

    teacher, dept_name, dept_id = await _get_teacher_info(db, user)
    display_name = (teacher.name if teacher else None) or user.college_id
    return UserAdminView(
        id=user.id, college_id=user.college_id, name=display_name, email=user.email,
        role=user.role.value.upper(), department=dept_name, department_id=dept_id,
        is_active=user.is_active, status="Active" if user.is_active else "Disabled",
        last_active="Just now", created_at=user.created_at,
    )


@router.post("/users/bulk-action", status_code=status.HTTP_200_OK, tags=["Users"], summary="Bulk enable/disable/reset users (Admin only)")
async def admin_bulk_action(payload: BulkActionPayload, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    if payload.action not in ("enable", "disable", "reset_password"):
        raise HTTPException(status_code=400, detail="Invalid action. Use 'enable', 'disable', or 'reset_password'.")
    if payload.action == "reset_password" and not payload.new_password:
        raise HTTPException(status_code=400, detail="new_password is required for reset_password action.")

    affected = 0
    for uid in payload.user_ids:
        res = await db.execute(select(User).where(User.id == uid))
        user = res.scalar_one_or_none()
        if not user:
            continue
        if payload.action == "enable":
            user.is_active = True
            await _write_audit(db, "bulk_enabled", admin.college_id, user.college_id)
        elif payload.action == "disable":
            user.is_active = False
            await _write_audit(db, "bulk_disabled", admin.college_id, user.college_id)
        elif payload.action == "reset_password":
            user.password_hash = auth.get_password_hash(payload.new_password)
            await _write_audit(db, "bulk_reset_password", admin.college_id, user.college_id)
        affected += 1

    await db.commit()
    return {"status": "success", "affected": affected}


@router.get("/users/audit-log", response_model=List[AuditLogOut], tags=["Users"], summary="Fetch audit log (Admin only)")
async def get_audit_log(
    target: str = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    if target:
        query = select(AuditLog).where(AuditLog.target_college_id == target).order_by(AuditLog.timestamp.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/users/{user_id}/reset-password", status_code=status.HTTP_200_OK, tags=["Users"])
async def admin_reset_password(user_id: UUID, payload: ResetPasswordPayload, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = auth.get_password_hash(payload.new_password)
    await _write_audit(db, "password_reset", admin.college_id, user.college_id)
    await db.commit()
    return {"status": "success", "message": "Password reset successfully"}


@router.put("/users/{user_id}/status", status_code=status.HTTP_200_OK, tags=["Users"])
async def admin_change_status(user_id: UUID, payload: StatusPayload, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = payload.is_active
    action = "user_enabled" if payload.is_active else "user_disabled"
    await _write_audit(db, action, admin.college_id, user.college_id)
    await db.commit()
    return {"status": "success", "message": "User status updated"}
