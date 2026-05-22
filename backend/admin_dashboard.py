from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List
from datetime import date, timedelta, datetime
import uuid

from .database import get_db
from .models import (
    User, UserRole, Teacher, Department, ClassRoom, Absence,
    ReliefAssignment, AbsenceStatus, ReliefStatus, TimetableVersion, TimetableSlot
)
from . import auth
from .schemas import (
    DashboardHomeStats, AdminAlert, AlertType, ConflictDetail,
    DepartmentWorkload, TeacherWorkload, ReliefDistribution, LeaveTrend,
    AbsenceOut, ReliefAssignmentBase
)

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

def require_admin(current_user: User = Depends(auth.get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user

@router.get("/dashboard/stats", response_model=DashboardHomeStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    today = date.today()
    
    # Simple counts
    total_departments = (await db.execute(select(func.count(Department.id)))).scalar() or 0
    total_teachers = (await db.execute(select(func.count(Teacher.id)))).scalar() or 0
    total_classes = (await db.execute(select(func.count(ClassRoom.id)))).scalar() or 0
    
    # Leaves
    teachers_on_leave = (await db.execute(
        select(func.count(Absence.id))
        .where(and_(Absence.date == today, Absence.status == AbsenceStatus.APPROVED))
    )).scalar() or 0
    
    pending_leave_requests = (await db.execute(
        select(func.count(Absence.id)).where(Absence.status == AbsenceStatus.PENDING)
    )).scalar() or 0

    # Reliefs
    total_relief_duties = (await db.execute(
        select(func.count(ReliefAssignment.id))
        .where(func.date(ReliefAssignment.assigned_at) == today)
    )).scalar() or 0
    
    unassigned_relief_periods = (await db.execute(
        select(func.count(ReliefAssignment.id))
        .where(and_(
            func.date(ReliefAssignment.assigned_at) == today,
            ReliefAssignment.status == ReliefStatus.PENDING
        ))
    )).scalar() or 0

    # Timetable Updates
    active_timetable_updates = (await db.execute(
        select(func.count(TimetableVersion.id)).where(TimetableVersion.is_active == False)
    )).scalar() or 0

    # For timetable conflicts, we mock a quick count or check logic
    # Real logic would join TimetableSlot and look for dupes
    timetable_conflict_count = 0 

    return DashboardHomeStats(
        total_departments=total_departments,
        total_teachers=total_teachers,
        total_classes=total_classes,
        teachers_on_leave=teachers_on_leave,
        pending_leave_requests=pending_leave_requests,
        total_relief_duties=total_relief_duties,
        unassigned_relief_periods=unassigned_relief_periods,
        timetable_conflict_count=timetable_conflict_count,
        active_timetable_updates=active_timetable_updates
    )

@router.get("/dashboard/alerts", response_model=List[AdminAlert])
async def get_dashboard_alerts(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    # Mocking alerts for now based on stats
    today = date.today()
    alerts = []
    
    unassigned = (await db.execute(
        select(func.count(ReliefAssignment.id))
        .where(and_(func.date(ReliefAssignment.assigned_at) == today, ReliefAssignment.status == ReliefStatus.PENDING))
    )).scalar() or 0
    
    if unassigned > 0:
        alerts.append(AdminAlert(
            id=str(uuid.uuid4()),
            type=AlertType.WARNING,
            title="Unassigned Reliefs",
            message=f"{unassigned} unassigned reliefs. Critical shortage.",
            time_ago="Just now"
        ))
        
    return alerts

@router.get("/dashboard/conflicts", response_model=List[ConflictDetail])
async def get_dashboard_conflicts(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    return []

@router.get("/leaves")
async def get_all_leaves(status: AbsenceStatus = None, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    query = select(Absence, Teacher).join(Teacher, Absence.teacher_id == Teacher.id).order_by(Absence.date.desc())
    if status:
        query = query.where(Absence.status == status)
    result = await db.execute(query)
    rows = result.all()
    return [
        {
            "id": str(a.id),
            "teacher_id": str(a.teacher_id),
            "teacher_name": t.name or "Unknown Teacher",
            "date": str(a.date),
            "leave_type": a.leave_type,
            "reason": a.reason,
            "status": a.status,
            "period_start": a.period_start,
            "period_end": a.period_end,
            "clarification_note": a.clarification_note,
        }
        for a, t in rows
    ]
@router.get("/leaves/on-leave-today", response_model=List[AbsenceOut])
async def get_on_leave_today(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    today = date.today()
    result = await db.execute(select(Absence).where(and_(Absence.date == today, Absence.status == AbsenceStatus.APPROVED)))
    return result.scalars().all()

@router.get("/relief", response_model=List[ReliefAssignmentBase])
async def get_all_reliefs(status: ReliefStatus = None, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    query = select(ReliefAssignment).order_by(ReliefAssignment.assigned_at.desc())
    if status:
        query = query.where(ReliefAssignment.status == status)
    result = await db.execute(query)
    return result.scalars().all()

# --- Analytics ---
@router.get("/analytics/workload-by-dept", response_model=List[DepartmentWorkload])
async def get_workload_by_dept(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    return [
        DepartmentWorkload(
            department_name="Mathematics",
            avg_teaching_hours=24.5,
            avg_relief_hours=4.2,
            total_leave_days=18,
            load_capacity_percent=76,
            status="Optimal"
        ),
        DepartmentWorkload(
            department_name="Science",
            avg_teaching_hours=26.8,
            avg_relief_hours=5.5,
            total_leave_days=24,
            load_capacity_percent=96,
            status="Critical"
        )
    ]

@router.get("/analytics/relief-distribution", response_model=ReliefDistribution)
async def get_relief_distribution(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    return ReliefDistribution(
        internal_percent=72,
        casual_percent=28,
        total_hours=342
    )

@router.get("/analytics/leave-trends", response_model=List[LeaveTrend])
async def get_leave_trends(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    return [
        LeaveTrend(week="Week 1", count=10),
        LeaveTrend(week="Week 2", count=15),
        LeaveTrend(week="Week 3", count=8),
        LeaveTrend(week="Week 4", count=20),
    ]

@router.get("/analytics/overloaded-teachers", response_model=List[TeacherWorkload])
async def get_overloaded_teachers(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    return []
