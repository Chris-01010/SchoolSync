import asyncio
import os
from datetime import datetime, timezone

from sqlalchemy import select

from .database import AsyncSessionLocal
from . import models
from .solver import TimetableSolver
from .leave_api import dispatch_relief_for_absence, notify
from .models import (
    Absence,
    ReliefAssignment,
    AbsenceStatus,
    ReliefStatus
)

# Gracefully handle missing Celery/Redis for local dev
try:
    from celery import Celery

    CELERY_BROKER_URL = os.getenv(
        "CELERY_BROKER_URL",
        "redis://localhost:6379/0"
    )

    CELERY_RESULT_BACKEND = os.getenv(
        "CELERY_RESULT_BACKEND",
        "redis://localhost:6379/0"
    )

    celery = Celery(
        "schoolsync_worker",
        broker=CELERY_BROKER_URL,
        backend=CELERY_RESULT_BACKEND
    )

except Exception:
    celery = None


# =========================================================
# TIMETABLE GENERATION
# =========================================================

async def _generate_timetable_internal(school_id: str):

    async with AsyncSessionLocal() as db:

        # Fetch data
        teachers_res = await db.execute(select(models.Teacher))
        teachers = teachers_res.scalars().all()

        rooms_res = await db.execute(select(models.Room))
        rooms = rooms_res.scalars().all()

        subjects_res = await db.execute(select(models.Subject))
        subjects = subjects_res.scalars().all()

        classes_res = await db.execute(select(models.ClassRoom))
        classes_raw = classes_res.scalars().all()

        classes = []

        for c in classes_raw:

            classes.append({
                "id": str(c.id),
                "name": c.name,
                "lessons": [
                    {
                        "subject_id": str(subjects[0].id),
                        "teacher_id": str(teachers[0].id),
                        "count": 2
                    },
                    {
                        "subject_id": (
                            str(subjects[1].id)
                            if len(subjects) > 1
                            else str(subjects[0].id)
                        ),
                        "teacher_id": (
                            str(teachers[1].id)
                            if len(teachers) > 1
                            else str(teachers[0].id)
                        ),
                        "count": 1
                    }
                ] if len(teachers) > 0 and len(subjects) > 0 else []
            })

        # Run solver
        solver = TimetableSolver(
            teachers=[
                {
                    "id": str(t.id),
                    "name": t.name,
                    "blocked_slots": t.blocked_slots
                }
                for t in teachers
            ],
            classes=classes,
            rooms=[
                {
                    "id": str(r.id),
                    "name": r.name
                }
                for r in rooms
            ],
            subjects=[
                {
                    "id": str(s.id),
                    "name": s.name
                }
                for s in subjects
            ],
            constraints={},
            days=5,
            periods=8
        )

        result = solver.solve()

        if result["status"] == "success":

            # Save timetable version
            version = models.TimetableVersion(
                school_id=school_id,
                published_at=datetime.utcnow(),
                is_active=False,
                data_snapshot=result["data"]
            )

            db.add(version)

            await db.commit()
            await db.refresh(version)

            # Save timetable slots
            for slot in result["data"]:

                db_slot = models.TimetableSlot(
                    timetable_version_id=version.id,
                    teacher_id=slot['teacher_id'],
                    class_id=slot['class_id'],
                    room_id=slot['room_id'],
                    subject_id=slot['subject_id'],
                    day_of_week=slot['day'],
                    period=slot['period']
                )

                db.add(db_slot)

            await db.commit()

            return {
                "status": "success",
                "version_id": str(version.id)
            }

        return {
            "status": "failed",
            "error": result.get("error")
        }


# =========================================================
# CELERY TASKS
# =========================================================

if celery:

    @celery.task
    def generate_timetable_task(school_id: str):
        return asyncio.run(_generate_timetable_internal(school_id))


    @celery.task
    def auto_approve_emergency_leave(absence_id: str):
        asyncio.run(_auto_approve_emergency_leave(absence_id))


    async def _auto_approve_emergency_leave(absence_id: str):

        async with AsyncSessionLocal() as db:

            result = await db.execute(
                select(Absence).where(
                    Absence.id == absence_id
                )
            )

            absence = result.scalar_one_or_none()

            if not absence:
                return

            # Already manually handled
            if absence.status != AbsenceStatus.PENDING:
                return

            absence.status = AbsenceStatus.APPROVED
            absence.auto_approved = True

            await db.commit()

            # Trigger relief assignment flow
            await dispatch_relief_for_absence(absence.id, db)

            # Notify teacher
            await notify(
                db,
                absence.teacher_id,
                "Emergency Leave Auto-Approved",
                "Your emergency leave was automatically approved after HOD timeout."
            )


    @celery.task
    def reassign_relief_on_timeout(assignment_id: str):
        asyncio.run(_reassign_relief_on_timeout(assignment_id))


    async def _reassign_relief_on_timeout(assignment_id: str):

        async with AsyncSessionLocal() as db:

            result = await db.execute(
                select(ReliefAssignment).where(
                    ReliefAssignment.id == assignment_id
                )
            )

            assignment = result.scalar_one_or_none()

            if not assignment:
                return

            # Already responded
            if assignment.status != ReliefStatus.PENDING:
                return

            assignment.status = ReliefStatus.REJECTED

            await db.commit()

            print(
                f"Relief assignment {assignment_id} timed out."
            )


else:

    # Local dev fallback without Celery/Redis
    class _FakeTask:

        def delay(self, *args, **kwargs):

            class _Result:
                id = "local-stub"

            return _Result()


    generate_timetable_task = _FakeTask()
    auto_approve_emergency_leave = _FakeTask()
    reassign_relief_on_timeout = _FakeTask()