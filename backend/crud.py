from .schemas import SubjectOut
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

from .database import get_db
from .models import Teacher, Department, Subject, User, UserRole
from .schemas import (
    TeacherCreate, TeacherUpdate, Teacher as TeacherSchema,
    DepartmentCreate, Department as DepartmentSchema,
    SubjectCreate, Subject as SubjectSchema,
    UserAdminView, UserAdminCreate,
)
from . import auth


router = APIRouter()


def require_admin(current_user: User = Depends(auth.get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user


# ══════════════════════════════════════════════
# TEACHER ENDPOINTS
# ══════════════════════════════════════════════

@router.post("/teachers", response_model=TeacherSchema, status_code=status.HTTP_201_CREATED, tags=["Teachers"])
async def create_teacher(payload: TeacherCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    user_result = await db.execute(select(User).where(User.id == payload.user_id))
    if not user_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")
    existing = await db.execute(select(Teacher).where(Teacher.user_id == payload.user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Teacher record already exists for this user.")
    teacher = Teacher(**payload.model_dump())
    db.add(teacher)
    await db.commit()
    await db.refresh(teacher)
    return teacher


@router.get("/teachers", response_model=List[TeacherSchema], tags=["Teachers"])
async def list_teachers(db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Teacher).where(Teacher.is_active == True))
    return result.scalars().all()


@router.get("/teachers/{teacher_id}", response_model=TeacherSchema, tags=["Teachers"])
async def get_teacher(teacher_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    return teacher


@router.patch("/teachers/{teacher_id}", response_model=TeacherSchema, tags=["Teachers"])
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


@router.delete("/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Teachers"])
async def delete_teacher(teacher_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    teacher.is_active = False
    await db.commit()


# ══════════════════════════════════════════════
# DEPARTMENT ENDPOINTS
# ══════════════════════════════════════════════

@router.post("/departments", response_model=DepartmentSchema, status_code=status.HTTP_201_CREATED, tags=["Departments"])
async def create_department(payload: DepartmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    dept = Department(**payload.model_dump())
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept


@router.get("/departments", response_model=List[DepartmentSchema], tags=["Departments"])
async def list_departments(db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Department))
    return result.scalars().all()


@router.get("/departments/{dept_id}", response_model=DepartmentSchema, tags=["Departments"])
async def get_department(dept_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    return dept


@router.patch("/departments/{dept_id}", response_model=DepartmentSchema, tags=["Departments"])
async def update_department(dept_id: UUID, payload: DepartmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    old_hod_id = dept.hod_id
    new_hod_id = payload.hod_id if hasattr(payload, 'hod_id') else None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)
    if new_hod_id and str(new_hod_id) != str(old_hod_id):
        if old_hod_id:
            old_teacher_res = await db.execute(select(Teacher).where(Teacher.id == old_hod_id))
            old_teacher = old_teacher_res.scalar_one_or_none()
            if old_teacher:
                old_user_res = await db.execute(select(User).where(User.id == old_teacher.user_id))
                old_user = old_user_res.scalar_one_or_none()
                if old_user:
                    old_user.role = UserRole.TEACHER
        new_teacher_res = await db.execute(select(Teacher).where(Teacher.id == new_hod_id))
        new_teacher = new_teacher_res.scalar_one_or_none()
        if new_teacher:
            new_user_res = await db.execute(select(User).where(User.id == new_teacher.user_id))
            new_user = new_user_res.scalar_one_or_none()
            if new_user:
                new_user.role = UserRole.HOD
            new_teacher.department_id = dept_id
    await db.commit()
    await db.refresh(dept)
    return dept


@router.delete("/departments/{dept_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Departments"])
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

@router.post("/subjects", response_model=SubjectSchema, status_code=status.HTTP_201_CREATED, tags=["Subjects"])
async def create_subject(payload: SubjectCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    subject = Subject(**payload.model_dump())
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.get("/subjects", response_model=List[SubjectOut], tags=["Subjects"])
async def list_subjects(db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Subject))
    return result.scalars().all()


@router.get("/subjects/{subject_id}", response_model=SubjectOut, tags=["Subjects"])
async def get_subject(subject_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalar_one_or_none()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    return subject


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Subjects"])
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

class ResetPasswordPayload(BaseModel):
    new_password: str

class StatusPayload(BaseModel):
    is_active: bool


@router.get("/users/admin-view", response_model=List[UserAdminView], tags=["Users"])
async def list_users_admin_view(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    users_res = await db.execute(select(User))
    users = users_res.scalars().all()

    teachers_res = await db.execute(select(Teacher))
    teachers_by_user = {t.user_id: t for t in teachers_res.scalars().all()}

    depts_res = await db.execute(select(Department))
    depts_by_id = {d.id: d for d in depts_res.scalars().all()}

    admin_views = []
    for user in users:
        teacher = teachers_by_user.get(user.id)
        teacher_name = teacher.name if teacher else None
        dept_name = None
        if teacher and teacher.department_id:
            dept = depts_by_id.get(teacher.department_id)
            if dept:
                dept_name = dept.name
        admin_views.append(UserAdminView(
            id=user.id,
            college_id=user.college_id,
            name=teacher_name or user.college_id,
            email=user.email,
            role=user.role.value.upper(),
            department=dept_name,
            is_active=user.is_active,
            status="Active" if user.is_active else "Disabled",
            last_active="Just now",
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


@router.post("/users/admin-create", tags=["Users"])
async def admin_create_user(
    payload: UserAdminCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    existing_email = await db.execute(select(User).where(User.email == payload.email))
    if existing_email.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Auto-generate college_id if not provided
    if not payload.college_id or not payload.college_id.strip():
        prefix_map = {"admin": "ADM", "hod": "HOD", "teacher": "TCH"}
        prefix = prefix_map.get(payload.role.lower(), "TCH")
        existing = await db.execute(
            select(User.college_id).where(User.college_id.like(f"{prefix}%"))
        )
        nums = []
        for cid in existing.scalars().all():
            try:
                nums.append(int(cid[len(prefix):]))
            except (ValueError, IndexError):
                pass
        next_num = (max(nums) + 1) if nums else 1
        payload.college_id = f"{prefix}{next_num:03d}"
    else:
        existing_id = await db.execute(select(User).where(User.college_id == payload.college_id))
        if existing_id.scalars().first():
            raise HTTPException(status_code=400, detail="College ID already registered")

    role_map = {"admin": UserRole.ADMIN, "hod": UserRole.HOD, "teacher": UserRole.TEACHER}
    db_user = User(
        college_id=payload.college_id,
        email=payload.email,
        password_hash=auth.get_password_hash(payload.password),
        role=role_map.get(payload.role.lower(), UserRole.TEACHER),
        is_active=True,
        is_verified=True
    )
    db.add(db_user)
    await db.flush()

    if payload.role.lower() in ["teacher", "hod"]:
        teacher = Teacher(
            user_id=db_user.id,
            name=payload.name,
            email=payload.email,
            department_id=payload.department_id,
            is_active=True
        )
        db.add(teacher)

    await db.commit()
    await db.refresh(db_user)
    return {"status": "success", "user_id": str(db_user.id)}


@router.get("/users/audit-log", tags=["Users"])
async def get_audit_log(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(limit))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "action": "User created",
            "target": u.email,
            "role": str(u.role),
            "timestamp": str(u.created_at),
            "performed_by": "system"
        }
        for u in users
    ]
# ══════════════════════════════════════════════
# MISSING USER ENDPOINTS (edit + bulk actions)
# ══════════════════════════════════════════════

class UserEditPayload(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[UUID] = None


class BulkActionPayload(BaseModel):
    user_ids: List[UUID]
    action: str  # "enable" | "disable" | "reset_password"
    new_password: Optional[str] = None


@router.patch("/users/{user_id}", tags=["Users"])
async def admin_edit_user(
    user_id: UUID,
    payload: UserEditPayload,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email and payload.email != user.email:
        dupe = await db.execute(
            select(User).where(User.email == payload.email, User.id != user_id)
        )
        if dupe.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = payload.email

    if payload.role:
        role_map = {"admin": UserRole.ADMIN, "hod": UserRole.HOD, "teacher": UserRole.TEACHER}
        new_role = role_map.get(payload.role.lower())
        if new_role:
            user.role = new_role

    teacher_res = await db.execute(select(Teacher).where(Teacher.user_id == user.id))
    teacher = teacher_res.scalar_one_or_none()
    if teacher:
        if payload.name:
            teacher.name = payload.name
        if payload.email:
            teacher.email = payload.email
        if payload.department_id is not None:
            teacher.department_id = payload.department_id

    await db.commit()
    await db.refresh(user)

    dept_name = None
    teacher_name = None
    if teacher:
        teacher_name = teacher.name
        if teacher.department_id:
            dept_res = await db.execute(select(Department).where(Department.id == teacher.department_id))
            dept = dept_res.scalar_one_or_none()
            if dept:
                dept_name = dept.name

    return {
        "id": str(user.id),
        "college_id": user.college_id,
        "name": teacher_name or user.college_id,
        "email": user.email,
        "role": user.role.value.upper(),
        "department": dept_name,
        "department_id": str(teacher.department_id) if teacher and teacher.department_id else None,
        "is_active": user.is_active,
        "status": "Active" if user.is_active else "Disabled",
        "last_active": "Just now",
    }


@router.post("/users/bulk-action", tags=["Users"])
async def admin_bulk_action(
    payload: BulkActionPayload,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    if payload.action not in ("enable", "disable", "reset_password"):
        raise HTTPException(status_code=400, detail="Invalid action")
    if payload.action == "reset_password" and not payload.new_password:
        raise HTTPException(status_code=400, detail="new_password required for reset_password")

    result = await db.execute(select(User).where(User.id.in_(payload.user_ids)))
    users = result.scalars().all()

    for user in users:
        if payload.action == "enable":
            user.is_active = True
        elif payload.action == "disable":
            user.is_active = False
        elif payload.action == "reset_password":
            user.password_hash = auth.get_password_hash(payload.new_password)

    await db.commit()
    return {"status": "success", "affected": len(users)}
