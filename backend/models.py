import uuid
import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Boolean, Integer, Float, Time, Date, SmallInteger, ForeignKey, UniqueConstraint, Enum, JSON, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

# Note: For SQLite, we might need to handle UUIDs as strings. 
# SQLAlchemy 2.0's UUID type handles this better.
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(32), storing as stringified hex values.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            else:
                return value

class UserRole(str, PyEnum):
    ADMIN = "admin"
    HOD = "hod"
    TEACHER = "teacher"

class AbsenceStatus(str, PyEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CLARIFICATION_REQUESTED = "clarification_requested"

class ReliefStatus(str, PyEnum):
    PENDING  = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    FLAGGED  = "flagged"
    EXPIRED  = "expired"   
    

class User(Base):
    __tablename__ = "users"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    college_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.TEACHER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    refresh_token = Column(String, nullable=True)
    refresh_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime(timezone=True), nullable=True)

    teacher_profile = relationship("Teacher", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")

class Department(Base):
    __tablename__ = "departments"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    hod_id = Column(GUID(), ForeignKey("teachers.id"), nullable=True)
    
    teachers = relationship("Teacher", back_populates="dept_link", foreign_keys="Teacher.department_id")
    hod = relationship("Teacher", foreign_keys=[hod_id])
    subjects = relationship("Subject", back_populates="dept_link")

class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department_id = Column(GUID(), ForeignKey("departments.id"), nullable=True)
    
    # Workload tracking
    weekly_relief_cap = Column(Integer, default=3)
    max_weekly_hours = Column(Integer, default=30)
    current_relief_hours = Column(Integer, default=0)
    total_hours_worked = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    blocked_slots = relationship("BlockedSlot", back_populates="teacher")
    

    user = relationship("User", back_populates="teacher_profile")
    dept_link = relationship("Department", back_populates="teachers", foreign_keys=[department_id])
    timetable_slots = relationship("TimetableSlot", back_populates="teacher", foreign_keys="TimetableSlot.teacher_id")

    leave_balance = relationship(
        "TeacherLeaveBalance",
        back_populates="teacher",
        uselist=False,  # one-to-one
    )
    absences = relationship("Absence", back_populates="teacher")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    department_id = Column(GUID(), ForeignKey("departments.id"))
    
    dept_link = relationship("Department", back_populates="subjects")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

class TimetableVersion(Base):
    __tablename__ = "timetable_versions"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    school_id = Column(GUID())
    published_by = Column(GUID(), ForeignKey("teachers.id"))
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=False)
    data_snapshot = Column(JSON, nullable=False)

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    timetable_version_id = Column(GUID(), ForeignKey("timetable_versions.id"))
    teacher_id = Column(GUID(), ForeignKey("teachers.id"))
    class_id = Column(GUID(), ForeignKey("classes.id"))
    room_id = Column(GUID(), ForeignKey("rooms.id"))
    subject_id = Column(GUID(), ForeignKey("subjects.id"))
    day_of_week = Column(SmallInteger) # 0=Mon .. 4=Fri
    period = Column(SmallInteger) # 1..8
    start_time = Column(Time)
    end_time = Column(Time)
    is_relief = Column(Boolean, default=False)
    original_teacher_id = Column(GUID(), ForeignKey("teachers.id"), nullable=True)

    teacher = relationship("Teacher", back_populates="timetable_slots", foreign_keys=[teacher_id])

    __table_args__ = (
        UniqueConstraint("room_id", "day_of_week", "period"),
        UniqueConstraint("teacher_id", "day_of_week", "period"),
        UniqueConstraint("class_id", "day_of_week", "period"),
    )

class ClassRoom(Base):
    __tablename__ = "classes"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    grade = Column(Integer)
    section = Column(String)
    academic_year = Column(String)

class Room(Base):
    __tablename__ = "rooms"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    capacity = Column(Integer)
    room_type = Column(String)

class Absence(Base):
    __tablename__ = "absences"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(GUID(), ForeignKey("teachers.id"))
    date = Column(Date, nullable=False)
    period_start = Column(SmallInteger)
    period_end = Column(SmallInteger)
    leave_type = Column(String)
    reason = Column(String)
    handover_url = Column(String)
    status = Column(Enum(AbsenceStatus), default=AbsenceStatus.PENDING, nullable=False)
    resolved = Column(Boolean, default=False)
    resolution_report_url = Column(String)
    clarification_note = Column(String, nullable=True)
    is_full_day = Column(Boolean, default=True)

    teacher = relationship("Teacher", back_populates="absences")

class ReliefAssignment(Base):
    __tablename__ = "relief_assignments"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    absence_id = Column(GUID(), ForeignKey("absences.id"))
    relief_teacher_id = Column(GUID(), ForeignKey("teachers.id"))
    slot_id = Column(GUID(), ForeignKey("timetable_slots.id"))
    score = Column(Integer)
    status = Column(Enum(ReliefStatus), default=ReliefStatus.PENDING, nullable=False)
    reason_text = Column(String)
    flag_reason = Column(String)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True))
    # --- Dispatch story additions ---
    deadline_at = Column(DateTime(timezone=True), nullable=True)
    rank_index = Column(Integer, default=0, nullable=False)
    ranked_pool = Column(Text, nullable=True)  # JSON list of teacher_ids
class BlockedSlot(Base):
    __tablename__ = "blocked_slots"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(GUID(), ForeignKey("teachers.id"), nullable=False)
    day = Column(SmallInteger, nullable=False)
    period = Column(SmallInteger, nullable=False)
    reason = Column(String, nullable=True)
    is_hod_locked = Column(Boolean, default=False)   # ← ADD THIS LINE
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    teacher = relationship("Teacher", back_populates="blocked_slots")

    __table_args__ = (
        UniqueConstraint("teacher_id", "day", "period", name="uq_blocked_slot"),
    )

    performed_by_college_id = Column(String, nullable=True)

    action = Column(String, nullable=False)

    target_college_id = Column(String, nullable=True)

    details = Column(JSON, nullable=True)

    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    performed_by_user_id = Column(GUID(), ForeignKey("users.id"), nullable=True)
    performed_by_college_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    target_college_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
class TeacherLeaveBalance(Base):
    __tablename__ = "teacher_leave_balances"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    teacher_id = Column(
        GUID(),
        ForeignKey("teachers.id"),
        nullable=False,
        unique=True,  # one active balance row per teacher
    )

    academic_year = Column(
        String(9),
        nullable=False,
        default="2026-27",  # Format: "YYYY-YY"
    )

    balance = Column(
        Float,
        nullable=False,
        default=0.0,  # current available days (includes carry-over)
    )

    used_ytd = Column(
        Float,
        nullable=False,
        default=0.0,  # total days deducted this academic year
    )

    carry_over = Column(
        Float,
        nullable=False,
        default=0.0,  # unused days brought from previous month
    )

    last_credited_month = Column(
        Integer,
        nullable=True,  # 1–12; null = never credited yet
    )

    last_updated = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    teacher = relationship(
        "Teacher",
        back_populates="leave_balance",
    )
