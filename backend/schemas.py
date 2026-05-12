from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from uuid import UUID
from datetime import date, time, datetime
from models import UserRole, AbsenceStatus, ReliefStatus

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

<<<<<<< HEAD
class TokenData(BaseModel):
    college_id: Optional[str] = None

=======

class TokenData(BaseModel):
    college_id: Optional[str] = None


>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class UserBase(BaseModel):
    college_id: str
    email: EmailStr
    role: UserRole = UserRole.TEACHER

<<<<<<< HEAD
class UserCreate(UserBase):
    password: str

=======

class UserCreate(UserBase):
    password: str


>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class User(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    hod_id: Optional[UUID] = None

<<<<<<< HEAD
class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: UUID
    
    class Config:
        from_attributes = True

=======

class DepartmentCreate(DepartmentBase):
    pass


class Department(DepartmentBase):
    id: UUID

    class Config:
        from_attributes = True


>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# Teacher Schemas
class TeacherBase(BaseModel):
    name: str
    email: str
    department_id: Optional[UUID] = None
    weekly_relief_cap: int = 3
    max_weekly_hours: int = 30
    blocked_slots: Dict[str, List[int]] = {}

<<<<<<< HEAD
class TeacherCreate(TeacherBase):
    user_id: UUID

=======

class TeacherCreate(TeacherBase):
    user_id: UUID


>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[UUID] = None
    weekly_relief_cap: Optional[int] = None
    max_weekly_hours: Optional[int] = None
    is_active: Optional[bool] = None

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class Teacher(TeacherBase):
    id: UUID
    user_id: UUID
    current_relief_hours: int
    total_hours_worked: int
    is_active: bool

    class Config:
        from_attributes = True

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# Subject Schemas
class SubjectBase(BaseModel):
    name: str
    department_id: UUID

<<<<<<< HEAD
class SubjectCreate(SubjectBase):
    pass

=======

class SubjectCreate(SubjectBase):
    pass


>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class Subject(SubjectBase):
    id: UUID

    class Config:
        from_attributes = True

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# Absence Schemas
class AbsenceCreate(BaseModel):
    teacher_id: UUID
    date: date
    period_start: int
    period_end: int
    leave_type: str
    reason: Optional[str] = None
    handover_url: Optional[str] = None

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class Absence(AbsenceCreate):
    id: UUID
    status: AbsenceStatus
    resolved: bool
    resolution_report_url: Optional[str] = None

    class Config:
        from_attributes = True

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# Relief Schemas
class ReliefResponse(BaseModel):
    status: ReliefStatus
    flag_reason: Optional[str] = None

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
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

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    content: str

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class Notification(NotificationBase):
    id: UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class ReliefCandidate(BaseModel):
    teacher_id: UUID
    name: str
    score: int
    reasons: str

<<<<<<< HEAD
class TimetableGenerateRequest(BaseModel):
    school_id: UUID

=======

class TimetableGenerateRequest(BaseModel):
    school_id: UUID


>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class DashboardSummary(BaseModel):
    timetable: List[Dict]
    relief_duties: List[Dict]
    total_hours: int
    relief_hours: int
    pending_requests: List[Dict]

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class HODDashboardSummary(BaseModel):
    department_name: str
    active_absences: int
    coverage_rate: float
    total_staff: int
    pending_approvals_count: int

<<<<<<< HEAD
=======

>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
class LeaveApproval(BaseModel):
    status: AbsenceStatus
    resolution_report_url: Optional[str] = None

<<<<<<< HEAD
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
=======

# --- Timetable Slot Schemas (NEW) ---
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
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
