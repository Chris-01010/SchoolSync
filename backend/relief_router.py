# backend/relief_router.py
from __future__ import annotations

import asyncio
import json
from uuid import UUID
from collections import defaultdict
from typing import Optional
import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .database import get_db
from . import models, auth
from .relief_engine import rank_candidates

router = APIRouter()

# ─── In-memory pub/sub for SSE push ──────────────────────────────────────────
_absence_events: dict[str, set[asyncio.Event]] = defaultdict(set)


def notify_absence_updated(absence_id: str):
    for event in _absence_events.get(absence_id, set()):
        event.set()


class RespondRequest(BaseModel):
    response: str
    mode: Optional[str] = None
    swap_slot_id: Optional[str] = None


class ConfirmConsumptionRequest(BaseModel):
    confirm: bool


async def _notify(user_id, title: str, content: str, db: AsyncSession):
    notif = models.Notification(user_id=user_id, title=title, content=content)
    db.add(notif)


# ─── GET /relief/candidates/{absence_id} ─────────────────────────────────────

@router.get("/candidates/{absence_id}")
async def get_relief_candidates(
    absence_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    result = await db.execute(select(models.Absence).where(models.Absence.id == absence_id))
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found.")

    if current_user.role == models.UserRole.HOD:
        hod_result = await db.execute(
            select(models.Teacher).where(models.Teacher.user_id == current_user.id)
        )
        hod = hod_result.scalar_one_or_none()
        absent_teacher_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
        )
        absent_teacher_check = absent_teacher_result.scalar_one_or_none()
        if hod and absent_teacher_check and hod.department_id != absent_teacher_check.department_id:
            raise HTTPException(status_code=403, detail="You can only view relief candidates for your department.")

    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    absent_teacher = teacher_result.scalar_one_or_none()
    if not absent_teacher:
        raise HTTPException(status_code=404, detail="Absent teacher profile not found.")

    day_of_week = absence.date.weekday()
    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == absent_teacher.id,
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period >= absence.period_start,
            models.TimetableSlot.period <= absence.period_end,
            models.TimetableSlot.is_relief == False,
        )
    )
    vacant_slots = slots_result.scalars().all()

    if not vacant_slots:
        return {"success": True, "absence_id": str(absence_id), "slots": []}

    from datetime import timedelta
    from sqlalchemy import func as sa_func

    week_start = absence.date - timedelta(days=absence.date.weekday())
    week_end = week_start + timedelta(days=6)

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

    assignments_result = await db.execute(
        select(models.ReliefAssignment).where(models.ReliefAssignment.absence_id == absence.id)
    )
    existing_assignments = {
        str(a.slot_id): a for a in assignments_result.scalars().all() if a.slot_id
    }

    assigned_teacher_names: dict[str, str] = {}
    for slot_id_str, assignment in existing_assignments.items():
        if assignment.relief_teacher_id:
            t_result = await db.execute(
                select(models.Teacher).where(models.Teacher.id == assignment.relief_teacher_id)
            )
            t = t_result.scalar_one_or_none()
            if t:
                assigned_teacher_names[slot_id_str] = t.name

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
            "slot_id":     slot_id_str,
            "period":      slot.period,
            "day_of_week": slot.day_of_week,
            "assignment": {
                "id":                  str(existing.id) if existing else None,
                "status":              existing.status if existing else None,
                "relief_teacher_id":   str(existing.relief_teacher_id) if existing and existing.relief_teacher_id else None,
                "relief_teacher_name": assigned_teacher_names.get(slot_id_str),
                "score":               existing.score if existing else None,
                "reason_text":         existing.reason_text if existing else None,
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


# ─── POST /relief/auto-assign/{absence_id} ───────────────────────────────────

@router.post("/auto-assign/{absence_id}")
async def auto_assign_relief(
    absence_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import timedelta
    from sqlalchemy import func as sa_func
    from .leave_api import notify

    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    result = await db.execute(select(models.Absence).where(models.Absence.id == absence_id))
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found.")

    if current_user.role == models.UserRole.HOD:
        hod_result = await db.execute(
            select(models.Teacher).where(models.Teacher.user_id == current_user.id)
        )
        hod = hod_result.scalar_one_or_none()
        absent_t_result = await db.execute(
            select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
        )
        absent_t_check = absent_t_result.scalar_one_or_none()
        if hod and absent_t_check and hod.department_id != absent_t_check.department_id:
            raise HTTPException(status_code=403, detail="You can only manage relief for your department.")

    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    absent_teacher = teacher_result.scalar_one_or_none()
    if not absent_teacher:
        raise HTTPException(status_code=404, detail="Absent teacher not found.")

    day_of_week = absence.date.weekday()
    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == absent_teacher.id,
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period >= absence.period_start,
            models.TimetableSlot.period <= absence.period_end,
            models.TimetableSlot.is_relief == False,
        )
    )
    vacant_slots = slots_result.scalars().all()

    if not vacant_slots:
        return {
            "success": True,
            "absence_id": str(absence_id),
            "assignments": [{
                "slot_id": None,
                "period": f"P{absence.period_start}–P{absence.period_end}",
                "teacher_name": None,
                "teacher_id": None,
                "status": "no_candidate",
                "message": (
                    f"No timetable slots found for {absent_teacher.name} on "
                    f"{absence.date} (day {day_of_week}), "
                    f"periods {absence.period_start}–{absence.period_end}. "
                    f"The timetable may not cover these periods."
                ),
            }],
            "summary": {"assigned": 0, "skipped_already_active": 0, "no_candidate": 1},
            "message": f"No timetable slots found for {absent_teacher.name}. The timetable may not cover these periods.",
        }

    week_start = absence.date - timedelta(days=absence.date.weekday())
    week_end = week_start + timedelta(days=6)
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
    weekly_counts = {row[0]: row[1] for row in counts_result.all()}

    existing_result = await db.execute(
        select(models.ReliefAssignment).where(
            models.ReliefAssignment.absence_id == absence.id,
            models.ReliefAssignment.slot_id.isnot(None),
        )
    )
    existing_by_slot = {str(a.slot_id): a for a in existing_result.scalars().all()}

    subject_map: dict[str, str] = {}
    subject_ids = [s.subject_id for s in vacant_slots if s.subject_id]
    if subject_ids:
        subj_result = await db.execute(
            select(models.Subject).where(models.Subject.id.in_(subject_ids))
        )
        for subj in subj_result.scalars().all():
            subject_map[str(subj.id)] = subj.name

    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    day_label = day_names[day_of_week] if day_of_week < 5 else f"Day {day_of_week}"

    assignments_made = []
    pending_notifications = []

    for slot in vacant_slots:
        slot_id_str = str(slot.id)
        existing = existing_by_slot.get(slot_id_str)

        if existing and existing.status in (models.ReliefStatus.PENDING, models.ReliefStatus.ACCEPTED):
            assignments_made.append({
                "slot_id": slot_id_str,
                "period": slot.period,
                "teacher_name": None,
                "teacher_id": None,
                "status": "skipped",
                "message": f"Period {slot.period} already has an active assignment.",
            })
            continue

        ranked = await rank_candidates(
            absent_teacher=absent_teacher,
            slot=slot,
            weekly_counts=weekly_counts,
            db=db,
        )

        if not ranked:
            assignments_made.append({
                "slot_id": slot_id_str,
                "period": slot.period,
                "teacher_name": None,
                "teacher_id": None,
                "status": "no_candidate",
                "message": "No eligible teacher found for this period.",
            })
            continue

        top = ranked[0]
        subject_name = subject_map.get(str(slot.subject_id), "a class") if slot.subject_id else "a class"

        if existing:
            existing.relief_teacher_id = top.teacher.id
            existing.score = top.total_score
            existing.status = models.ReliefStatus.PENDING
            existing.reason_text = _build_auto_reason(top)
            existing.assignment_mode = None
            existing.acknowledged_at = None
        else:
            new_assignment = models.ReliefAssignment(
                absence_id=absence.id,
                slot_id=slot.id,
                relief_teacher_id=top.teacher.id,
                score=top.total_score,
                status=models.ReliefStatus.PENDING,
                reason_text=_build_auto_reason(top),
                assignment_mode=None,
            )
            db.add(new_assignment)

        if top.teacher.user_id:
            pending_notifications.append((
                top.teacher.user_id,
                "New Relief Assignment",
                (
                    f"You have been assigned to cover {subject_name} "
                    f"(Period {slot.period}, {day_label}) "
                    f"for {absent_teacher.name}. Please accept or reject."
                ),
            ))

        weekly_counts[top.teacher.id] = weekly_counts.get(top.teacher.id, 0) + 1
        assignments_made.append({
            "slot_id": slot_id_str,
            "period": slot.period,
            "teacher_name": top.teacher.name,
            "teacher_id": str(top.teacher.id),
            "score": top.total_score,
            "status": "assigned",
            "message": f"Request sent to {top.teacher.name}",
        })

    await db.commit()

    for user_id, title, content in pending_notifications:
        background_tasks.add_task(
            notify, db, user_id, title, content,
            "RELIEF_REQUEST", "/dashboard/relief-duties",
        )

    notify_absence_updated(str(absence_id))

    assigned_count = sum(1 for a in assignments_made if a["status"] == "assigned")
    skipped_count  = sum(1 for a in assignments_made if a["status"] == "skipped")
    no_cand_count  = sum(1 for a in assignments_made if a["status"] == "no_candidate")

    return {
        "success": True,
        "absence_id": str(absence_id),
        "assignments": assignments_made,
        "summary": {
            "assigned": assigned_count,
            "skipped_already_active": skipped_count,
            "no_candidate": no_cand_count,
        },
        "message": (
            f"Auto-assigned {assigned_count} slot(s)."
            + (f" {skipped_count} already active." if skipped_count else "")
            + (f" {no_cand_count} had no eligible teacher." if no_cand_count else "")
        ),
    }


def _build_auto_reason(candidate) -> str:
    b = candidate.breakdown
    parts = []
    if b.get("p1_continuity"):  parts.append("class continuity")
    if b.get("p2_expertise"):   parts.append("subject match")
    if b.get("p3_department"):  parts.append("same dept")
    if b.get("fairness"):       parts.append(f"fairness +{b['fairness']}")
    return f"Auto (score {candidate.total_score}): " + (", ".join(parts) or "fallback")


# ─── GET /relief/debug/{absence_id} ──────────────────────────────────────────

@router.get("/debug/{absence_id}")
async def debug_relief_candidates(
    absence_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.Absence).where(models.Absence.id == absence_id))
    absence = result.scalar_one_or_none()
    if not absence:
        return {"error": "Absence not found"}

    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    absent_teacher = teacher_result.scalar_one_or_none()

    day_of_week = absence.date.weekday()
    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == absent_teacher.id,
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period >= absence.period_start,
            models.TimetableSlot.period <= absence.period_end,
            models.TimetableSlot.is_relief == False,
        )
    )
    vacant_slots = slots_result.scalars().all()

    if not vacant_slots:
        return {
            "error": "No vacant slots found for this absence",
            "absence_date": str(absence.date),
            "day_of_week": day_of_week,
            "period_start": absence.period_start,
            "period_end": absence.period_end,
            "absent_teacher": absent_teacher.name if absent_teacher else None,
        }

    slot = vacant_slots[0]
    period = slot.period

    busy_result = await db.execute(
        select(models.TimetableSlot.teacher_id).where(
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period == period,
            models.TimetableSlot.is_relief == False,
        )
    )
    busy_ids = {str(row[0]) for row in busy_result.all()}

    all_result = await db.execute(
        select(models.Teacher).where(models.Teacher.is_active == True)
    )
    all_teachers = all_result.scalars().all()

    blocked_reasons = []
    eligible_count = 0

    for t in all_teachers:
        tid = str(t.id)
        if tid == str(absent_teacher.id):
            blocked_reasons.append({"name": t.name, "reason": "is_absent_teacher"})
            continue
        if tid in busy_ids:
            blocked_reasons.append({"name": t.name, "reason": f"busy_at_day{day_of_week}_period{period}"})
            continue
        if t.weekly_relief_cap is not None and t.current_relief_hours >= t.weekly_relief_cap:
            blocked_reasons.append({"name": t.name, "reason": f"relief_cap_hit: {t.current_relief_hours}/{t.weekly_relief_cap}"})
            continue
        if t.max_weekly_hours is not None and t.total_hours_worked >= t.max_weekly_hours:
            blocked_reasons.append({"name": t.name, "reason": f"max_hours_hit: {t.total_hours_worked}/{t.max_weekly_hours}"})
            continue
        eligible_count += 1

    return {
        "absence_date": str(absence.date),
        "day_of_week": day_of_week,
        "period_checked": period,
        "absent_teacher": absent_teacher.name if absent_teacher else None,
        "vacant_slots_found": len(vacant_slots),
        "total_active_teachers": len(all_teachers),
        "eligible_count": eligible_count,
        "blocked_sample": blocked_reasons[:20],
    }


# ─── GET /relief/stream/{absence_id} — SSE ───────────────────────────────────

@router.get("/stream/{absence_id}")
async def stream_relief_candidates(
    absence_id: UUID,
    token: str = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
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
            event.set()
            while True:
                await event.wait()
                event.clear()
                try:
                    absence_result = await db.execute(
                        select(models.Absence).where(models.Absence.id == absence_id)
                    )
                    absence = absence_result.scalar_one_or_none()
                    if not absence:
                        yield "event: error\ndata: {\"detail\": \"Absence not found\"}\n\n"
                        return

                    assignments_result = await db.execute(
                        select(models.ReliefAssignment).where(
                            models.ReliefAssignment.absence_id == absence_id
                        )
                    )
                    assignments = assignments_result.scalars().all()

                    teacher_names: dict[str, str] = {}
                    for a in assignments:
                        if a.relief_teacher_id:
                            t_result = await db.execute(
                                select(models.Teacher).where(models.Teacher.id == a.relief_teacher_id)
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

                try:
                    await asyncio.wait_for(event.wait(), timeout=30)
                except asyncio.TimeoutError:
                    event.set()

        finally:
            _absence_events[absence_id_str].discard(event)
            if not _absence_events[absence_id_str]:
                del _absence_events[absence_id_str]

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ─── GET /relief/assigned ─────────────────────────────────────────────────────

@router.get("/assigned")
async def get_assigned_absences(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in (models.UserRole.HOD, models.UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    hod_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    hod = hod_result.scalar_one_or_none()

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
            select(models.ReliefAssignment).where(models.ReliefAssignment.absence_id == absence.id)
        )
        assignments = assignments_result.scalars().all()
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


# ─── POST /relief/assignments/{assignment_id}/respond ────────────────────────

@router.post("/assignments/{assignment_id}/respond")
async def respond_to_relief(
    assignment_id: UUID,
    body: RespondRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.ReliefAssignment).where(models.ReliefAssignment.id == str(assignment_id))
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    current_teacher = teacher_result.scalar_one_or_none()
    if not current_teacher or str(current_teacher.id) != str(assignment.relief_teacher_id):
        raise HTTPException(status_code=403, detail="Not your assignment.")

    if assignment.status != models.ReliefStatus.PENDING:
        raise HTTPException(status_code=400, detail="Assignment is no longer pending.")

    if body.response == "rejected":
        assignment.status = models.ReliefStatus.REJECTED
        await db.commit()
        return {"status": "rejected"}

    if body.response == "flagged":
        raise HTTPException(status_code=403, detail="Teachers cannot flag relief requests.")

    if body.response != "accepted":
        raise HTTPException(status_code=400, detail="response must be 'accepted' or 'rejected'.")

    if body.mode not in ("swap", "consume"):
        raise HTTPException(status_code=400, detail="mode must be 'swap' or 'consume' when accepting.")

    absence_result = await db.execute(
        select(models.Absence).where(models.Absence.id == str(assignment.absence_id))
    )
    absence = absence_result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found.")

    day_of_week = absence.date.weekday()
    slot_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == absence.teacher_id,
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period == absence.period_start,
        )
    )
    absent_slot = slot_result.scalar_one_or_none()
    if not absent_slot:
        raise HTTPException(status_code=404, detail="Timetable slot not found for this absence.")

    absent_teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    absent_teacher = absent_teacher_result.scalar_one_or_none()

    # ── SWAP ──
    if body.mode == "swap":
        if not body.swap_slot_id:
            raise HTTPException(status_code=400, detail="swap_slot_id required for swap mode.")

        swap_result = await db.execute(
            select(models.TimetableSlot).where(models.TimetableSlot.id == str(body.swap_slot_id))
        )
        swap_slot = swap_result.scalar_one_or_none()
        if not swap_slot:
            raise HTTPException(status_code=404, detail="Swap slot not found.")
        if str(swap_slot.teacher_id) != str(current_teacher.id):
            raise HTTPException(status_code=400, detail="Swap slot does not belong to you.")
        if swap_slot.is_relief:
            raise HTTPException(status_code=400, detail="Cannot swap a relief slot.")

        today_dow = dt.date.today().weekday()
        if swap_slot.day_of_week == today_dow and swap_slot.period <= absent_slot.period:
            raise HTTPException(status_code=422, detail="Can only swap a future period.")

        ids_ordered = sorted([str(absent_slot.id), str(swap_slot.id)])
        locked = []
        for sid in ids_ordered:
            r = await db.execute(
                select(models.TimetableSlot)
                .where(models.TimetableSlot.id == sid)
                .with_for_update()
            )
            locked.append(r.scalar_one())

        absent_locked = next(s for s in locked if str(s.id) == str(absent_slot.id))
        swap_locked   = next(s for s in locked if str(s.id) == str(swap_slot.id))

        absent_locked.teacher_id          = current_teacher.id
        absent_locked.is_relief           = True
        absent_locked.original_teacher_id = absence.teacher_id

        swap_locked.teacher_id          = None
        swap_locked.is_relief           = False
        swap_locked.original_teacher_id = current_teacher.id

        assignment.status          = models.ReliefStatus.ACCEPTED
        assignment.assignment_mode = models.AssignmentMode.SWAP
        assignment.swapped_slot_id = swap_slot.id
        assignment.acknowledged_at = dt.datetime.utcnow()

        await db.commit()
        return {"status": "accepted", "mode": "swap", "assignment_id": str(assignment.id)}

    # ── CONSUME ──
    if body.mode == "consume":
        clash_result = await db.execute(
            select(models.TimetableSlot).where(
                models.TimetableSlot.teacher_id == current_teacher.id,
                models.TimetableSlot.day_of_week == day_of_week,
                models.TimetableSlot.period == absence.period_start,
            )
        )
        if clash_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="You already have a class at this time.")

        r = await db.execute(
            select(models.TimetableSlot)
            .where(models.TimetableSlot.id == str(absent_slot.id))
            .with_for_update()
        )
        slot_locked = r.scalar_one()

        slot_locked.teacher_id          = current_teacher.id
        slot_locked.is_relief           = True
        slot_locked.original_teacher_id = absence.teacher_id

        assignment.status                      = models.ReliefStatus.AWAITING_CONFIRMATION
        assignment.assignment_mode             = models.AssignmentMode.CONSUME
        assignment.consume_substitute_confirmed = True
        assignment.consume_absent_confirmed    = False
        assignment.acknowledged_at             = dt.datetime.utcnow()

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
        return JSONResponse(
            status_code=202,
            content={"status": "awaiting_confirmation", "assignment_id": str(assignment.id)}
        )


# ─── POST /relief/assignments/{assignment_id}/confirm-consumption ─────────────

@router.post("/assignments/{assignment_id}/confirm-consumption")
async def confirm_consumption(
    assignment_id: UUID,
    body: ConfirmConsumptionRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.ReliefAssignment).where(models.ReliefAssignment.id == str(assignment_id))
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
    if assignment.status != models.ReliefStatus.AWAITING_CONFIRMATION:
        raise HTTPException(status_code=400, detail="Assignment is not awaiting confirmation.")
    if assignment.assignment_mode != models.AssignmentMode.CONSUME:
        raise HTTPException(status_code=400, detail="Not a consume assignment.")

    absence_result = await db.execute(
        select(models.Absence).where(models.Absence.id == str(assignment.absence_id))
    )
    absence = absence_result.scalar_one_or_none()

    absent_teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    absent_teacher = absent_teacher_result.scalar_one_or_none()

    if not absent_teacher or str(absent_teacher.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the absent teacher can confirm.")

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
        substitute.total_hours_worked   += 1
        absent_teacher.total_hours_worked = max(0, absent_teacher.total_hours_worked - 1)

        assignment.status                   = models.ReliefStatus.ACCEPTED
        assignment.consume_absent_confirmed = True

        await db.commit()
        return {"status": "confirmed"}

    else:
        if not slot:
            raise HTTPException(status_code=404, detail="Relief slot not found — cannot revert.")

        slot.teacher_id          = absence.teacher_id
        slot.is_relief           = False
        slot.original_teacher_id = None

        assignment.status = models.ReliefStatus.REJECTED

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


# ─── GET /relief/assignments/pending-consumption ──────────────────────────────

@router.get("/assignments/pending-consumption")
async def list_pending_consumption(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    current_teacher = teacher_result.scalar_one_or_none()
    if not current_teacher:
        return {"assignments": []}

    absences_result = await db.execute(
        select(models.Absence).where(models.Absence.teacher_id == current_teacher.id)
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
            "assignment_id":   str(a.id),
            "substitute_name": sub.name if sub else None,
            "slot_day":        slot.day_of_week if slot else (absence.date.weekday() if absence else None),
            "slot_period":     slot.period if slot else (absence.period_start if absence else None),
            "assigned_at":     str(a.assigned_at),
        })

    return {"assignments": output}


# ─── GET /relief/my-slots ─────────────────────────────────────────────────────

@router.get("/my-slots")
async def get_my_future_slots(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        return {"slots": []}

    today_dow = dt.date.today().weekday()

    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == str(teacher.id),
            models.TimetableSlot.is_relief == False,
        )
    )
    all_slots = slots_result.scalars().all()
    slots = [s for s in all_slots if s.day_of_week != today_dow]

    return {
        "slots": [
            {
                "slot_id":    str(s.id),
                "day_of_week": s.day_of_week,
                "period":     s.period,
                "subject_id": str(s.subject_id) if s.subject_id else None,
                "class_id":   str(s.class_id) if s.class_id else None,
            }
            for s in slots
        ]
    }