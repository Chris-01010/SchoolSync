# leave_api.py
# Member 3 — Leave & HOD Approval Workflow
# FR-1: Teacher leave application
# FR-2: HOD approve / reject / clarify
# FR-3: On approval → trigger relief dispatch

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from enum import Enum

from database import get_db
import models
import auth

router = APIRouter()


# ─── Schemas (request/response models) ───────────────────────────────────────

class LeaveType(str, Enum):
    SICK = "sick"
    CASUAL = "casual"
    OTHER = "other"

class HODAction(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    CLARIFY = "clarify"

class LeaveApplyRequest(BaseModel):
    date: str                        # format: YYYY-MM-DD
    period_start: int
    period_end: int
    leave_type: LeaveType
    reason: str
    handover_url: Optional[str] = None

class HODActionRequest(BaseModel):
    action: HODAction
    note: Optional[str] = None

class ReliefRespondRequest(BaseModel):
    status: models.ReliefStatus      # ACCEPTED, REJECTED, FLAGGED
    flag_reason: Optional[str] = None

class AdminOverrideRequest(BaseModel):
    relief_teacher_id: UUID
    override_note: Optional[str] = None
class HODAssignReliefRequest(BaseModel):
    relief_teacher_id: UUID
    note: Optional[str] = None


# ─── Helper: send notification ────────────────────────────────────────────────

async def notify(db: AsyncSession, user_id: UUID, title: str, content: str):
    """Save an in-app notification. Never raises."""
    try:
        notif = models.Notification(
            user_id=user_id,
            title=title,
            content=content,
        )
        db.add(notif)
        await db.commit()
    except Exception as e:
        print(f"[NOTIFICATION ERROR] {e}")


# ─── Helper: dispatch relief (stub for Member 2 scoring engine) ───────────────

async def dispatch_relief_for_absence(absence_id: UUID, db: AsyncSession):

    # Get approved absence
    result = await db.execute(
        select(models.Absence).where(models.Absence.id == absence_id)
    )
    absence = result.scalar_one_or_none()

    if not absence:
        print("[VACANT PERIOD] Absence not found.")
        return

    # Convert date to weekday
    day_of_week = absence.date.weekday()

    # Find timetable slots of absent teacher
    slots_result = await db.execute(
        select(models.TimetableSlot).where(
            models.TimetableSlot.teacher_id == absence.teacher_id,
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period >= absence.period_start,
            models.TimetableSlot.period <= absence.period_end,
            models.TimetableSlot.is_relief == False
        )
    )

    vacant_slots = slots_result.scalars().all()

    # Edge case
    if not vacant_slots:
        print("[VACANT PERIOD] No timetable slots found.")
        return

    # Create relief requests
    for slot in vacant_slots:
        relief_assignment = models.ReliefAssignment(
            absence_id=absence.id,
            relief_teacher_id=None,
            slot_id=slot.id,
            score=0,
            status=models.ReliefStatus.PENDING,
            reason_text="Vacant period generated after leave approval."
        )

        db.add(relief_assignment)

    await db.commit()

    print(f"[VACANT PERIOD] Created {len(vacant_slots)} relief assignments.")


# ─────────────────────────────────────────────────────────────────────────────
# TEACHER: Submit a leave request  (FR-1)
# POST /leaves/apply
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/apply", status_code=201)
async def apply_leave(
    body: LeaveApplyRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get the teacher profile
    result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")

    # Create the absence/leave record
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

    # Notify the HOD of this department
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
# GET /leaves/my
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
                "teacher_name": teacher.name,
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
# HOD: List all PENDING leaves in my department
# GET /leaves/pending
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/pending")
async def get_pending_leaves(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    auth.check_role([models.UserRole.HOD, models.UserRole.ADMIN])

    # Get HOD's department
    hod_result = await db.execute(
        select(models.Teacher).where(models.Teacher.user_id == current_user.id)
    )
    hod = hod_result.scalar_one_or_none()
    if not hod or not hod.department_id:
        raise HTTPException(status_code=404, detail="HOD department not found.")

    result = await db.execute(
        select(models.Absence)
        .join(models.Teacher)
        .where(
            models.Teacher.department_id == hod.department_id,
            models.Absence.status == models.AbsenceStatus.PENDING,
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
        }
        for l in leaves
    ],
}


# ─────────────────────────────────────────────────────────────────────────────
# HOD: Approve / Reject / Clarify  (FR-2, FR-3)
# PUT /leaves/{absence_id}/action
# ─────────────────────────────────────────────────────────────────────────────
@router.put("/{absence_id}/action")
async def hod_action_on_leave(
    absence_id: UUID,
    body: HODActionRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate note is provided for reject/clarify
    if body.action in (HODAction.REJECT, HODAction.CLARIFY) and not body.note:
        raise HTTPException(
            status_code=400,
            detail="A note is required when rejecting or requesting clarification.",
        )

    # Fetch the absence
    result = await db.execute(
        select(models.Absence).where(models.Absence.id == absence_id)
    )
    absence = result.scalar_one_or_none()
    if not absence:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    # Only act on PENDING requests
    if absence.status != models.AbsenceStatus.PENDING:
        raise HTTPException(
            status_code=409,
            detail=f"This request is already {absence.status}.",
        )

    # HOD scope check — must be same department
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

    # Apply action
    if body.action == HODAction.APPROVE:
        absence.status = models.AbsenceStatus.APPROVED
        # FR-3: trigger relief dispatch as background task
        background_tasks.add_task(dispatch_relief_for_absence, absence.id, db)
        notif_msg = f"Your {absence.leave_type} leave on {absence.date} has been approved."

    elif body.action == HODAction.REJECT:
        absence.status = models.AbsenceStatus.REJECTED
        absence.resolution_report_url = None
        notif_msg = f"Your leave request was rejected. HOD note: {body.note}"

    elif body.action == HODAction.CLARIFY:
        # Keep PENDING but notify teacher to clarify
        notif_msg = f"Your HOD needs clarification on your leave request: {body.note}"

    await db.commit()
    await db.refresh(absence)

    # Notify the teacher
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
# TEACHER: Respond to a relief assignment  (FR-17, FR-22)
# PUT /leaves/relief/{assignment_id}/respond
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
        raise HTTPException(
            status_code=409, detail=f"Already {assignment.status}."
        )

    assignment.status = body.status

    if body.status == models.ReliefStatus.ACCEPTED:
        assignment.acknowledged_at = datetime.utcnow()
        # Update teacher workload
        teacher.current_relief_hours += 1
        teacher.total_hours_worked += 1

    elif body.status == models.ReliefStatus.FLAGGED:
        if not body.flag_reason:
            raise HTTPException(status_code=400, detail="flag_reason is required when flagging.")
        assignment.flag_reason = body.flag_reason
        # Notify all admins
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
        # FR-20: member 2 rollover logic
        print(f"[ROLLOVER] Assignment {assignment_id} rejected. Rolling to next candidate.")

    await db.commit()
    await db.refresh(assignment)

    return {
        "success": True,
        "message": f"Relief {body.status.value} successfully.",
        "data": {"id": str(assignment.id), "status": assignment.status},
    }


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN: Override a relief assignment  (FR-23)
# PUT /leaves/relief/{assignment_id}/override
# ─────────────────────────────────────────────────────────────────────────────
@router.put("/relief/{assignment_id}/override",
    dependencies=[Depends(auth.check_role([models.UserRole.ADMIN]))])
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

    old_teacher_id = assignment.relief_teacher_id
    assignment.relief_teacher_id = body.relief_teacher_id
    assignment.status = models.ReliefStatus.PENDING
    assignment.acknowledged_at = None

    await db.commit()
    await db.refresh(assignment)

    # Notify new teacher
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
        "relief_teacher_id": str(request.relief_teacher_id)
    }