# backend/relief_engine.py
#
# Automated relief assignment engine — Stories 1 & 2.
# All functions are async to match the project's AsyncSession pattern.
#
# Public surface:
#   rank_candidates(absence, db)  → list[ScoredCandidate]  (used by dispatch + candidates endpoint)

from __future__ import annotations

import json
from dataclasses import dataclass, field
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from . import models


# ─── Scoring weights ──────────────────────────────────────────────────────────

P1_CLASS_CONTINUITY  = 40
P2_SUBJECT_EXPERTISE = 25
P3_SAME_DEPARTMENT   = 15
# P4 FALLBACK DEPARTMENT = 10
# TODO: P4 — implement when dept-proximity mapping is settled.
# Interface: async def _score_p4(teacher, absent_teacher, db) -> int  (0–10)
FAIRNESS_MAX         = 10


# ─── Result type ──────────────────────────────────────────────────────────────

@dataclass
class ScoredCandidate:
    teacher: models.Teacher
    total_score: int
    breakdown: dict[str, int] = field(default_factory=dict)

    def as_dict(self) -> dict:
        return {
            "teacher_id":  str(self.teacher.id),
            "name":        self.teacher.name,
            "total_score": self.total_score,
            "breakdown":   self.breakdown,
        }


# ─── Story 1: filter_eligible_teachers ───────────────────────────────────────

async def filter_eligible_teachers(
    absent_teacher_id: UUID,
    day_of_week: int,   # 0=Mon … 4=Fri
    period: int,        # 1..8
    db: AsyncSession,
) -> list[models.Teacher]:
    """
    Return every Teacher who can cover this slot.

    F1 — Not already teaching this day+period (TimetableSlot clash)
    F2 — weekly_relief_cap not exhausted  (current_relief_hours < weekly_relief_cap)
    F3 — is_active AND slot not in blocked_slots JSON  {"day_str": [period, ...]}
    F4 — Total workload cap not hit  (total_hours_worked < max_weekly_hours)
    F5 — Not the absent teacher themselves
    """

    # F1 — one query: teacher_ids currently busy this slot
    busy_result = await db.execute(
        select(models.TimetableSlot.teacher_id).where(
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period == period,
            models.TimetableSlot.is_relief == False,
        )
    )
    busy_ids: set[UUID] = {row[0] for row in busy_result.all()}

    # Fetch all active teachers in one shot; remaining filters are in-process.
    # (Teacher table is small — a school has < a few hundred rows.)
    all_result = await db.execute(
        select(models.Teacher).where(models.Teacher.is_active == True)
    )
    candidates = all_result.scalars().all()

    eligible: list[models.Teacher] = []
    for teacher in candidates:

        # F5 — never assign the absent teacher to cover themselves
        if teacher.id == absent_teacher_id:
            continue

        # F1 — timetable clash
        if teacher.id in busy_ids:
            continue

        # F2 — relief quota (treat None cap as unlimited)
        if (
            teacher.weekly_relief_cap is not None
            and teacher.current_relief_hours >= teacher.weekly_relief_cap
        ):
            continue

        # F3 — blocked_slots  format: {"0": [1, 2], "3": [5]}
        if _is_slot_blocked(teacher, day_of_week, period):
            continue

        # F4 — institutional weekly hour ceiling
        if (
            teacher.max_weekly_hours is not None
            and teacher.total_hours_worked >= teacher.max_weekly_hours
        ):
            continue

        eligible.append(teacher)

    return eligible


def _is_slot_blocked(teacher: models.Teacher, day_of_week: int, period: int) -> bool:
    """
    blocked_slots is stored as JSON: {"0": [1, 2], "3": [5]}
    Key = day_of_week as string, value = list of blocked period ints.
    Handles None / malformed JSON without raising.
    """
    raw = teacher.blocked_slots
    if not raw:
        return False
    try:
        # SQLAlchemy may already have deserialised JSON → dict, or it may be a string
        slots = json.loads(raw) if isinstance(raw, str) else raw
        day_key = str(day_of_week)
        return period in slots.get(day_key, [])
    except (TypeError, ValueError):
        return False  # corrupt data → treat as no block


# ─── Story 2: score_teacher ───────────────────────────────────────────────────

async def score_teacher(
    teacher: models.Teacher,
    absent_teacher: models.Teacher,
    slot: models.TimetableSlot,
    weekly_counts: dict[UUID, int],   # teacher_id → relief periods assigned this week
    db: AsyncSession,
) -> ScoredCandidate:
    """
    Compute a score for one candidate against the given vacant slot.

    P1 Class continuity  40 pts — teacher has any slot for the same class_id
    P2 Subject expertise 25 pts — teacher has any slot with the same subject_id
    P3 Same department   15 pts — same department_id as absent teacher
    P4 Fallback dept      0 pts — TODO (see constant above)
    Fairness           0–10 pts — inversely proportional to this week's relief count
    """
    breakdown: dict[str, int] = {}

    # P1 — class continuity
    p1 = await _score_p1(teacher, slot, db)
    breakdown["p1_continuity"] = p1

    # P2 — subject expertise
    p2 = await _score_p2(teacher, slot, db)
    breakdown["p2_expertise"] = p2

    # P3 — same department
    p3 = P3_SAME_DEPARTMENT if teacher.department_id == absent_teacher.department_id else 0
    breakdown["p3_department"] = p3

    # P4 — deferred
    breakdown["p4_fallback"] = 0

    # Fairness — count of 0 → 10 pts, each extra relief –1 pt, floor 0
    relief_count = weekly_counts.get(teacher.id, 0)
    fairness = max(0, FAIRNESS_MAX - relief_count)
    breakdown["fairness"] = fairness

    total = p1 + p2 + p3 + fairness

    return ScoredCandidate(teacher=teacher, total_score=total, breakdown=breakdown)


async def _score_p1(
    teacher: models.Teacher,
    slot: models.TimetableSlot,
    db: AsyncSession,
) -> int:
    if not slot.class_id:
        return 0
    result = await db.execute(
        select(models.TimetableSlot.id).where(
            models.TimetableSlot.teacher_id == teacher.id,
            models.TimetableSlot.class_id == slot.class_id,
        ).limit(1)
    )
    return P1_CLASS_CONTINUITY if result.first() else 0


async def _score_p2(
    teacher: models.Teacher,
    slot: models.TimetableSlot,
    db: AsyncSession,
) -> int:
    if not slot.subject_id:
        return 0
    result = await db.execute(
        select(models.TimetableSlot.id).where(
            models.TimetableSlot.teacher_id == teacher.id,
            models.TimetableSlot.subject_id == slot.subject_id,
        ).limit(1)
    )
    return P2_SUBJECT_EXPERTISE if result.first() else 0


# ─── Public orchestrator ──────────────────────────────────────────────────────

async def rank_candidates(
    absent_teacher: models.Teacher,
    slot: models.TimetableSlot,
    weekly_counts: dict[UUID, int],
    db: AsyncSession,
) -> list[ScoredCandidate]:
    """
    Filter → score → sort. Returns full ranked list, highest score first.
    Tie-breaker: teacher.id ascending (stable + auditable — no random()).
    """
    eligible = await filter_eligible_teachers(
        absent_teacher_id=absent_teacher.id,
        day_of_week=slot.day_of_week,
        period=slot.period,
        db=db,
    )

    scored = []
    for teacher in eligible:
        candidate = await score_teacher(
            teacher=teacher,
            absent_teacher=absent_teacher,
            slot=slot,
            weekly_counts=weekly_counts,
            db=db,
        )
        scored.append(candidate)

    scored.sort(key=lambda c: (-c.total_score, str(c.teacher.id)))
    return scored