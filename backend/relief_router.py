# backend/relief_router.py
# Step 3 — Candidates endpoint + Step 4 — SSE stream
# Mounted in main.py as:  app.include_router(relief_router.router, prefix="/relief")

from __future__ import annotations

import asyncio
import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db
from . import models, auth
from .relief_engine import rank_candidates

router = APIRouter()


# ─── Step 3: GET /relief/candidates/{absence_id} ──────────────────────────────

@router.get("/candidates/{absence_id}")
async def get_relief_candidates(
    absence_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    # Fetch absence — use raw text query to avoid GUID type mismatch on SQLite
    absence_id_str = str(absence_id)
    r = await db.execute(
        text("SELECT id, teacher_id, date, period_start, period_end, status FROM absences WHERE id = :id"),
        {"id": absence_id_str}
    )
    row = r.fetchone()
    print(f"DEBUG raw row={row}")
    if not row:
        raise HTTPException(status_code=404, detail="Absence not found.")

    # Now fetch the ORM object using the confirmed string ID
    result = await db.execute(
        select(models.Absence).where(models.Absence.id == row[0])
    )
    absence = result.scalar_one_or_none()
    print(f"DEBUG ORM absence={absence}")
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
        absent_teacher = absent_teacher_result.scalar_one_or_none()

        if hod and absent_teacher and hod.department_id != absent_teacher.department_id:
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

    print(f"DEBUG day_of_week={day_of_week} period_start={absence.period_start} period_end={absence.period_end} slots={len(vacant_slots)}")

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

    # Score each slot
    slots_output = []
    for slot in vacant_slots:
        ranked = await rank_candidates(
            absent_teacher=absent_teacher,
            slot=slot,
            weekly_counts=weekly_counts,
            db=db,
        )
        slots_output.append({
            "slot_id":     str(slot.id),
            "period":      slot.period,
            "day_of_week": slot.day_of_week,
            "candidates":  [c.as_dict() for c in ranked],
        })

    return {
        "success":        True,
        "absence_id":     str(absence_id),
        "absent_teacher": absent_teacher.name,
        "date":           str(absence.date),
        "slots":          slots_output,
    }


# ─── Step 4: GET /relief/stream/{absence_id} ─────────────────────────────────

@router.get("/stream/{absence_id}")
async def stream_relief_candidates(
    absence_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    async def event_generator():
        last_payload: str | None = None

        while True:
            try:
                result = await db.execute(
                    text("SELECT id FROM absences WHERE id = :id"),
                    {"id": str(absence_id)}
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

                payload = json.dumps({
                    "absence_id": str(absence_id),
                    "status":     absence.status,
                    "assignments": [
                        {
                            "id":                str(a.id),
                            "slot_id":           str(a.slot_id) if a.slot_id else None,
                            "relief_teacher_id": str(a.relief_teacher_id) if a.relief_teacher_id else None,
                            "score":             a.score,
                            "status":            a.status,
                            "reason_text":       a.reason_text,
                        }
                        for a in assignments
                    ],
                })

                if payload != last_payload:
                    yield f"data: {payload}\n\n"
                    last_payload = payload

            except Exception as e:
                yield f"event: error\ndata: {{\"detail\": \"{str(e)}\"}}\n\n"
                return

            await asyncio.sleep(10)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
from .relief_dispatch import dispatch_to_pool
from .relief_engine import rank_candidates

@router.post("/dispatch/{absence_id}")
async def dispatch_relief(
    absence_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """HOD/Admin triggers dispatch after reviewing candidates."""
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(403, "HOD or Admin only.")

    # Load absence + absent teacher (same pattern as your candidates endpoint)
    from sqlalchemy import text
    r = await db.execute(text("SELECT id FROM absences WHERE id = :id"), {"id": str(absence_id)})
    row = r.fetchone()
    if not row:
        raise HTTPException(404, "Absence not found.")

    absence_result = await db.execute(select(models.Absence).where(models.Absence.id == row[0]))
    absence = absence_result.scalar_one_or_none()

    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.id == str(absence.teacher_id)))
    absent_teacher = teacher_result.scalar_one_or_none()

    # Get the first vacant slot (extend to loop over all slots if needed)
    day_of_week = absence.date.weekday()
    slot_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == str(absence.teacher_id),
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period >= absence.period_start,
            models.TimetableSlot.period <= absence.period_end,
            models.TimetableSlot.is_relief == False,
        )
    )
    slot = slot_result.scalars().first()
    if not slot:
        raise HTTPException(404, "No vacant slot found for this absence.")

    ranked = await rank_candidates(absent_teacher, slot, weekly_counts={}, db=db)
    if not ranked:
        raise HTTPException(404, "No eligible teachers in pool.")

    # Create the ReliefAssignment and dispatch
    assignment = models.ReliefAssignment(
        absence_id=absence.id,
        slot_id=slot.id,
        score=ranked[0].total_score,
        status=models.ReliefStatus.PENDING,
        reason_text=ranked[0].breakdown.__str__(),
    )
    db.add(assignment)
    await db.flush()
    await dispatch_to_pool(assignment, ranked, db)

    return {"detail": "Dispatched.", "assignment_id": str(assignment.id)}


@router.put("/assignments/{assignment_id}/accept")
async def accept_relief(
    assignment_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    teacher = teacher_result.scalar_one_or_none()

    result = await db.execute(select(models.ReliefAssignment).where(models.ReliefAssignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(404, "Not found.")
    if str(assignment.relief_teacher_id) != str(teacher.id):
        raise HTTPException(403, "This request is not assigned to you.")
    if assignment.status != models.ReliefStatus.PENDING:
        raise HTTPException(409, f"Status is {assignment.status}, not PENDING.")

    assignment.status = models.ReliefStatus.ACCEPTED
    assignment.acknowledged_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Accepted."}


@router.put("/assignments/{assignment_id}/decline")
async def decline_relief(
    assignment_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from .relief_dispatch import _send_to_current, DEADLINE_MINUTES
    teacher_result = await db.execute(select(models.Teacher).where(models.Teacher.user_id == current_user.id))
    teacher = teacher_result.scalar_one_or_none()

    result = await db.execute(select(models.ReliefAssignment).where(models.ReliefAssignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(404, "Not found.")
    if str(assignment.relief_teacher_id) != str(teacher.id):
        raise HTTPException(403, "This request is not assigned to you.")
    if assignment.status != models.ReliefStatus.PENDING:
        raise HTTPException(409, f"Status is {assignment.status}, not PENDING.")

    assignment.status = models.ReliefStatus.DECLINED
    assignment.rank_index += 1
    await _send_to_current(assignment, DEADLINE_MINUTES, db)
    return {"detail": "Declined. Rolled to next candidate."}