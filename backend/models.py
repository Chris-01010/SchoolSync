import uuid
import datetime
import uuid
import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Float,
    Time,
    Date,
    SmallInteger,
    ForeignKey,
    UniqueConstraint,
    Enum,
    JSON,
    DateTime,
    Text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
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
        elif dialect.name == "postgresql":

    

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
    PENDING                 = "pending"
    APPROVED                = "approved"
    REJECTED                = "rejected"
    CLARIFICATION_REQUESTED = "clarification_requested"

class ReliefStatus(str, PyEnum):
    PENDING  = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

    FLAGGED = "flagged"


    EXPIRED  = "expired"   
    
    AWAITING_CONFIRMATION = "awaiting_confirmation"


class NotificationType(str, PyEnum):
    LEAVE_REQUEST = "LEAVE_REQUEST"
    LEAVE_APPROVED = "LEAVE_APPROVED"
    LEAVE_REJECTED = "LEAVE_REJECTED"
    RELIEF_REQUEST = "RELIEF_REQUEST"
    RELIEF_ACCEPTED = "RELIEF_ACCEPTED"
    RELIEF_REJECTED = "RELIEF_REJECTED"
    ANNOUNCEMENT = "ANNOUNCEMENT"
    GENERAL = "GENERAL"


class AssignmentMode(str, PyEnum):
    SWAP = "SWAP"
    CONSUME = "CONSUME"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

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

    department_subjects = relationship(
        "DepartmentSubject",
        back_populates="department"
    )

    department_subjects = relationship(
        "DepartmentSubject",
        back_populates="department"
    )


class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    department_id = Column(
        GUID(),
        ForeignKey("departments.id"),
        nullable=True
    )

    weekly_relief_cap = Column(Integer, default=3)
    max_weekly_hours = Column(Integer, default=30)
    current_relief_hours = Column(Integer, default=0)
    total_hours_worked = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # JSON cache column stored as "blocked_slots" in DB
    blocked_slots_json: Mapped[dict] = Column(JSON, default=dict, name="blocked_slots")

    user = relationship("User", back_populates="teacher_profile")

    dept_link = relationship(
        "Department",
        back_populates="teachers",
        foreign_keys=[department_id]
    )

    timetable_slots = relationship(
        "TimetableSlot",
        back_populates="teacher",
        foreign_keys="TimetableSlot.teacher_id"
    )

    blocked_slot_entries = relationship(
        "BlockedSlot",
        back_populates="teacher",
        cascade="all, delete-orphan"
    )

    teacher_subjects = relationship(
        "TeacherSubject",
        back_populates="teacher",
        cascade="all, delete-orphan"
    )

    leave_balance = relationship(
        "TeacherLeaveBalance",
        back_populates="teacher",
        uselist=False,
        cascade="all, delete-orphan"
    )


class Subject(Base):
    __tablename__ = "subjects"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)

    # Kept for backward compat; canonical relationship is via DepartmentSubject
    department_id = Column(
        GUID(),
        ForeignKey("departments.id"),
        nullable=True
    )

    dept_link = relationship(
        "Department",
        back_populates="subjects"
    )

    department_subjects = relationship(
        "DepartmentSubject",
        back_populates="subject"
    )

    teacher_subjects = relationship(
        "TeacherSubject",
        back_populates="subject"
    )


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    user_id = Column(
        GUID(),
        ForeignKey("users.id"),
        nullable=False,
    )

    notification_type = Column(
        Enum(NotificationType),
        default=NotificationType.GENERAL,
        nullable=False,
    )

    title = Column(String, nullable=False)

    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    action_url = Column(String, nullable=True)

    notification_type = Column(
        Enum(NotificationType),
        default=NotificationType.GENERAL,
        nullable=True
    )

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
    day_of_week = Column(SmallInteger)
    period = Column(SmallInteger)
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

    is_emergency = Column(Boolean, default=False)

    emergency_submitted_at = Column(DateTime(timezone=True), nullable=True)

    hod_response_deadline = Column(DateTime(timezone=True), nullable=True)

    auto_approved = Column(Boolean, default=False)

    teacher = relationship("Teacher")


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
    assignment_mode = Column(String, nullable=True)
    swapped_slot_id = Column(GUID(), ForeignKey("timetable_slots.id"), nullable=True)
    consume_substitute_confirmed = Column(Boolean, nullable=True)
    consume_absent_confirmed = Column(Boolean, nullable=True)
    is_emergency = Column(Boolean, default=False)
    response_deadline = Column(DateTime(timezone=True), nullable=True)
    deadline_at = Column(DateTime(timezone=True), nullable=True)
    rank_index = Column(Integer, nullable=True)
    ranked_pool = Column(Text, nullable=True)


class BlockedSlot(Base):
    __tablename__ = "blocked_slots"

    id = Column(GUID, primary_key=True, index=True,default=uuid.uuid4)
    teacher_id = Column(GUID, ForeignKey("teachers.id"), nullable=False)
    day = Column(String, nullable=False)       # e.g. "Monday"
    period = Column(Integer, nullable=False)   # e.g. 3
    reason = Column(String, nullable=True)     # e.g. "Staff meeting"
    created_at = Column(DateTime, server_default=func.now())

    teacher = relationship(
        "Teacher",
        back_populates="blocked_slot_entries"
    )
    
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    department_id = Column(GUID(), ForeignKey("departments.id"), nullable=False)
    subject_id = Column(GUID(), ForeignKey("subjects.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    department_name = Column(String, nullable=True)
    subject_name = Column(String, nullable=True)

    department = relationship("Department", foreign_keys=[department_id])
    subject = relationship("Subject", foreign_keys=[subject_id])

    __table_args__ = (
        UniqueConstraint("department_id", "subject_id"),
    )



class TeacherLeaveBalance(Base):
    __tablename__ = "teacher_leave_balances"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    teacher_id = Column(
        GUID(),
        ForeignKey("teachers.id"),
        nullable=False,
        unique=True
    )

    academic_year = Column(String(9), nullable=False)

    balance = Column(Float, nullable=False)

    used_ytd = Column(Float, nullable=False)

    carryover = Column(Float, nullable=False)

    last_credited_month = Column(Integer, nullable=True)

    last_updated = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    teacher = relationship(
        "Teacher",
        back_populates="leave_balance"
    )


class TeacherSubject(Base):
    __tablename__ = "teacher_subjects"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    teacher_id = Column(
        GUID(),
        ForeignKey("teachers.id"),
        nullable=False
    )

    subject_id = Column(
        GUID(),
        ForeignKey("subjects.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    teacher_name = Column(String, nullable=True)
    subject_name = Column(String, nullable=True)

    teacher = relationship("Teacher", back_populates="teacher_subjects")
    subject = relationship("Subject", back_populates="teacher_subjects")

    __table_args__ = (
        UniqueConstraint("teacher_id", "subject_id"),
    )


class DepartmentSubject(Base):
    __tablename__ = "department_subjects"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    department_id = Column(
        GUID(),
        ForeignKey("departments.id"),
        nullable=False
    )

    subject_id = Column(
        GUID(),
        ForeignKey("subjects.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    department_name = Column(String, nullable=True)
    subject_name = Column(String, nullable=True)

    department = relationship("Department", back_populates="department_subjects")
    subject = relationship("Subject", back_populates="department_subjects")

    __table_args__ = (
        UniqueConstraint("department_id", "subject_id"),
    )