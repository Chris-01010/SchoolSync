from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from .database import get_db
from .models import Teacher, Department, Subject, User, UserRole
from .schemas import (
    TeacherCreate, TeacherUpdate, Teacher as TeacherSchema,
    DepartmentCreate, Department as DepartmentSchema,
    SubjectCreate, Subject as SubjectSchema,
)
from . import auth

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

from .schemas import UserAdminView
from pydantic import BaseModel
from datetime import datetime

class ResetPasswordPayload(BaseModel):
    new_password: str

class StatusPayload(BaseModel):
    is_active: bool

@router.get("/users/admin-view", response_model=List[UserAdminView], tags=["Users"], summary="List all users for Admin Dashboard")
async def list_users_admin_view(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    # Simple join between User and Teacher to get department names
    result = await db.execute(select(User))
    users = result.scalars().all()
    
    admin_views = []
    for user in users:
        dept_name = None
        if user.role in [UserRole.TEACHER, UserRole.HOD]:
            teacher_res = await db.execute(select(Teacher).where(Teacher.user_id == user.id))
            teacher = teacher_res.scalar_one_or_none()
            if teacher and teacher.department_id:
                dept_res = await db.execute(select(Department).where(Department.id == teacher.department_id))
                dept = dept_res.scalar_one_or_none()
                if dept:
                    dept_name = dept.name
                    
        admin_views.append(UserAdminView(
            id=user.id,
            college_id=user.college_id,
            name=user.college_id, # Fallback name
            email=user.email,
            role=user.role.value.upper(),
            department=dept_name,
            is_active=user.is_active,
            status="Active" if user.is_active else "Disabled",
            last_active="Just now" # Mocked for now
        ))
        
    return admin_views

@router.put("/users/{user_id}/reset-password", status_code=status.HTTP_200_OK, tags=["Users"])
async def admin_reset_password(user_id: UUID, payload: ResetPasswordPayload, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password_hash = auth.get_password_hash(payload.new_password)
    await db.commit()
    return {"status": "success", "message": "Password reset successfully"}

@router.put("/users/{user_id}/status", status_code=status.HTTP_200_OK, tags=["Users"])
async def admin_change_status(user_id: UUID, payload: StatusPayload, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = payload.is_active
    await db.commit()
    return {"status": "success", "message": "User status updated"}

