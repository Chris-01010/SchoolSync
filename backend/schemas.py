from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from uuid import UUID
from datetime import date, datetime
from enum import Enum

from .models import UserRole, AbsenceStatus, ReliefStatus


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    college_id: Optional[str] = None

class UserBase(BaseModel):
    college_id: str
    email: EmailStr
    role: UserRole = UserRole.TEACHER

class UserCreate(UserBase):
    password: str
    name: Optional[str] = None
    department: Optional[str] = None

class User(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    hod_id: Optional[UUID] = None

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: UUID
    
    class Config:
        from_attributes = True

# Teacher Schemas
class TeacherBase(BaseModel):
    name: str
    email: str
    department_id: Optional[UUID] = None
    weekly_relief_cap: int = 3
    max_weekly_hours: int = 30

class TeacherCreate(TeacherBase):
    user_id: UUID

class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[UUID] = None
    weekly_relief_cap: Optional[int] = None
    max_weekly_hours: Optional[int] = None
    is_active: Optional[bool] = None


class Teacher(TeacherBase):
    id: UUID
    user_id: UUID
    current_relief_hours: int
    total_hours_worked: int
    is_active: bool

    class Config:
        from_attributes = True


# Subject Schemas
class SubjectBase(BaseModel):
    name: str
    department_id: UUID

class SubjectCreate(SubjectBase):
    pass

class Subject(SubjectBase):
    id: UUID

    class Config:
        from_attributes = True


# Absence Schemas
# FIXED — teacher_id removed from body, comes from JWT in the endpoint
class AbsenceCreate(BaseModel):
    date: date
    period_start: int
    period_end: int
    leave_type: str
    reason: Optional[str] = None
    handover_url: Optional[str] = None

# Also add this new schema for the "view my leaves" response
class AbsenceOut(BaseModel):
    id: UUID
    teacher_id: UUID
    date: date
    period_start: int
    period_end: int
    leave_type: str
    reason: Optional[str]
    handover_url: Optional[str]
    status: AbsenceStatus
    resolved: bool

    class Config:
        from_attributes = True

class Absence(AbsenceCreate):
    id: UUID
    status: AbsenceStatus
    resolved: bool
    resolution_report_url: Optional[str] = None

    class Config:
        from_attributes = True


# --- Leave Request Schemas (HOD workflow) ---
class LeaveType(str, Enum):
    SICK = "sick"
    CASUAL = "casual"
    OTHER = "other"
    BEREAVEMENT = "bereavement"
    PROFESSIONAL = "professional"


class LeaveStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CLARIFICATION_REQUESTED = "CLARIFICATION_REQUESTED"


class LeaveRequestCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str
    is_full_day: bool = True
    # required if is_full_day=False
    period_ids: Optional[List[int]] = None
    # document_url comes from separate file upload endpoint


class LeaveRequestOut(BaseModel):
    leave_request_id: int
    teacher_id: UUID
    hod_teacher_id: Optional[UUID]

    leave_type: str
    start_date: date
    end_date: date
    reason: str

    is_full_day: bool
    document_url: Optional[str]
    status: LeaveStatus
    clarification_note: Optional[str]
    decision_at: Optional[datetime]
    created_at: datetime

    # UI joins (may be None depending on query)
    period_ids: Optional[List[int]]
    relief_teacher_name: Optional[str]

    class Config:
        from_attributes = True


class LeaveRequestStatusUpdate(BaseModel):
    # HOD uses this to approve/reject (and optionally ask for clarification)
    status: LeaveStatus
    clarification_note: Optional[str] = None


# Relief Schemas
class ReliefResponse(BaseModel):
    status: ReliefStatus
    flag_reason: Optional[str] = None


class ReliefAssignmentBase(BaseModel):
    id: UUID
    absence_id: UUID
    relief_teacher_id: UUID
    slot_id: UUID
    status: ReliefStatus
    assigned_at: datetime
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    content: str


class Notification(NotificationBase):
    id: UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ReliefCandidate(BaseModel):
    teacher_id: UUID
    name: str
    score: int
    reasons: str

class TimetableGenerateRequest(BaseModel):
    school_id: UUID

class DashboardSummary(BaseModel):
    timetable: List[Dict]
    relief_duties: List[Dict]
    total_hours: int
    relief_hours: int
    pending_requests: List[Dict]


class HODDashboardSummary(BaseModel):
    department_name: str
    active_absences: int
    coverage_rate: float
    total_staff: int
    pending_approvals_count: int


class AbsenceDecision(BaseModel):
    # Matches AbsenceStatus enum values in DB: approved / rejected
    status: AbsenceStatus


class LeaveApproval(BaseModel):
    # Deprecated: use LeaveRequestStatusUpdate for leave request approval flow.
    status: AbsenceStatus
    clarification_note: Optional[str] = None


class AdminDashboardStats(BaseModel):
    active_absences: int
    relief_assigned_today: int
    coverage_rate: float
    staff_present_count: int
    total_staff_count: int
    flagged_issues_count: int
    pending_timetable_tasks: int

class SystemSettings(BaseModel):
    max_weekly_hours_default: int
    weekly_relief_cap_default: int
    fairness_balance_factor: float
    allow_hod_auto_approval: bool

# --- Timetable Slot Schemas ---
class TimetableSlotCreate(BaseModel):
    version_id: UUID
    teacher_id: UUID
    class_id: UUID
    room_id: UUID
    day_of_week: int       # 0 = Monday, 6 = Sunday
    period: int
    subject: Optional[str] = None

    class Config:
        from_attributes = True


class TimetableSlot(TimetableSlotCreate):
    id: UUID

    class Config:
        from_attributes = True

# --- Admin Dashboard Home Schemas ---
class DashboardHomeStats(BaseModel):
    total_departments: int
    total_teachers: int
    total_classes: int
    teachers_on_leave: int
    pending_leave_requests: int
    total_relief_duties: int
    unassigned_relief_periods: int
    timetable_conflict_count: int
    active_timetable_updates: int

class AlertType(str, Enum):
    CONFLICT = "conflict"
    WARNING = "warning"
    INFO = "info"

class AdminAlert(BaseModel):
    id: str
    type: AlertType
    title: str
    message: str
    time_ago: str

class ConflictDetail(BaseModel):
    id: str
    type: str
    affected_entities: str
    time_slot: str

# --- Analytics Schemas ---
class DepartmentWorkload(BaseModel):
    department_name: str
    avg_teaching_hours: float
    avg_relief_hours: float
    total_leave_days: int
    load_capacity_percent: int
    status: str

class TeacherWorkload(BaseModel):
    teacher_id: UUID
    teacher_name: str
    department: str
    load_percent: int

class ReliefDistribution(BaseModel):
    internal_percent: int
    casual_percent: int
    total_hours: int

class LeaveTrend(BaseModel):
    week: str
    count: int

# --- Room Schemas ---
class RoomBase(BaseModel):
    name: str
    capacity: Optional[int] = None
    room_type: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(RoomBase):
    name: Optional[str] = None
    capacity: Optional[int] = None
    room_type: Optional[str] = None

class Room(RoomBase):
    id: UUID

    class Config:
        from_attributes = True

# --- User Management (Admin View) ---
class UserAdminView(BaseModel):
    id: UUID
    college_id: str
    name: str
    email: str
    role: str
    department: Optional[str] = None
    department_id: Optional[UUID] = None
    is_active: bool
    status: str
    last_active: str
    created_at: Optional[datetime] = None

class UserAdminCreate(BaseModel):
    college_id: str
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.TEACHER
    department_id: Optional[UUID] = None

class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    department_id: Optional[UUID] = None

class AuditLogOut(BaseModel):
    id: UUID
    performed_by_college_id: Optional[str] = None
    action: str
    target_college_id: Optional[str] = None
    details: Optional[dict] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class BulkActionPayload(BaseModel):
    user_ids: List[UUID]
    action: str  # "enable", "disable", "reset_password"
    new_password: Optional[str] = None
