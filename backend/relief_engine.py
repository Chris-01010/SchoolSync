# backend/relief_engine.py  — replace the entire file content

from __future__ import annotations

import json
from dataclasses import dataclass, field
from uuid import UUID
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from . import models


P1_CLASS_CONTINUITY  = 40
P2_SUBJECT_EXPERTISE = 25
P3_SAME_DEPARTMENT   = 15
FAIRNESS_MAX         = 10


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


async def filter_eligible_teachers(
    absent_teacher_id: UUID,
    day_of_week: int,
    period: int,
    db: AsyncSession,
) -> list[models.Teacher]:
    absent_str = str(absent_teacher_id)

    busy_result = await db.execute(
        select(models.TimetableSlot.teacher_id).where(
            models.TimetableSlot.day_of_week == day_of_week,
            models.TimetableSlot.period == period,
            models.TimetableSlot.is_relief == False,
        )
    )
    # Normalize to strings for safe comparison
    busy_ids: set[str] = {str(row[0]) for row in busy_result.all()}

    all_result = await db.execute(
        select(models.Teacher).where(models.Teacher.is_active == True)
    )
    candidates = all_result.scalars().all()

    eligible: list[models.Teacher] = []
    for teacher in candidates:
        if str(teacher.id) == absent_str:          # F5 — normalize to str
            continue
        if str(teacher.id) in busy_ids:            # F1
            continue
        if (
            teacher.weekly_relief_cap is not None
            and teacher.current_relief_hours >= teacher.weekly_relief_cap
        ):                                          # F2
            continue
        if _is_slot_blocked(teacher, day_of_week, period):  # F3
            continue
        if (
            teacher.max_weekly_hours is not None
            and teacher.total_hours_worked >= teacher.max_weekly_hours
        ):                                          # F4
            continue
        eligible.append(teacher)

    return eligible


def _is_slot_blocked(teacher: models.Teacher, day_of_week: int, period: int) -> bool:
    raw = teacher.blocked_slots_json
    if not raw:
        return False
    try:
        slots = json.loads(raw) if isinstance(raw, str) else raw
        return period in slots.get(str(day_of_week), [])
    except (TypeError, ValueError):
        return False


async def rank_candidates(
    absent_teacher: models.Teacher,
    slot: models.TimetableSlot,
    weekly_counts: dict[UUID, int],
    db: AsyncSession,
) -> list[ScoredCandidate]:
    eligible = await filter_eligible_teachers(
        absent_teacher_id=absent_teacher.id,
        day_of_week=slot.day_of_week,
        period=slot.period,
        db=db,
    )

    if not eligible:
        return []

    eligible_ids = [t.id for t in eligible]

    # ── Batch query 1: which eligible teachers teach this class_id? ──────────
    class_teacher_ids: set[str] = set()
    if slot.class_id:
        r = await db.execute(
            select(models.TimetableSlot.teacher_id).where(
                models.TimetableSlot.teacher_id.in_(eligible_ids),
                models.TimetableSlot.class_id == slot.class_id,
            ).distinct()
        )
        class_teacher_ids = {str(row[0]) for row in r.all()}

    # ── Batch query 2: which eligible teachers teach this subject_id? ────────
    subject_teacher_ids: set[str] = set()
    if slot.subject_id:
        r = await db.execute(
            select(models.TimetableSlot.teacher_id).where(
                models.TimetableSlot.teacher_id.in_(eligible_ids),
                models.TimetableSlot.subject_id == slot.subject_id,
            ).distinct()
        )
        subject_teacher_ids = {str(row[0]) for row in r.all()}

    scored = []
    for teacher in eligible:
        tid = str(teacher.id)
        p1 = P1_CLASS_CONTINUITY  if tid in class_teacher_ids   else 0
        p2 = P2_SUBJECT_EXPERTISE if tid in subject_teacher_ids else 0
        p3 = P3_SAME_DEPARTMENT   if teacher.department_id == absent_teacher.department_id else 0
        fairness = max(0, FAIRNESS_MAX - weekly_counts.get(teacher.id, 0))

        breakdown = {
            "p1_continuity": p1,
            "p2_expertise":  p2,
            "p3_department": p3,
            "p4_fallback":   0,
            "fairness":      fairness,
        }
        scored.append(ScoredCandidate(
            teacher=teacher,
            total_score=p1 + p2 + p3 + fairness,
            breakdown=breakdown,
        ))

    scored.sort(key=lambda c: (-c.total_score, str(c.teacher.id)))
    return scored


# Keep these for backward compatibility with existing tests
async def score_teacher(teacher, absent_teacher, slot, weekly_counts, db):
    """Single-teacher scoring — used by tests. rank_candidates uses the batched version."""
    class_teacher_ids: set[str] = set()
    if slot.class_id:
        r = await db.execute(
            select(models.TimetableSlot.teacher_id).where(
                models.TimetableSlot.teacher_id == teacher.id,
                models.TimetableSlot.class_id == slot.class_id,
            ).limit(1)
        )
        if r.first():
            class_teacher_ids.add(str(teacher.id))

    subject_teacher_ids: set[str] = set()
    if slot.subject_id:
        r = await db.execute(
            select(models.TimetableSlot.teacher_id).where(
                models.TimetableSlot.teacher_id == teacher.id,
                models.TimetableSlot.subject_id == slot.subject_id,
            ).limit(1)
        )
        if r.first():
            subject_teacher_ids.add(str(teacher.id))

    tid = str(teacher.id)
    p1 = P1_CLASS_CONTINUITY  if tid in class_teacher_ids   else 0
    p2 = P2_SUBJECT_EXPERTISE if tid in subject_teacher_ids else 0
    p3 = P3_SAME_DEPARTMENT   if teacher.department_id == absent_teacher.department_id else 0
    fairness = max(0, FAIRNESS_MAX - weekly_counts.get(teacher.id, 0))

    breakdown = {
        "p1_continuity": p1,
        "p2_expertise":  p2,
        "p3_department": p3,
        "p4_fallback":   0,
        "fairness":      fairness,
    }
    return ScoredCandidate(
        teacher=teacher,
        total_score=p1 + p2 + p3 + fairness,
        breakdown=breakdown,
    )