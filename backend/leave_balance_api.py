from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, date
from uuid import UUID
from typing import Optional
from pydantic import BaseModel

from .database import get_db
from . import models
from . import auth

router = APIRouter()

def get_current_academic_year() -> str:
    """
    Academic year runs June 1 – May 31.
    Today May 29 2026 → still "2025-26".
    June 1 2026 onward → "2026-27".
    """
    today = date.today()
    if today.month >= 6:
        return f"{today.year}-{str(today.year + 1)[-2:]}"
    else:
        return f"{today.year - 1}-{str(today.year)[-2:]}"


def get_current_month() -> int:
    return date.today().month


async def _get_or_404_balance(
    teacher_id: UUID,
    db: AsyncSession,
) -> models.TeacherLeaveBalance:
    result = await db.execute(
        select(models.TeacherLeaveBalance).where(
            models.TeacherLeaveBalance.teacher_id == teacher_id
        )
    )
    balance = result.scalar_one_or_none()
    if not balance:
        raise HTTPException(
            status_code=404,
            detail="Leave balance record not found for this teacher.",
        )
    return balance


def _serialize_balance(b: models.TeacherLeaveBalance) -> dict:
    return {
        "id": str(b.id),
        "teacher_id": str(b.teacher_id),
        "academic_year": b.academic_year,
        "balance": b.balance,
        "used_ytd": b.used_ytd,
        "carry_over": b.carry_over,
        "last_credited_month": b.last_credited_month,
        "last_updated": b.last_updated.isoformat() if b.last_updated else None,
    }


# ─── Schemas ──────────────────────────────────────────────────────────────────

class ManualAdjustRequest(BaseModel):
    teacher_id: UUID
    adjustment_type: str          # "ADD" | "DEDUCT" | "SET"
    amount: float
    reason: str


# ─────────────────────────────────────────────────────────────────────────────
# TEACHER: Get my own balance
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/me")
async def get_my_balance(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Teacher).where(
            models.Teacher.user_id == current_user.id
        )
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")

    balance = await _get_or_404_balance(teacher.id, db)

    return {
        "success": True,
        "data": _serialize_balance(balance),
    }


# ─────────────────────────────────────────────────────────────────────────────
# HOD / ADMIN: Get a specific teacher's balance
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/teacher/{teacher_id}")
async def get_teacher_balance(
    teacher_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    # HOD can only view teachers in their own department
    if current_user.role == models.UserRole.HOD:
        hod_result = await db.execute(
            select(models.Teacher).where(
                models.Teacher.user_id == current_user.id
            )
        )
        hod = hod_result.scalar_one_or_none()

        target_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == teacher_id)
        )
        target = target_result.scalar_one_or_none()

        if not hod or not target:
            raise HTTPException(status_code=404, detail="Teacher not found.")

        if target.department_id != hod.department_id:
            raise HTTPException(
                status_code=403,
                detail="You can only view teachers in your department.",
            )

    balance = await _get_or_404_balance(teacher_id, db)

    return {
        "success": True,
        "data": _serialize_balance(balance),
    }


# ─────────────────────────────────────────────────────────────────────────────
# HOD: Get all balances in my department
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/department")
async def get_department_balances(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != models.UserRole.HOD:
        raise HTTPException(status_code=403, detail="HOD access required.")

    hod_result = await db.execute(
        select(models.Teacher).where(
            models.Teacher.user_id == current_user.id
        )
    )
    hod = hod_result.scalar_one_or_none()
    if not hod or not hod.department_id:
        raise HTTPException(status_code=404, detail="HOD department not found.")

    teachers_result = await db.execute(
        select(models.Teacher).where(
            models.Teacher.department_id == hod.department_id,
            models.Teacher.is_active == True,
        )
    )
    teachers = teachers_result.scalars().all()

    teacher_ids = [t.id for t in teachers]

    balances_result = await db.execute(
        select(models.TeacherLeaveBalance).where(
            models.TeacherLeaveBalance.teacher_id.in_(teacher_ids)
        )
    )
    balances = balances_result.scalars().all()

    balance_map = {b.teacher_id: b for b in balances}

    LOW_BALANCE_THRESHOLD = 2.0

    data = []
    for t in teachers:
        b = balance_map.get(t.id)
        data.append({
            "teacher_id": str(t.id),
            "teacher_name": t.name,
            "balance": b.balance if b else 0.0,
            "used_ytd": b.used_ytd if b else 0.0,
            "carry_over": b.carry_over if b else 0.0,
            "is_low_balance": (b.balance < LOW_BALANCE_THRESHOLD) if b else True,
            "last_updated": b.last_updated.isoformat() if b and b.last_updated else None,
        })

    return {
        "success": True,
        "count": len(data),
        "low_balance_count": sum(1 for d in data if d["is_low_balance"]),
        "data": data,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN: Get all teachers' balances
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/summary")
async def get_all_balances(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required.")

    result = await db.execute(
        select(models.Teacher, models.TeacherLeaveBalance)
        .outerjoin(
            models.TeacherLeaveBalance,
            models.Teacher.id == models.TeacherLeaveBalance.teacher_id,
        )
        .where(models.Teacher.is_active == True)
    )
    rows = result.all()

    LOW_BALANCE_THRESHOLD = 2.0

    data = []
    for teacher, balance in rows:
        data.append({
            "teacher_id": str(teacher.id),
            "teacher_name": teacher.name,
            "department_id": str(teacher.department_id) if teacher.department_id else None,
            "balance": balance.balance if balance else 0.0,
            "used_ytd": balance.used_ytd if balance else 0.0,
            "carry_over": balance.carry_over if balance else 0.0,
            "is_low_balance": (balance.balance < LOW_BALANCE_THRESHOLD) if balance else True,
            "academic_year": balance.academic_year if balance else get_current_academic_year(),
        })

    total = len(data)
    avg_balance = round(sum(d["balance"] for d in data) / total, 2) if total else 0.0

    return {
        "success": True,
        "academic_year": get_current_academic_year(),
        "total_teachers": total,
        "average_balance": avg_balance,
        "low_balance_count": sum(1 for d in data if d["is_low_balance"]),
        "data": data,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN: Credit 1.5 days to all teachers (call on 1st of each month)
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/credit-month",
    dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))],
)
async def credit_monthly_allocation(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_month = get_current_month()
    current_year = get_current_academic_year()
    MONTHLY_CREDIT = 1.5

    result = await db.execute(
        select(models.TeacherLeaveBalance).where(
            models.TeacherLeaveBalance.academic_year == current_year
        )
    )
    balances = result.scalars().all()

    already_credited = [
        b for b in balances if b.last_credited_month == current_month
    ]
    if already_credited:
        raise HTTPException(
            status_code=409,
            detail=f"Monthly credit for month {current_month} has already been applied.",
        )

    credited_count = 0
    for b in balances:
        b.carry_over = b.balance          # current balance becomes carry-over
        b.balance = b.balance + MONTHLY_CREDIT   # add new allocation on top
        b.last_credited_month = current_month
    await db.commit()
    credited_count = len(balances)

    return {
        "success": True,
        "message": f"Credited {MONTHLY_CREDIT} days to {credited_count} teachers for month {current_month}.",
        "credited_count": credited_count,
        "month": current_month,
        "academic_year": current_year,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN: Year-end reset (call on June 1)
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/reset-year",
    dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))],
)
async def reset_academic_year(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_year = get_current_academic_year()

    result = await db.execute(select(models.TeacherLeaveBalance))
    balances = result.scalars().all()

    for b in balances:
        b.balance = 0.0
        b.used_ytd = 0.0
        b.carry_over = 0.0
        b.last_credited_month = None
        b.academic_year = new_year

    await db.commit()

    return {
        "success": True,
        "message": f"Year-end reset complete. All balances zeroed for {new_year}.",
        "teachers_reset": len(balances),
        "new_academic_year": new_year,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN: Manual balance adjustment
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/adjust",
    dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))],
)
async def adjust_balance(
    body: ManualAdjustRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.adjustment_type not in ("ADD", "DEDUCT", "SET"):
        raise HTTPException(
            status_code=400,
            detail="adjustment_type must be ADD, DEDUCT, or SET.",
        )

    if body.amount < 0:
        raise HTTPException(
            status_code=400,
            detail="amount must be a positive number.",
        )

    balance = await _get_or_404_balance(body.teacher_id, db)
    old_balance = balance.balance

    if body.adjustment_type == "ADD":
        balance.balance = round(balance.balance + body.amount, 1)
    elif body.adjustment_type == "DEDUCT":
        balance.balance = round(max(0.0, balance.balance - body.amount), 1)
    elif body.adjustment_type == "SET":
        balance.balance = round(body.amount, 1)

    # Log to existing AuditLog table
    audit = models.AuditLog(
        performed_by_user_id=current_user.id,
        performed_by_college_id=current_user.college_id,
        action="LEAVE_BALANCE_ADJUSTMENT",
        details={
            "teacher_id": str(body.teacher_id),
            "adjustment_type": body.adjustment_type,
            "amount": body.amount,
            "old_balance": old_balance,
            "new_balance": balance.balance,
            "reason": body.reason,
        },
    )
    db.add(audit)
    await db.commit()

    return {
        "success": True,
        "message": f"Balance {body.adjustment_type.lower()}ed successfully.",
        "data": {
            "teacher_id": str(body.teacher_id),
            "old_balance": old_balance,
            "new_balance": balance.balance,
            "adjustment_type": body.adjustment_type,
            "amount": body.amount,
            "reason": body.reason,
        },
    }