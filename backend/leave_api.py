# backend/leave_api.py

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from enum import Enum
from sqlalchemy.orm import selectinload

from .database import get_db
from . import models
from . import auth

router = APIRouter()


# ─── Schemas ──────────────────────────────────────────────────────────────────

class LeaveType(str, Enum):
    SICK = "sick"
    CASUAL = "casual"
    OTHER = "other"


class HODAction(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    CLARIFY = "clarify"


class LeaveApplyRequest(BaseModel):
    date: str
    period_start: int
    period_end: int
    leave_type: LeaveType
    reason: str
    handover_url: Optional[str] = None


class HODActionRequest(BaseModel):
    action: HODAction
    note: Optional[str] = None


class ReliefRespondRequest(BaseModel):
    status: models.ReliefStatus
    flag_reason: Optional[str] = None


class AdminOverrideRequest(BaseModel):
    relief_teacher_id: UUID
    override_note: Optional[str] = None


class HODAssignReliefRequest(BaseModel):
    relief_teacher_id: UUID
    note: Optional[str] = None


class LeaveEditRequest(BaseModel):
    date: str
    leave_type: LeaveType
    reason: str
    handover_url: Optional[str] = None


# ─── Helper: send notification ────────────────────────────────────────────────

async def notify(
    db: AsyncSession,
    user_id: UUID,
    title: str,
    content: str,
    notification_type: str = "general",
    action_url: Optional[str] = None,
):
    """Save an in-app notification. Never raises."""
    from .database import AsyncSessionLocal
    try:
        async with AsyncSessionLocal() as session:
            notif = models.Notification(
                user_id=user_id,
                title=title,
                content=content,
                notification_type=notification_type,
                action_url=action_url,
            )
            session.add(notif)
            await session.commit()
    except Exception as e:
        print(f"[NOTIFICATION ERROR] {e}")


# ─── Helper: rollover to next candidate (FR-20) ───────────────────────────────

async def _rollover_relief(assignment_id: UUID, db: AsyncSession):
    from .relief_engine import rank_candidates

    result = await db.execute(
        select(models.ReliefAssignment).where(models.ReliefAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment or not assignment.slot_id:
        print(f"[ROLLOVER] Assignment {assignment_id} not found or has no slot.")
        return

    slot_result = await db.execute(
        select(models.TimetableSlot).where(models.TimetableSlot.id == assignment.slot_id)
    )
    slot = slot_result.scalar_one_or_none()
    if not slot:
        print(f"[ROLLOVER] Slot not found for assignment {assignment_id}.")
        return

    absence_result = await db.execute(
        select(models.Absence).where(models.Absence.id == assignment.absence_id)
    )
    absence = absence_result.scalar_one_or_none()
    if not absence:
        return

    absent_teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    absent_teacher = absent_teacher_result.scalar_one_or_none()
    if not absent_teacher:
        return

    rejected_result = await db.execute(
        select(models.ReliefAssignment.relief_teacher_id).where(
            models.ReliefAssignment.absence_id == assignment.absence_id,
            models.ReliefAssignment.slot_id == assignment.slot_id,
            models.ReliefAssignment.status == models.ReliefStatus.REJECTED,
        )
    )
    rejected_ids = {row[0] for row in rejected_result.all()}

    ranked = await rank_candidates(
        absent_teacher=absent_teacher,
        slot=slot,
        weekly_counts={},
        db=db,
    )

    next_candidate = next(
        (c for c in ranked if c.teacher.id not in rejected_ids), None
    )

    if not next_candidate:
        print(f"[ROLLOVER] No more candidates for slot {assignment.slot_id}.")
        assignment.reason_text = "All candidates exhausted — manual assignment required."
        await db.commit()
        return

    assignment.relief_teacher_id = next_candidate.teacher.id
    assignment.score = next_candidate.total_score
    assignment.status = models.ReliefStatus.PENDING
    assignment.acknowledged_at = None
    assignment.reason_text = f"Rollover: previous teacher rejected."
    await db.commit()
    print(f"[ROLLOVER] Reassigned slot {assignment.slot_id} to {next_candidate.teacher.name}.")


# ─── Helper: dispatch relief ──────────────────────────────────────────────────

async def dispatch_relief_for_absence(absence_id: UUID, db: AsyncSession):
    from .relief_engine import rank_candidates
    from sqlalchemy import func as sa_func
    from datetime import timedelta

    result = await db.execute(
        select(models.Absence).where(models.Absence.id == absence_id)
    )
    absence = result.scalar_one_or_none()
    if not absence:
        print("[RELIEF] Absence not found.")
        return

    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    absent_teacher = teacher_result.scalar_one_or_none()
    if not absent_teacher:
        print("[RELIEF] Absent teacher profile not found.")
        return

    day_of_week = absence.date.weekday()

    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == absence.teacher_id,
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period >= absence.period_start,
            models.TimetableSlot.period <= absence.period_end,
            models.TimetableSlot.is_relief == False,
        )
    )
    vacant_slots = slots_result.scalars().all()

    if not vacant_slots:
        print("[RELIEF] No timetable slots found for this absence.")
        return

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

    assigned = 0
    for slot in vacant_slots:
        ranked = await rank_candidates(
            absent_teacher=absent_teacher,
            slot=slot,
            weekly_counts=weekly_counts,
            db=db,
        )
        top = ranked[0] if ranked else None
        relief_assignment = models.ReliefAssignment(
            absence_id=absence.id,
            slot_id=slot.id,
            relief_teacher_id=top.teacher.id if top else None,
            score=top.total_score if top else 0,
            status=models.ReliefStatus.PENDING,
            reason_text=_build_reason(top) if top else "No eligible teacher found.",
        )
        db.add(relief_assignment)
        if top:
            weekly_counts[top.teacher.id] = weekly_counts.get(top.teacher.id, 0) + 1
        assigned += 1

    await db.commit()
    print(f"[RELIEF] Created {assigned} relief assignments for absence {absence_id}.")


def _build_reason(candidate) -> str:
    b = candidate.breakdown
    parts = []
    if b.get("p1_continuity"):  parts.append("class continuity")
    if b.get("p2_expertise"):   parts.append("subject match")
    if b.get("p3_department"):  parts.append("same dept")
    if b.get("fairness"):       parts.append(f"fairness +{b['fairness']}")
    return f"Score {candidate.total_score}: " + (", ".join(parts) or "fallback")


# ─────────────────────────────────────────────────────────────────────────────
# TEACHER: Submit a leave request
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/apply", status_code=201)
async def apply_leave(
    body: LeaveApplyRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")

    absence = models.Absence(
        teacher_id=teacher.id,
        date=datetime.strptime(body.date, "%Y-%m-%d").date(),
        period_start=body.period_start,
        period_end=body.period_end,
        leave_type=body.leave_type.value,
        reason=body.reason,
        handover_url=body.handover_url,
        status=models.AbsenceStatus.PENDING,
    )
    db.add(absence)
    await db.commit()
    await db.refresh(absence)

    background_tasks.add_task(
        notify, db, current_user.id,
        "Leave Request Submitted",
        f"Your {body.leave_type.value} leave on {body.date} has been submitted and is pending HOD approval.",
    )

    if teacher.department_id:
        dept_result = await db.execute(
            select(models.Department).where(models.Department.id == teacher.department_id)
        )
        dept = dept_result.scalar_one_or_none()
        if dept and dept.hod_id:
            hod_result = await db.execute(
                select(models.Teacher).where(models.Teacher.id == dept.hod_id)
            )
            hod = hod_result.scalar_one_or_none()
            if hod and hod.user_id:
                background_tasks.add_task(
                    notify, db, hod.user_id,
                    "New Leave Request",
                    f"{teacher.name} has applied for {body.leave_type.value} leave on {body.date}.",
                )

    return {
        "success": True,
        "message": "Leave request submitted successfully.",
        "data": {
            "id": str(absence.id),
            "date": str(absence.date),
            "leave_type": absence.leave_type,
            "status": absence.status,
            "reason": absence.reason,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# TEACHER: View my own leave requests
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/my")
async def get_my_leaves(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")

    leaves_result = await db.execute(
        select(models.Absence)
        .where(models.Absence.teacher_id == teacher.id)
        .order_by(models.Absence.date.desc())
    )
    leaves = leaves_result.scalars().all()

    return {
        "success": True,
        "count": len(leaves),
        "data": [
            {
                "id": str(l.id),
                "date": str(l.date),
                "leave_type": l.leave_type,
                "reason": l.reason,
                "status": l.status,
                "period_start": l.period_start,
                "period_end": l.period_end,
                "clarification_note": getattr(l, "clarification_note", None),
            }
            for l in leaves
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# HOD: List pending leaves
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/pending")
async def get_pending_leaves(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    hod_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    hod = hod_result.scalar_one_or_none()
    if not hod or not hod.department_id:
        raise HTTPException(status_code=404, detail="HOD department not found.")

    result = await db.execute(
        select(models.Absence)
        .options(selectinload(models.Absence.teacher))
        .join(models.Teacher)
        .where(
            models.Teacher.department_id == hod.department_id,
            models.Absence.status.in_([
                models.AbsenceStatus.PENDING,
                models.AbsenceStatus.CLARIFICATION_REQUESTED,
            ]),
        )
        .order_by(models.Absence.date.asc())
    )
    leaves = result.scalars().all()

    return {
        "success": True,
        "count": len(leaves),
        "data": [
            {
                "id": str(l.id),
                "teacher_name": l.teacher.name if l.teacher else "Unknown Teacher",
                "date": str(l.date),
                "leave_type": l.leave_type,
                "reason": l.reason,
                "status": l.status,
                "period_start": l.period_start,
                "period_end": l.period_end,
                "clarification_note": getattr(l, "clarification_note", None),
            }
            for l in leaves
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# HOD: Approve / Reject / Clarify
# ─────────────────────────────────────────────────────────────────────────────

@router.put("/{absence_id}/action")
async def hod_action_on_leave(
    absence_id: UUID,
    body: HODActionRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.action in (HODAction.REJECT, HODAction.CLARIFY) and not body.note:
        raise HTTPException(
            status_code=400,
            detail="A note is required when rejecting or requesting clarification.",
        )

    result = await db.execute(
        select(models.Absence).where(models.Absence.id == absence_id)
    )
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    if absence.status not in (
        models.AbsenceStatus.PENDING,
        models.AbsenceStatus.CLARIFICATION_REQUESTED,
    ):
        raise HTTPException(
            status_code=409,
            detail=f"This request is already {absence.status}.",
        )

    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == absence.teacher_id)
    )
    absent_teacher = teacher_result.scalar_one_or_none()

    hod_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    hod = hod_result.scalar_one_or_none()

    if (
        hod
        and absent_teacher
        and current_user.role == models.UserRole.HOD
        and absent_teacher.department_id != hod.department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only manage leaves in your department.",
        )

    if body.action == HODAction.APPROVE:
        absence.status = models.AbsenceStatus.APPROVED
        background_tasks.add_task(dispatch_relief_for_absence, absence.id, db)
        notif_msg = f"Your {absence.leave_type} leave on {absence.date} has been approved."

    elif body.action == HODAction.REJECT:
        absence.status = models.AbsenceStatus.REJECTED
        absence.resolution_report_url = None
        notif_msg = f"Your leave request was rejected. HOD note: {body.note}"

    elif body.action == HODAction.CLARIFY:
        absence.status = models.AbsenceStatus.CLARIFICATION_REQUESTED
        if hasattr(absence, 'clarification_note'):
            absence.clarification_note = body.note
        notif_msg = f"Your HOD needs clarification on your leave request: {body.note}"

    await db.commit()
    await db.refresh(absence)

    if absent_teacher and absent_teacher.user_id:
        background_tasks.add_task(
            notify, db, absent_teacher.user_id,
            f"Leave Request {body.action.value.title()}d",
            notif_msg,
        )

    return {
        "success": True,
        "message": f"Leave {body.action.value}d successfully.",
        "data": {
            "id": str(absence.id),
            "status": absence.status,
            "date": str(absence.date),
            "leave_type": absence.leave_type,
            "note": body.note,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# TEACHER: Respond to relief assignment
# ─────────────────────────────────────────────────────────────────────────────

@router.put("/relief/{assignment_id}/respond")
async def respond_to_relief(
    assignment_id: UUID,
    body: ReliefRespondRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")

    result = await db.execute(
        select(models.ReliefAssignment).where(models.ReliefAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Relief assignment not found.")

    if assignment.relief_teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="This relief is not assigned to you.")

    if assignment.status != models.ReliefStatus.PENDING:
        raise HTTPException(status_code=409, detail=f"Already {assignment.status}.")

    assignment.status = body.status

    if body.status == models.ReliefStatus.ACCEPTED:
        assignment.acknowledged_at = datetime.utcnow()
        teacher.current_relief_hours += 1
        teacher.total_hours_worked += 1

    elif body.status == models.ReliefStatus.FLAGGED:
        if not body.flag_reason:
            raise HTTPException(status_code=400, detail="flag_reason is required when flagging.")
        assignment.flag_reason = body.flag_reason
        admins_result = await db.execute(
            select(models.User).where(models.User.role == models.UserRole.ADMIN)
        )
        for admin in admins_result.scalars().all():
            background_tasks.add_task(
                notify, db, admin.id,
                "Relief Assignment Flagged",
                f"{teacher.name} flagged a relief assignment. Reason: {body.flag_reason}",
            )

    elif body.status == models.ReliefStatus.REJECTED:
        background_tasks.add_task(_rollover_relief, assignment_id, db)

    await db.commit()
    await db.refresh(assignment)

    return {
        "success": True,
        "message": f"Relief {body.status.value} successfully.",
        "data": {"id": str(assignment.id), "status": assignment.status},
    }


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN: Override relief assignment
# ─────────────────────────────────────────────────────────────────────────────

@router.put(
    "/relief/{assignment_id}/override",
    dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))]
)
async def override_relief(
    assignment_id: UUID,
    body: AdminOverrideRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.ReliefAssignment).where(models.ReliefAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Relief assignment not found.")

    new_teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.id == body.relief_teacher_id)
    )
    new_teacher = new_teacher_result.scalar_one_or_none()
    if not new_teacher:
        raise HTTPException(status_code=404, detail="New relief teacher not found.")

    assignment.relief_teacher_id = body.relief_teacher_id
    assignment.status = models.ReliefStatus.PENDING
    assignment.acknowledged_at = None
    await db.commit()
    await db.refresh(assignment)

    if new_teacher.user_id:
        background_tasks.add_task(
            notify, db, new_teacher.user_id,
            "Relief Assignment (Admin Override)",
            "An admin has assigned you to a relief duty. Please check your schedule.",
        )

    return {
        "success": True,
        "message": "Relief assignment overridden successfully.",
        "data": {"id": str(assignment.id), "new_teacher_id": str(body.relief_teacher_id)},
    }


# ─────────────────────────────────────────────────────────────────────────────
# TEACHER: Edit leave request
# ─────────────────────────────────────────────────────────────────────────────

@router.put("/{absence_id}/edit")
async def edit_leave(
    absence_id: UUID,
    body: LeaveApplyRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")

    result = await db.execute(
        select(models.Absence).where(models.Absence.id == absence_id)
    )
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    if absence.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Not your leave request.")

    if absence.status not in (
        models.AbsenceStatus.PENDING,
        models.AbsenceStatus.CLARIFICATION_REQUESTED,
    ):
        raise HTTPException(
            status_code=409,
            detail="Only pending or clarification-requested leaves can be edited."
        )

    absence.date = datetime.strptime(body.date, "%Y-%m-%d").date()
    absence.period_start = body.period_start
    absence.period_end = body.period_end
    absence.leave_type = body.leave_type.value
    absence.reason = body.reason
    absence.handover_url = body.handover_url
    await db.commit()
    await db.refresh(absence)

    return {
        "success": True,
        "message": "Leave request updated successfully.",
        "data": {
            "id": str(absence.id),
            "date": str(absence.date),
            "leave_type": absence.leave_type,
            "reason": absence.reason,
            "status": absence.status,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# TEACHER: Cancel leave request
# ─────────────────────────────────────────────────────────────────────────────

@router.delete("/{absence_id}")
async def cancel_leave(
    absence_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    teacher_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")

    result = await db.execute(
        select(models.Absence).where(models.Absence.id == absence_id)
    )
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    if absence.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Not your leave request.")

    if absence.status not in (
        models.AbsenceStatus.PENDING,
        models.AbsenceStatus.CLARIFICATION_REQUESTED,
    ):
        raise HTTPException(
            status_code=409,
            detail="Only pending or clarification-requested leaves can be cancelled."
        )

    await db.delete(absence)
    await db.commit()

    return {"success": True, "message": "Leave request cancelled successfully."}


# ─────────────────────────────────────────────────────────────────────────────
# HOD: Assign relief teacher manually
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/relief/{absence_id}/assign")
async def assign_relief_teacher(
    absence_id: UUID,
    request: HODAssignReliefRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Absence).filter(models.Absence.id == absence_id)
    )
    absence = result.scalars().first()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found")

    relief_assignment = models.ReliefAssignment(
        absence_id=absence.id,
        relief_teacher_id=request.relief_teacher_id,
        status=models.ReliefStatus.ACCEPTED,
    )
    db.add(relief_assignment)
    await db.commit()

    return {
        "message": "Relief assigned successfully",
        "absence_id": str(absence.id),
        "relief_teacher_id": str(request.relief_teacher_id),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Notifications
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/notifications/")
async def get_notifications(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Notification)
        .where(models.Notification.user_id == current_user.id)
        .order_by(models.Notification.created_at.desc())
    )
    notifications = result.scalars().all()
    unread_count = sum(1 for n in notifications if not n.is_read)

    return {
        "success": True,
        "unread_count": unread_count,
        "data": [
            {
                "id": str(n.id),
                "title": n.title,
                "content": n.content,
                "is_read": n.is_read,
                "notification_type": n.notification_type,
                "action_url": n.action_url,
                "read_at": n.read_at.isoformat() if hasattr(n, 'read_at') and n.read_at else None,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifications
        ],
    }


@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Notification).where(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False,
        )
    )
    unread = result.scalars().all()
    now = datetime.utcnow()
    for n in unread:
        n.is_read = True
        if hasattr(n, 'read_at'):
            n.read_at = now
    await db.commit()
    return {"success": True, "message": f"{len(unread)} notifications marked as read."}


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Notification).where(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.is_read = True
    if hasattr(notif, 'read_at'):
        notif.read_at = datetime.utcnow()
    await db.commit()
    return {"success": True, "message": "Notification marked as read."}