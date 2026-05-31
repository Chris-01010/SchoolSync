# backend/relief_router.py
# Step 3 — Candidates endpoint + Step 4 — SSE stream
# Mounted in main.py as:  app.include_router(relief_router.router, prefix="/relief")

from __future__ import annotations

import asyncio
import json
from uuid import UUID
from typing import Optional
import datetime as dt

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db
from . import models, auth
from .relief_engine import rank_candidates

router = APIRouter()

class RespondRequest(BaseModel):
    response: str                   # "accepted", "rejected", "flagged"
    mode: Optional[str] = None      # "swap" or "consume" — required if accepted
    swap_slot_id: Optional[str] = None

class ConfirmConsumptionRequest(BaseModel):
    confirm: bool

async def _notify(user_id, title: str, content: str, db: AsyncSession):
    notif = models.Notification(user_id=user_id, title=title, content=content)
    db.add(notif)
    # caller must commit

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
    if not row:
        raise HTTPException(status_code=404, detail="Absence not found.")

    # Now fetch the ORM object using the confirmed string ID
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

# ─── EPIC-3: POST /relief/assignments/{assignment_id}/respond ─────────────────

@router.post("/assignments/{assignment_id}/respond")
async def respond_to_relief(
    assignment_id: UUID,
    body: RespondRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Load assignment
    result = await db.execute(
        select(models.ReliefAssignment).where(
            models.ReliefAssignment.id == str(assignment_id)
        )
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    # Auth: only the assigned relief teacher
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
    )
    current_teacher = teacher_result.scalar_one_or_none()
    if not current_teacher or str(current_teacher.id) != str(assignment.relief_teacher_id):
        raise HTTPException(status_code=403, detail="Not your assignment.")

    if assignment.status != models.ReliefStatus.PENDING:
        raise HTTPException(status_code=400, detail="Assignment is no longer pending.")

    # ── Reject / Flag (existing flow, unchanged) ──
if body.response == "rejected":
        assignment.status = models.ReliefStatus.REJECTED
        await db.commit()
        return {"status": "rejected"}

    if body.response == "flagged":
        raise HTTPException(
            status_code=403,
            detail="Teachers cannot flag relief requests."
        )

    if body.response != "accepted":
        raise HTTPException(status_code=400, detail="response must be 'accepted' or 'rejected'.")

    # ── Accepted — require mode ──

    # ── Accepted — require mode ──
    if body.mode not in ("swap", "consume"):
        raise HTTPException(status_code=400, detail="mode must be 'swap' or 'consume' when accepting.")

    # ── Load absence first (slot_id is None in seeded data) ──
    absence_result = await db.execute(
        select(models.Absence).where(models.Absence.id == str(assignment.absence_id))
    )
    absence = absence_result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found.")

    # Find absent slot dynamically from absence date + period
    day_of_week = absence.date.weekday()
    slot_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == str(absence.teacher_id),
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period == absence.period_start,
        )
    )
    absent_slot = slot_result.scalar_one_or_none()
    if not absent_slot:
        raise HTTPException(status_code=404, detail="Timetable slot not found for this absence.")

    absent_teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == str(absence.teacher_id))
    )
    absent_teacher = absent_teacher_result.scalar_one_or_none()

    # ── SWAP ──
    if body.mode == "swap":
        if not body.swap_slot_id:
            raise HTTPException(status_code=400, detail="swap_slot_id required for swap mode.")

        swap_result = await db.execute(
            select(models.TimetableSlot).where(
                models.TimetableSlot.id == str(body.swap_slot_id)
            )
        )
        swap_slot = swap_result.scalar_one_or_none()
        if not swap_slot:
            raise HTTPException(status_code=404, detail="Swap slot not found.")

        # Validations
        if str(swap_slot.teacher_id) != str(current_teacher.id):
            raise HTTPException(status_code=400, detail="Swap slot does not belong to you.")
        if swap_slot.is_relief:
            raise HTTPException(status_code=400, detail="Cannot swap a relief slot.")

        # FIX: timetable slots are weekly-recurring, so day_of_week < today_dow is NOT
        # "in the past" — it just means earlier in the week, which recurs next week.
        # Only block slots that are today at or before the current absent period.
        today_dow = dt.date.today().weekday()
        if swap_slot.day_of_week == today_dow and swap_slot.period <= absent_slot.period:
            raise HTTPException(status_code=422, detail="Can only swap a future period.")

        # Perform swap inside a transaction (AsyncSession auto-begins)
        # Lock order: lower UUID first to avoid deadlocks
        ids_ordered = sorted([str(absent_slot.id), str(swap_slot.id)])

        locked = []
        for sid in ids_ordered:
            r = await db.execute(
                select(models.TimetableSlot)
                .where(models.TimetableSlot.id == sid)
                .with_for_update()
            )
            locked.append(r.scalar_one())

        # Re-identify which is which after locking
        absent_locked = next(s for s in locked if str(s.id) == str(absent_slot.id))
        swap_locked = next(s for s in locked if str(s.id) == str(swap_slot.id))

        # Absent slot → now taught by substitute (relief)
        absent_locked.teacher_id = current_teacher.id
        absent_locked.is_relief = True
        absent_locked.original_teacher_id = absence.teacher_id

        # Substitute's slot → vacant
        swap_locked.teacher_id = None
        swap_locked.is_relief = False
        swap_locked.original_teacher_id = current_teacher.id

        assignment.status = models.ReliefStatus.ACCEPTED
        assignment.assignment_mode = models.AssignmentMode.SWAP
        assignment.swapped_slot_id = swap_slot.id
        assignment.acknowledged_at = dt.datetime.utcnow()

        await db.commit()
        return {"status": "accepted", "mode": "swap", "assignment_id": str(assignment.id)}

    # ── CONSUME ──
    # ── CONSUME ──
    if body.mode == "consume":
        # Clash check: relief teacher must not already have a slot on this day/period
        clash_result = await db.execute(
            select(models.TimetableSlot).where(
                models.TimetableSlot.teacher_id == str(current_teacher.id),
                models.TimetableSlot.day_of_week == day_of_week,
                models.TimetableSlot.period == absence.period_start,
            )
        )
        if clash_result.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="You already have a class at this time and cannot consume this slot."
            )

        r = await db.execute(
            select(models.TimetableSlot)
            .where(models.TimetableSlot.id == str(absent_slot.id))
            .with_for_update()
        )
        slot_locked = r.scalar_one()

        slot_locked.teacher_id = current_teacher.id
        slot_locked.is_relief = True
        slot_locked.original_teacher_id = absence.teacher_id

        assignment.status = models.ReliefStatus.AWAITING_CONFIRMATION
        assignment.assignment_mode = models.AssignmentMode.CONSUME
        assignment.consume_substitute_confirmed = True
        assignment.consume_absent_confirmed = False
        assignment.acknowledged_at = dt.datetime.utcnow()

        # In-app notification to absent teacher
        if absent_teacher:
            absent_user_result = await db.execute(
                select(models.User).where(models.User.id == str(absent_teacher.user_id))
            )
            absent_user = absent_user_result.scalar_one_or_none()
            if absent_user:
                await _notify(
                    absent_user.id,
                    "Relief consume request pending",
                    f"{current_teacher.name} has offered to cover your class as extra work. Please approve or reject.",
                    db,
                )

        await db.commit()
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=202,
            content={"status": "awaiting_confirmation", "assignment_id": str(assignment.id)}
        )


# ─── EPIC-3: POST /relief/assignments/{assignment_id}/confirm-consumption ─────

@router.post("/assignments/{assignment_id}/confirm-consumption")
async def confirm_consumption(
    assignment_id: UUID,
    body: ConfirmConsumptionRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.ReliefAssignment).where(
            models.ReliefAssignment.id == str(assignment_id)
        )
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    if assignment.status != models.ReliefStatus.AWAITING_CONFIRMATION:
        raise HTTPException(status_code=400, detail="Assignment is not awaiting confirmation.")
    if assignment.assignment_mode != models.AssignmentMode.CONSUME:
        raise HTTPException(status_code=400, detail="Not a consume assignment.")

    # Auth: only the absent teacher
    absence_result = await db.execute(
        select(models.Absence).where(models.Absence.id == str(assignment.absence_id))
    )
    absence = absence_result.scalar_one_or_none()

    absent_teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == str(absence.teacher_id))
    )
    absent_teacher = absent_teacher_result.scalar_one_or_none()

    if not absent_teacher or str(absent_teacher.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the absent teacher can confirm.")

    # Find slot dynamically (slot_id may be None in seeded data)
    day_of_week = absence.date.weekday()
    slot_result = await db.execute(
        select(models.TimetableSlot)
        .where(
            models.TimetableSlot.teacher_id == str(assignment.relief_teacher_id),
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period == absence.period_start,
        )
        .with_for_update()
    )
    slot = slot_result.scalar_one_or_none()

    if body.confirm:
        # Workload cap check
        sub_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == str(assignment.relief_teacher_id))
        )
        substitute = sub_result.scalar_one()

        if (
            substitute.weekly_relief_cap is not None
            and substitute.current_relief_hours + 1 > substitute.weekly_relief_cap
        ):
            raise HTTPException(status_code=400, detail="Substitute would exceed weekly relief cap.")

        substitute.current_relief_hours += 1
        substitute.total_hours_worked += 1
        absent_teacher.total_hours_worked = max(0, absent_teacher.total_hours_worked - 1)

        assignment.status = models.ReliefStatus.ACCEPTED
        assignment.consume_absent_confirmed = True

        await db.commit()
        return {"status": "confirmed"}

    else:
        # Reject: revert slot to absent teacher
        if not slot:
            raise HTTPException(status_code=404, detail="Relief slot not found — cannot revert.")

        slot.teacher_id = absence.teacher_id
        slot.is_relief = False
        slot.original_teacher_id = None

        assignment.status = models.ReliefStatus.REJECTED

        # Notify substitute that their consume request was rejected
        sub_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == str(assignment.relief_teacher_id))
        )
        substitute = sub_result.scalar_one_or_none()
        if substitute:
            sub_user_result = await db.execute(
                select(models.User).where(models.User.id == str(substitute.user_id))
            )
            sub_user = sub_user_result.scalar_one_or_none()
            if sub_user:
                await _notify(
                    sub_user.id,
                    "Consume request rejected",
                    f"{absent_teacher.name} has rejected your consume request. Your slot has been reverted.",
                    db,
                )

        await db.commit()
        return {"status": "rejected"}


# ─── EPIC-3: GET /relief/assignments/pending-consumption ──────────────────────

@router.get("/assignments/pending-consumption")
async def list_pending_consumption(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
    )
    current_teacher = teacher_result.scalar_one_or_none()
    if not current_teacher:
        return {"assignments": []}

    # Find absences belonging to this teacher
    absences_result = await db.execute(
        select(models.Absence).where(models.Absence.teacher_id == str(current_teacher.id))
    )
    absences = absences_result.scalars().all()
    absence_ids = [str(a.id) for a in absences]
    absence_map = {str(a.id): a for a in absences}

    if not absence_ids:
        return {"assignments": []}

    assignments_result = await db.execute(
        select(models.ReliefAssignment).where(
            models.ReliefAssignment.absence_id.in_(absence_ids),
            models.ReliefAssignment.status == models.ReliefStatus.AWAITING_CONFIRMATION,
            models.ReliefAssignment.assignment_mode == models.AssignmentMode.CONSUME,
        )
    )
    assignments = assignments_result.scalars().all()

    output = []
    for a in assignments:
        sub_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == str(a.relief_teacher_id))
        )
        sub = sub_result.scalar_one_or_none()

        # Find slot dynamically from absence
        absence = absence_map.get(str(a.absence_id))
        slot = None
        if absence:
            day_of_week = absence.date.weekday()
            slot_result = await db.execute(
                select(models.TimetableSlot).where(
                    models.TimetableSlot.day_of_week == day_of_week,
                    models.TimetableSlot.period == absence.period_start,
                    models.TimetableSlot.is_relief == True,
                )
            )
            slot = slot_result.scalar_one_or_none()

        output.append({
            "assignment_id": str(a.id),
            "substitute_name": sub.name if sub else None,
            "slot_day": slot.day_of_week if slot else (absence.date.weekday() if absence else None),
            "slot_period": slot.period if slot else (absence.period_start if absence else None),
            "assigned_at": str(a.assigned_at),
        })

    return {"assignments": output}

# ─── EPIC-3: GET /relief/my-slots — swap slot picker data ────────────────────

@router.get("/my-slots")
async def get_my_future_slots(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == str(current_user.id))
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        return {"slots": []}

    today_dow = dt.date.today().weekday()

    # FIX: fetch ALL non-relief slots, then exclude only today's already-passed periods.
    # day_of_week < today_dow is NOT "in the past" for recurring weekly slots —
    # a Monday slot on Wednesday is valid since it recurs next Monday.
    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == str(teacher.id),
            models.TimetableSlot.is_relief == False,
        )
    )
    all_slots = slots_result.scalars().all()

    # Filter out only: today's slots at or before the current period
    # Since we don't track clock time, conservatively exclude all of today's slots
    slots = [s for s in all_slots if s.day_of_week != today_dow]

    return {
        "slots": [
            {
                "slot_id": str(s.id),
                "day_of_week": s.day_of_week,
                "period": s.period,
                "subject_id": str(s.subject_id) if s.subject_id else None,
                "class_id": str(s.class_id) if s.class_id else None,
            }
            for s in slots
        ]
    }
