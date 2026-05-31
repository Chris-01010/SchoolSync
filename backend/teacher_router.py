# backend/teacher_router.py
# Mounted in main.py as: app.include_router(teacher_router.router, prefix="/teacher")

from __future__ import annotations
import datetime as dt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from . import models, auth
from .database import get_db

router = APIRouter()


# ─── GET /teacher/me/profile ──────────────────────────────────────────────────

@router.get("/me/profile")
async def get_my_profile(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        return {}

    dept_name = None
    if teacher.department_id:
        dept_result = await db.execute(
            select(models.Department).where(models.Department.id == str(teacher.department_id))
        )
        dept = dept_result.scalar_one_or_none()
        dept_name = dept.name if dept else None

    return {
        "id": str(teacher.id),
        "name": teacher.name,
        "email": teacher.email,
        "department": dept_name,
        "teachingHours": {
            "completed": teacher.total_hours_worked or 0,
            "total": teacher.max_weekly_hours or 30,
        },
        "reliefHours": {
            "completed": teacher.current_relief_hours or 0,
            "total": teacher.weekly_relief_cap or 5,
        },
        "remainingCap": max(0, (teacher.weekly_relief_cap or 5) - (teacher.current_relief_hours or 0)),
    }


# ─── GET /teacher/me/timetable ────────────────────────────────────────────────

@router.get("/me/timetable")
async def get_my_timetable(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        return {}

    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == str(teacher.id)
        )
    )
    slots = slots_result.scalars().all()

    DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    timetable: dict = {}

    for slot in slots:
        day = DAY_NAMES[slot.day_of_week] if slot.day_of_week < 5 else str(slot.day_of_week)
        if day not in timetable:
            timetable[day] = {}

        # Fetch subject and class names
        subject_name = None
        if slot.subject_id:
            subj_result = await db.execute(
                select(models.Subject).where(models.Subject.id == str(slot.subject_id))
            )
            subj = subj_result.scalar_one_or_none()
            subject_name = subj.name if subj else None

        class_name = None
        if slot.class_id:
            cls_result = await db.execute(
                select(models.ClassRoom).where(models.ClassRoom.id == str(slot.class_id))
            )
            cls = cls_result.scalar_one_or_none()
            class_name = cls.name if cls else None

        timetable[day][str(slot.period)] = {
            "subject": subject_name,
            "class": class_name,
            "is_relief": slot.is_relief,
            "start_time": str(slot.start_time) if slot.start_time else None,
            "end_time": str(slot.end_time) if slot.end_time else None,
        }

    return timetable


# ─── GET /teacher/me/relief/pending ──────────────────────────────────────────

@router.get("/me/relief/pending")
async def get_my_pending_relief(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        return []

    assignments_result = await db.execute(
        select(models.ReliefAssignment).where(
            models.ReliefAssignment.relief_teacher_id == str(teacher.id),
            models.ReliefAssignment.status == models.ReliefStatus.PENDING,
        )
    )
    assignments = assignments_result.scalars().all()

    DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    output = []

    for a in assignments:
        # Get absence
        absence_result = await db.execute(
            select(models.Absence).where(models.Absence.id == str(a.absence_id))
        )
        absence = absence_result.scalar_one_or_none()
        if not absence:
            continue

        # Get absent teacher
        absent_teacher_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == str(absence.teacher_id))
        )
        absent_teacher = absent_teacher_result.scalar_one_or_none()

        # Get slot info - find the timetable slot for the absent teacher on that day/period
        day_of_week = absence.date.weekday()
        slot = None
        for period in range(absence.period_start, absence.period_end + 1):
            slot_result = await db.execute(
                select(models.TimetableSlot).where(
                    models.TimetableSlot.teacher_id == str(absence.teacher_id),
                    models.TimetableSlot.day_of_week == day_of_week,
                    models.TimetableSlot.period == period,
                )
            )
            slot = slot_result.scalar_one_or_none()
            if slot:
                break

        subject_name = None
        class_name = None
        if slot:
            if slot.subject_id:
                subj_result = await db.execute(
                    select(models.Subject).where(models.Subject.id == str(slot.subject_id))
                )
                subj = subj_result.scalar_one_or_none()
                subject_name = subj.name if subj else None

            if slot.class_id:
                cls_result = await db.execute(
                    select(models.ClassRoom).where(models.ClassRoom.id == str(slot.class_id))
                )
                cls = cls_result.scalar_one_or_none()
                class_name = cls.name if cls else None

        output.append({
            "id": str(a.id),
            "absentTeacher": absent_teacher.name if absent_teacher else "Unknown",
            "subject": subject_name,
            "class": class_name,
            "day": DAY_NAMES[day_of_week] if day_of_week < 5 else str(day_of_week),
            "period": absence.period_start,
            "date": str(absence.date),
            "deadline": None,
            "slot_id": str(slot.id) if slot else None,
        })

    return output


# ─── GET /teacher/me/relief/confirmed ────────────────────────────────────────

@router.get("/me/relief/confirmed")
async def get_my_confirmed_relief(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        return []

    assignments_result = await db.execute(
        select(models.ReliefAssignment).where(
            models.ReliefAssignment.relief_teacher_id == str(teacher.id),
            models.ReliefAssignment.status == models.ReliefStatus.ACCEPTED,
        )
    )
    assignments = assignments_result.scalars().all()

    DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    output = []

    for a in assignments:
        absence_result = await db.execute(
            select(models.Absence).where(models.Absence.id == str(a.absence_id))
        )
        absence = absence_result.scalar_one_or_none()
        if not absence:
            continue

        absent_teacher_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == str(absence.teacher_id))
        )
        absent_teacher = absent_teacher_result.scalar_one_or_none()

        day_of_week = absence.date.weekday()
        slot_result = await db.execute(
            select(models.TimetableSlot).where(
                models.TimetableSlot.teacher_id == str(teacher.id),
                models.TimetableSlot.day_of_week == day_of_week,
                models.TimetableSlot.is_relief == True,
            )
        )
        slot = slot_result.scalar_one_or_none()

        subject_name = None
        class_name = None
        if slot:
            if slot.subject_id:
                subj_result = await db.execute(
                    select(models.Subject).where(models.Subject.id == str(slot.subject_id))
                )
                subj = subj_result.scalar_one_or_none()
                subject_name = subj.name if subj else None
            if slot.class_id:
                cls_result = await db.execute(
                    select(models.ClassRoom).where(models.ClassRoom.id == str(slot.class_id))
                )
                cls = cls_result.scalar_one_or_none()
                class_name = cls.name if cls else None

        output.append({
            "id": str(a.id),
            "originalTeacher": absent_teacher.name if absent_teacher else "Unknown",
            "subject": subject_name,
            "class": class_name,
            "day": DAY_NAMES[day_of_week] if day_of_week < 5 else str(day_of_week),
            "period": absence.period_start,
            "date": str(absence.date),
        })

    return output


# ─── GET /teacher/me/notifications ───────────────────────────────────────────

@router.get("/me/notifications")
async def get_my_notifications(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Notification).where(
            models.Notification.user_id == str(current_user.id)
        ).order_by(models.Notification.created_at.desc()).limit(20)
    )
    notifs = result.scalars().all()

    return [
        {
            "id": str(n.id),
            "title": n.title,
            "message": n.content,
            "is_read": n.is_read,
            "time": n.created_at.strftime("%b %d") if n.created_at else "",
            "type": "announcement",
        }
        for n in notifs
    ]
