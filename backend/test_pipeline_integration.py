# backend/test_pipeline_integration.py
#
# Story: End-to-End Relief Pipeline Integration & Performance Test
# Epic: EPIC-4  |  Story Points: 3
#
# Run with:  pytest backend/test_pipeline_integration.py -v --tb=short
#
# Tests:
#   1. Full pipeline integration  (absence → filter → score → rank → dispatch)
#   2. Performance SLA            (20-teacher school, < 5 seconds, NFR-1)
#   3. Edge: all teachers reject  (pool not exhausted, but all statuses = REJECTED)
#   4. Edge: pool exhausted       (zero eligible teachers)
#   5. Edge: single eligible      (exactly one teacher passes all filters)

import asyncio
import time
import pytest
import pytest_asyncio
from uuid import uuid4
from datetime import date

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend import models
from backend.relief_engine import rank_candidates, filter_eligible_teachers


# ─── Shared DB fixture (in-memory SQLite) ────────────────────────────────────

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

def make_teacher(db, name="Teacher", dept_id=None,blocked_slots_json=None,**kwargs):
    t = models.Teacher(
        id=uuid4(),
        name=name,
        email=f"{uuid4()}@school.com",
        department_id=dept_id or uuid4(),
        weekly_relief_cap=kwargs.pop("weekly_relief_cap", 3),
        max_weekly_hours=kwargs.pop("max_weekly_hours", 30),
        current_relief_hours=kwargs.pop("current_relief_hours", 0),
        total_hours_worked=kwargs.pop("total_hours_worked", 0),
        is_active=kwargs.pop("is_active", True),
        blocked_slots_json=blocked_slots_json or {}, **kwargs,
    )
    db.add(t)
    return t






def make_slot(db, teacher_id, day=0, period=1, class_id=None, subject_id=None, **kwargs):
    s = models.TimetableSlot(
        id=uuid4(),
        teacher_id=teacher_id,
        day_of_week=day,
        period=period,
        is_relief=False,
        class_id=class_id or uuid4(),
        subject_id=subject_id or uuid4(),
        **kwargs,
    )
    db.add(s)
    return s


def make_absence(db, teacher_id, period_start=1, period_end=1):
    a = models.Absence(
        id=uuid4(),
        teacher_id=teacher_id,
        date=date.today(),
        period_start=period_start,
        period_end=period_end,
        leave_type="sick",
        reason="Fever",
        status=models.AbsenceStatus.APPROVED,
        resolved=False,
    )
    db.add(a)
    return a


# ─── TEST 1: Full pipeline integration ────────────────────────────────────────

@pytest.mark.asyncio
async def test_full_pipeline_absence_to_assignment(db):
    """
    AC1: Integration test triggers absence, runs full pipeline, asserts assignment.

    Pipeline: absence created → absent teacher's slot identified →
              filter_eligible_teachers → score_teacher → rank_candidates →
              top candidate selected (assignment asserted).
    """
    dept_id  = uuid4()
    class_id = uuid4()
    subj_id  = uuid4()

    # Setup: absent teacher with a slot
    absent = make_teacher(db, name="Absent Teacher", dept_id=dept_id)
    vacant_slot = make_slot(db, teacher_id=absent.id, day=0, period=2,
                            class_id=class_id, subject_id=subj_id)

    # Setup: 3 candidates with varying qualifications
    best   = make_teacher(db, name="Best",   dept_id=dept_id)   # same dept
    good   = make_teacher(db, name="Good",   dept_id=uuid4())   # different dept
    basic  = make_teacher(db, name="Basic",  dept_id=uuid4())

    # Best candidate also teaches same subject → gets P2 bonus
    make_slot(db, teacher_id=best.id, day=1, period=3,
              subject_id=subj_id, class_id=uuid4())

    # Trigger: absence created
    make_absence(db, teacher_id=absent.id, period_start=2, period_end=2)
    await db.commit()

    # Run full pipeline
    ranked = await rank_candidates(
        absent_teacher=absent,
        slot=vacant_slot,
        weekly_counts={},
        db=db,
    )

    # Assert: pipeline produced a ranked list with at least one assignment
    assert len(ranked) >= 1, "Pipeline must return at least one candidate"

    # Assert: best candidate is ranked first (same dept + subject match)
    top = ranked[0]
    assert top.teacher.name == "Best", (
        f"Expected 'Best' as top candidate, got '{top.teacher.name}' "
        f"with score {top.total_score}"
    )

    # Assert: score breakdown is populated (dispatch can read it)
    assert "p1_continuity"  in top.breakdown
    assert "p2_expertise"   in top.breakdown
    assert "p3_department"  in top.breakdown
    assert "fairness"       in top.breakdown

    # Assert: absent teacher is NOT in candidates
    candidate_ids = [c.teacher.id for c in ranked]
    assert absent.id not in candidate_ids, "Absent teacher must never appear in results"


# ─── TEST 2: Performance SLA — 20 teachers, < 5 seconds ──────────────────────

@pytest.mark.asyncio
async def test_pipeline_performance_20_teachers_under_5_seconds(db):
    """
    AC2 + NFR-1: Full pipeline for a 20-teacher school completes in < 5 seconds.

    Documented results are printed to stdout and captured by pytest.
    """
    dept_id  = uuid4()
    class_id = uuid4()
    subj_id  = uuid4()

    # Seed: 1 absent teacher + 19 candidates (realistic 20-teacher school)
    absent = make_teacher(db, name="Absent", dept_id=dept_id)
    
    absent_slot=make_slot(db, teacher_id=absent.id, day=0, period=1,
              class_id=class_id, subject_id=subj_id)

    teachers = []
    for i in range(19):
        t = make_teacher(db, name=f"Teacher_{i}", dept_id=dept_id if i % 3 == 0 else uuid4())
        # Give some teachers existing slots to make scoring realistic
        if i % 2 == 0:
            make_slot(db, teacher_id=t.id, day=1, period=2,
                      subject_id=subj_id if i % 4 == 0 else uuid4())
        teachers.append(t)
    
    make_absence(db, teacher_id=absent.id)
    await db.commit()
    
    # Measure pipeline execution time
    start = time.perf_counter()
    ranked = await rank_candidates(
        absent_teacher=absent,
        slot=absent_slot,
        weekly_counts={},
        db=db,
    )
    elapsed = time.perf_counter() - start

    # Document results (visible in pytest -v output)
    print(f"\n📊 PERFORMANCE RESULTS (NFR-1)")
    print(f"   Teachers in pool : 20 (1 absent + 19 candidates)")
    print(f"   Eligible found   : {len(ranked)}")
    print(f"   Pipeline time    : {elapsed:.4f}s")
    print(f"   SLA threshold    : 5.0000s")
    print(f"   SLA status       : {'✅ PASS' if elapsed < 5.0 else '❌ FAIL'}")
    if ranked:
        print(f"   Top candidate    : {ranked[0].teacher.name} (score={ranked[0].total_score})")

    # Assert SLA
    assert elapsed < 5.0, (
        f"NFR-1 VIOLATED: Pipeline took {elapsed:.3f}s — exceeds 5-second SLA"
    )
    assert len(ranked) > 0, "Pipeline must return candidates for a 20-teacher school"


# ─── TEST 3: Edge case — all teachers reject ──────────────────────────────────

@pytest.mark.asyncio
async def test_edge_all_teachers_reject(db):
    """
    AC3: Pool not exhausted but all ReliefAssignment statuses = REJECTED.

    The pipeline (rank_candidates) still returns the ranked list —
    it's the dispatcher's responsibility to handle rejections.
    This test verifies the engine doesn't crash and returns candidates
    even when all are subsequently marked rejected.
    """
    dept_id = uuid4()
    absent  = make_teacher(db, name="Absent", dept_id=dept_id)
    slot    = make_slot(db, teacher_id=absent.id, day=0, period=3)

    # 3 valid candidates — pipeline will rank them
    c1 = make_teacher(db, name="Candidate_1", dept_id=dept_id)
    c2 = make_teacher(db, name="Candidate_2", dept_id=dept_id)
    c3 = make_teacher(db, name="Candidate_3", dept_id=dept_id)
    make_absence(db, teacher_id=absent.id)
    await db.commit()

    ranked = await rank_candidates(absent, slot, weekly_counts={}, db=db)

    # Pipeline returns candidates (dispatch layer handles rejections separately)
    assert len(ranked) == 3, "All 3 candidates must be ranked before any rejection"

    # Simulate: dispatcher marks all as REJECTED
    absence = models.Absence(
        id=uuid4(), teacher_id=absent.id, date=date.today(),
        period_start=3, period_end=3, status=models.AbsenceStatus.APPROVED,
        resolved=False,
    )
    db.add(absence)
    for candidate in ranked:
        assignment = models.ReliefAssignment(
            id=uuid4(),
            absence_id=absence.id,
            relief_teacher_id=candidate.teacher.id,
            slot_id=slot.id,
            score=candidate.total_score,
            status=models.ReliefStatus.REJECTED,
            reason_text="Teacher declined",
        )
        db.add(assignment)
    await db.commit()

    # Re-run pipeline after rejections — pool is still available (not exhausted)
    re_ranked = await rank_candidates(absent, slot, weekly_counts={}, db=db)
    assert len(re_ranked) == 3, (
        "After rejections, pipeline must still return full pool "
        "(exhaustion is tracked via current_relief_hours, not ReliefAssignment status)"
    )


# ─── TEST 4: Edge case — pool exhausted ───────────────────────────────────────

@pytest.mark.asyncio
async def test_edge_pool_exhausted(db):
    """
    AC3: Zero eligible teachers — every candidate is filtered out.

    Scenarios that exhaust the pool:
      - All at relief cap
      - All have timetable clash
      - All have blocked slots
    """
    absent = make_teacher(db, name="Absent")
    slot   = make_slot(db, teacher_id=absent.id, day=0, period=4)

    # All candidates are at cap
    for i in range(5):
        make_teacher(
            db,
            name=f"Capped_{i}",
            weekly_relief_cap=3,
            current_relief_hours=3,  # exactly at cap → filtered out
        )

    make_absence(db, teacher_id=absent.id)
    await db.commit()

    ranked = await rank_candidates(absent, slot, weekly_counts={}, db=db)

    # Assert: empty pool handled gracefully (no crash, empty list returned)
    assert ranked == [], (
        f"Exhausted pool must return empty list, got {len(ranked)} candidates"
    )


# ─── TEST 5: Edge case — single eligible teacher ──────────────────────────────

@pytest.mark.asyncio
async def test_edge_single_eligible_teacher(db):
    """
    AC3: Exactly one teacher passes all filters — must be assigned.

    All others are blocked, capped, or have timetable clashes.
    """
    dept_id = uuid4()
    absent  = make_teacher(db, name="Absent", dept_id=dept_id)
    slot    = make_slot(db, teacher_id=absent.id, day=0, period=5)

    # The one valid candidate
    only_one = make_teacher(db, name="Only_Eligible", dept_id=dept_id)

    # Everyone else is ineligible
    make_teacher(db, name="Capped",   weekly_relief_cap=2, current_relief_hours=2)
    make_teacher(db, name="Blocked",  blocked_slots_json={"0": [5]})
    make_teacher(db, name="Overload", max_weekly_hours=20, total_hours_worked=20)
    # Busy teacher has a timetable clash
    busy = make_teacher(db, name="Busy")
    make_slot(db, teacher_id=busy.id, day=0, period=5)  # clash with the absent slot

    make_absence(db, teacher_id=absent.id)
    await db.commit()

    ranked = await rank_candidates(absent, slot, weekly_counts={}, db=db)

    # Assert: exactly one candidate
    assert len(ranked) == 1, (
        f"Expected 1 eligible teacher, got {len(ranked)}: "
        f"{[c.teacher.name for c in ranked]}"
    )
    assert ranked[0].teacher.id == only_one.id
    assert ranked[0].teacher.name == "Only_Eligible"

    # Assert: score is valid (fairness=10, dept match=15, total >= 15)
    assert ranked[0].total_score >= 15, (
        f"Single candidate score too low: {ranked[0].total_score}"
    )