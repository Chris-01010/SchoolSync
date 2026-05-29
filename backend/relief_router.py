# backend/relief_router.py
# Candidates endpoint + event-based SSE stream
# Mounted in main.py as: app.include_router(relief_router.router, prefix="/relief")

from __future__ import annotations

import asyncio
import json
from uuid import UUID
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .database import get_db
from . import models, auth
from .relief_engine import rank_candidates

router = APIRouter()

# ─── In-memory pub/sub for SSE push ──────────────────────────────────────────
# Maps absence_id (str) → set of asyncio.Event objects (one per SSE connection)
_absence_events: dict[str, set[asyncio.Event]] = defaultdict(set)


def notify_absence_updated(absence_id: str):
    """Call this whenever a ReliefAssignment for this absence is created/updated."""
    for event in _absence_events.get(absence_id, set()):
        event.set()


# ─── Step 3: GET /relief/candidates/{absence_id} ──────────────────────────────

@router.get("/candidates/{absence_id}")
async def get_relief_candidates(
    absence_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    absence_id_str = str(absence_id)
    r = await db.execute(
        text("SELECT id, teacher_id, date, period_start, period_end, status FROM absences WHERE id = :id"),
        {"id": absence_id_str}
    )
    row = r.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Absence not found.")

    result = await db.execute(
        select(models.Absence).where(models.Absence.id == row[0])
    )
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found.")

    # HOD scope check
    if current_user.role == models.UserRole.HOD:
        hod_result = await db.execute(
            select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
        )
        hod = hod_result.scalar_one_or_none()

        absent_teacher_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == str(absence.teacher_id))
        )
        absent_teacher_check = absent_teacher_result.scalar_one_or_none()

        if hod and absent_teacher_check and hod.department_id != absent_teacher_check.department_id:
            raise HTTPException(
                status_code=403,
                detail="You can only view relief candidates for your department.",
            )

    # Fetch absent teacher
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == str(absence.teacher_id))
    )
    absent_teacher = teacher_result.scalar_one_or_none()
    if not absent_teacher:
        raise HTTPException(status_code=404, detail="Absent teacher profile not found.")

    # Fetch vacant slots
    day_of_week = absence.date.weekday()
    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == str(absence.teacher_id),
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period >= absence.period_start,
            models.TimetableSlot.period <= absence.period_end,
            models.TimetableSlot.is_relief == False,
        )
    )
    vacant_slots = slots_result.scalars().all()

    if not vacant_slots:
        return {"success": True, "absence_id": str(absence_id), "slots": []}

    # Build weekly_counts
    from datetime import timedelta
    from sqlalchemy import func as sa_func

    week_start = absence.date - timedelta(days=absence.date.weekday())
    week_end   = week_start + timedelta(days=6)

    counts_result = await db.execute(
        select(
            models.ReliefAssignment.relief_teacher_id,
            sa_func.count(models.ReliefAssignment.id).label("cnt"),
        )
        .join(models.Absence, models.ReliefAssignment.absence_id == models.Absence.id)
        .where(
            models.Absence.date >= week_start,
            models.Absence.date <= week_end,
            models.ReliefAssignment.relief_teacher_id.isnot(None),
        )
        .group_by(models.ReliefAssignment.relief_teacher_id)
    )
    weekly_counts: dict = {row[0]: row[1] for row in counts_result.all()}

    # Fetch existing assignments for this absence (to show current status per slot)
    assignments_result = await db.execute(
        select(models.ReliefAssignment).where(
            models.ReliefAssignment.absence_id == absence.id
        )
    )
    existing_assignments = {
        str(a.slot_id): a for a in assignments_result.scalars().all()
        if a.slot_id
    }

    # Fetch relief teacher names for assignments
    assigned_teacher_names: dict[str, str] = {}
    for slot_id_str, assignment in existing_assignments.items():
        if assignment.relief_teacher_id:
            t_result = await db.execute(
                select(models.Teacher).where(
                    models.Teacher.id == assignment.relief_teacher_id
                )
            )
            t = t_result.scalar_one_or_none()
            if t:
                assigned_teacher_names[slot_id_str] = t.name

    # Score each slot — now uses batched queries (fast)
    slots_output = []
    for slot in vacant_slots:
        ranked = await rank_candidates(
            absent_teacher=absent_teacher,
            slot=slot,
            weekly_counts=weekly_counts,
            db=db,
        )

        slot_id_str = str(slot.id)
        existing = existing_assignments.get(slot_id_str)

        slots_output.append({
            "slot_id":      slot_id_str,
            "period":       slot.period,
            "day_of_week":  slot.day_of_week,
            # Current assignment status for this slot
            "assignment": {
                "id":               str(existing.id) if existing else None,
                "status":           existing.status if existing else None,
                "relief_teacher_id": str(existing.relief_teacher_id) if existing and existing.relief_teacher_id else None,
                "relief_teacher_name": assigned_teacher_names.get(slot_id_str),
                "score":            existing.score if existing else None,
                "reason_text":      existing.reason_text if existing else None,
            } if existing else None,
            "candidates": [c.as_dict() for c in ranked],
        })

    return {
        "success":        True,
        "absence_id":     str(absence_id),
        "absent_teacher": absent_teacher.name,
        "date":           str(absence.date),
        "slots":          slots_output,
    }


# ─── Step 4: GET /relief/stream/{absence_id} — event-based SSE ───────────────

from fastapi import Query
from fastapi.security import OAuth2PasswordBearer

@router.get("/stream/{absence_id}")
async def stream_relief_candidates(
    absence_id: UUID,
    token: str = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    # Validate token manually since EventSource can't send headers
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    current_user = await auth.get_current_user_from_token(token, db)
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    absence_id_str = str(absence_id)

    async def event_generator():
        event = asyncio.Event()
        _absence_events[absence_id_str].add(event)

        try:
            # Send initial state immediately
            event.set()

            while True:
                await event.wait()
                event.clear()

                try:
                    result = await db.execute(
                        text("SELECT id FROM absences WHERE id = :id"),
                        {"id": absence_id_str}
                    )
                    row = result.fetchone()
                    if not row:
                        yield "event: error\ndata: {\"detail\": \"Absence not found\"}\n\n"
                        return

                    absence_result = await db.execute(
                        select(models.Absence).where(models.Absence.id == row[0])
                    )
                    absence = absence_result.scalar_one_or_none()
                    if not absence:
                        yield "event: error\ndata: {\"detail\": \"Absence not found\"}\n\n"
                        return

                    assignments_result = await db.execute(
                        select(models.ReliefAssignment).where(
                            models.ReliefAssignment.absence_id == row[0]
                        )
                    )
                    assignments = assignments_result.scalars().all()

                    # Fetch teacher names for assignments
                    teacher_names: dict[str, str] = {}
                    for a in assignments:
                        if a.relief_teacher_id:
                            t_result = await db.execute(
                                select(models.Teacher).where(
                                    models.Teacher.id == a.relief_teacher_id
                                )
                            )
                            t = t_result.scalar_one_or_none()
                            if t:
                                teacher_names[str(a.relief_teacher_id)] = t.name

                    payload = json.dumps({
                        "absence_id": absence_id_str,
                        "status":     absence.status,
                        "assignments": [
                            {
                                "id":                  str(a.id),
                                "slot_id":             str(a.slot_id) if a.slot_id else None,
                                "relief_teacher_id":   str(a.relief_teacher_id) if a.relief_teacher_id else None,
                                "relief_teacher_name": teacher_names.get(str(a.relief_teacher_id)) if a.relief_teacher_id else None,
                                "score":               a.score,
                                "status":              a.status,
                                "reason_text":         a.reason_text,
                            }
                            for a in assignments
                        ],
                    })

                    yield f"data: {payload}\n\n"

                except Exception as e:
                    yield f"event: error\ndata: {{\"detail\": \"{str(e)}\"}}\n\n"
                    return

                # Fallback poll every 30s in case push was missed
                try:
                    await asyncio.wait_for(event.wait(), timeout=30)
                except asyncio.TimeoutError:
                    event.set()  # trigger a refresh

        finally:
            _absence_events[absence_id_str].discard(event)
            if not _absence_events[absence_id_str]:
                del _absence_events[absence_id_str]

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

@router.get("/assigned")
async def get_assigned_absences(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns absences that have at least one relief assignment (for history view)."""
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    hod_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    hod = hod_result.scalar_one_or_none()

    # Get all absences that have assignments
    from sqlalchemy import distinct
    assigned_absence_ids_result = await db.execute(
        select(distinct(models.ReliefAssignment.absence_id))
    )
    assigned_ids = [row[0] for row in assigned_absence_ids_result.all()]

    if not assigned_ids:
        return {"success": True, "data": []}

    query = (
        select(models.Absence)
        .options(selectinload(models.Absence.teacher))
        .where(models.Absence.id.in_(assigned_ids))
        .order_by(models.Absence.date.desc())
    )

    if current_user.role == models.UserRole.HOD and hod and hod.department_id:
        query = query.join(models.Teacher).where(
            models.Teacher.department_id == hod.department_id
        )

    result = await db.execute(query)
    absences = result.scalars().all()

    output = []
    for absence in absences:
        assignments_result = await db.execute(
            select(models.ReliefAssignment).where(
                models.ReliefAssignment.absence_id == absence.id
            )
        )
        assignments = assignments_result.scalars().all()

        # Determine overall coverage status
        statuses = [a.status for a in assignments]
        if all(s == models.ReliefStatus.ACCEPTED for s in statuses):
            coverage = "covered"
        elif any(s == models.ReliefStatus.PENDING for s in statuses):
            coverage = "requested"
        else:
            coverage = "partial"

        output.append({
            "id": str(absence.id),
            "teacher_name": absence.teacher.name if absence.teacher else "Unknown",
            "date": str(absence.date),
            "leave_type": absence.leave_type,
            "period_start": absence.period_start,
            "period_end": absence.period_end,
            "status": absence.status,
            "coverage": coverage,
            "assignments": [
                {
                    "id": str(a.id),
                    "status": a.status,
                    "relief_teacher_id": str(a.relief_teacher_id) if a.relief_teacher_id else None,
                }
                for a in assignments
            ],
        })

    return {"success": True, "data": output}