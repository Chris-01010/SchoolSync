# backend/test_relief_engine.py
# Run with:  pytest backend/test_relief_engine.py -v
#
# These tests use a real SQLite in-memory DB so they test the actual
# queries, not mocks. No running server needed.

import asyncio
import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import date

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend import models
from backend.relief_engine import filter_eligible_teachers, score_teacher, rank_candidates, ScoredCandidate

# ─── DB fixture ───────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
    await engine.dispose()


# ─── Seed helpers ─────────────────────────────────────────────────────────────

def make_teacher(db, **kwargs) -> models.Teacher:
    defaults = dict(
        id=uuid4(),
        name="Teacher",
        email=f"{uuid4()}@school.com",
        department_id=uuid4(),
        weekly_relief_cap=3,
        max_weekly_hours=30,
        current_relief_hours=0,
        total_hours_worked=0,
        is_active=True,
        blocked_slots_json={},
    )
    defaults.update(kwargs)
    t = models.Teacher(**defaults)
    db.add(t)
    return t


def make_slot(db, teacher_id, day_of_week=0, period=1, **kwargs) -> models.TimetableSlot:
    defaults = dict(
        id=uuid4(),
        teacher_id=teacher_id,
        day_of_week=day_of_week,
        period=period,
        is_relief=False,
        class_id=uuid4(),
        subject_id=uuid4(),
    )
    defaults.update(kwargs)
    s = models.TimetableSlot(**defaults)
    db.add(s)
    return s


# ─── Filter tests ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_f1_excludes_teacher_with_timetable_clash(db):
    """F1: teacher already teaching day=0 period=1 must be excluded."""
    absent = make_teacher(db, name="Absent")
    busy   = make_teacher(db, name="Busy")
    make_slot(db, teacher_id=busy.id, day_of_week=0, period=1)
    await db.commit()

    eligible = await filter_eligible_teachers(absent.id, day_of_week=0, period=1, db=db)
    ids = [t.id for t in eligible]

    assert busy.id not in ids


@pytest.mark.asyncio
async def test_f2_excludes_teacher_at_relief_cap(db):
    """F2: teacher who has hit weekly_relief_cap must be excluded."""
    absent  = make_teacher(db, name="Absent")
    capped  = make_teacher(db, name="Capped", weekly_relief_cap=3, current_relief_hours=3)
    await db.commit()

    eligible = await filter_eligible_teachers(absent.id, day_of_week=0, period=1, db=db)
    ids = [t.id for t in eligible]

    assert capped.id not in ids


@pytest.mark.asyncio
async def test_f3_excludes_teacher_with_blocked_slot(db):
    """F3: teacher with day 0 period 1 in blocked_slots must be excluded."""
    absent  = make_teacher(db, name="Absent")
    blocked = make_teacher(db, name="Blocked", blocked_slots_json={"0": [1]})
    await db.commit()

    eligible = await filter_eligible_teachers(absent.id, day_of_week=0, period=1, db=db)
    ids = [t.id for t in eligible]

    assert blocked.id not in ids


@pytest.mark.asyncio
async def test_f4_excludes_teacher_at_workload_cap(db):
    """F4: teacher who has hit max_weekly_hours must be excluded."""
    absent    = make_teacher(db, name="Absent")
    overloaded = make_teacher(db, name="Overloaded", max_weekly_hours=30, total_hours_worked=30)
    await db.commit()

    eligible = await filter_eligible_teachers(absent.id, day_of_week=0, period=1, db=db)
    ids = [t.id for t in eligible]

    assert overloaded.id not in ids


@pytest.mark.asyncio
async def test_f5_excludes_absent_teacher_themselves(db):
    """F5: the absent teacher must never appear in the eligible pool."""
    absent = make_teacher(db, name="Absent")
    await db.commit()

    eligible = await filter_eligible_teachers(absent.id, day_of_week=0, period=1, db=db)
    ids = [t.id for t in eligible]

    assert absent.id not in ids


@pytest.mark.asyncio
async def test_eligible_teacher_passes_all_filters(db):
    """Sanity: a clean teacher with no blocks or caps must be included."""
    absent = make_teacher(db, name="Absent")
    clean  = make_teacher(db, name="Clean")
    await db.commit()

    eligible = await filter_eligible_teachers(absent.id, day_of_week=0, period=1, db=db)
    ids = [t.id for t in eligible]

    assert clean.id in ids


# ─── Scoring tests ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_p1_class_continuity_awarded(db):
    """P1: teacher who teaches the same class_id scores 40 pts."""
    dept_id  = uuid4()
    class_id = uuid4()
    subj_id  = uuid4()

    absent    = make_teacher(db, name="Absent",    department_id=dept_id)
    candidate = make_teacher(db, name="Candidate", department_id=uuid4())

    # Vacant slot
    slot = make_slot(db, teacher_id=absent.id, class_id=class_id, subject_id=subj_id)
    # Candidate already teaches that class in another period
    make_slot(db, teacher_id=candidate.id, day_of_week=2, period=3,
              class_id=class_id, subject_id=uuid4())
    await db.commit()

    result = await score_teacher(candidate, absent, slot, weekly_counts={}, db=db)

    assert result.breakdown["p1_continuity"] == 40


@pytest.mark.asyncio
async def test_p2_subject_expertise_awarded(db):
    """P2: teacher who teaches the same subject scores 25 pts."""
    dept_id = uuid4()
    subj_id = uuid4()

    absent    = make_teacher(db, name="Absent",    department_id=dept_id)
    candidate = make_teacher(db, name="Candidate", department_id=uuid4())

    slot = make_slot(db, teacher_id=absent.id, class_id=uuid4(), subject_id=subj_id)
    make_slot(db, teacher_id=candidate.id, day_of_week=3, period=2,
              class_id=uuid4(), subject_id=subj_id)
    await db.commit()

    result = await score_teacher(candidate, absent, slot, weekly_counts={}, db=db)

    assert result.breakdown["p2_expertise"] == 25


@pytest.mark.asyncio
async def test_p3_same_department_awarded(db):
    """P3: teacher in the same department scores 15 pts."""
    dept_id = uuid4()

    absent    = make_teacher(db, name="Absent",    department_id=dept_id)
    candidate = make_teacher(db, name="Candidate", department_id=dept_id)

    slot = make_slot(db, teacher_id=absent.id)
    await db.commit()

    result = await score_teacher(candidate, absent, slot, weekly_counts={}, db=db)

    assert result.breakdown["p3_department"] == 15


@pytest.mark.asyncio
async def test_fairness_bonus_inversely_proportional(db):
    """Fairness: teacher with 0 relief duties gets 10 pts; one with 8 gets 2 pts."""
    dept_id = uuid4()
    absent    = make_teacher(db, name="Absent",   department_id=dept_id)
    fresh     = make_teacher(db, name="Fresh",    department_id=uuid4())
    overused  = make_teacher(db, name="Overused", department_id=uuid4())
    slot = make_slot(db, teacher_id=absent.id)
    await db.commit()

    fresh_result    = await score_teacher(fresh,    absent, slot, weekly_counts={overused.id: 8}, db=db)
    overused_result = await score_teacher(overused, absent, slot, weekly_counts={overused.id: 8}, db=db)

    assert fresh_result.breakdown["fairness"]    == 10
    assert overused_result.breakdown["fairness"] == 2


@pytest.mark.asyncio
async def test_rank_candidates_order(db):
    """rank_candidates returns highest score first."""
    dept_id = uuid4()
    subj_id = uuid4()

    absent    = make_teacher(db, name="Absent",   department_id=dept_id)
    # high: same dept + subject match
    high      = make_teacher(db, name="High",     department_id=dept_id)
    # low: neither
    low       = make_teacher(db, name="Low",      department_id=uuid4())

    slot = make_slot(db, teacher_id=absent.id, subject_id=subj_id)
    make_slot(db, teacher_id=high.id, day_of_week=2, period=5, subject_id=subj_id)
    await db.commit()

    ranked = await rank_candidates(absent, slot, weekly_counts={}, db=db)
    names  = [c.teacher.name for c in ranked]

    assert names.index("High") < names.index("Low")