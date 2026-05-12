import asyncio
import os
from database import AsyncSessionLocal
import models
from solver import TimetableSolver
from sqlalchemy import select
import json
from datetime import datetime

# Gracefully handle missing Celery/Redis for local dev
try:
    from celery import Celery

    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    celery = Celery(
        "schoolsync_worker",
        broker=CELERY_BROKER_URL,
        backend=CELERY_RESULT_BACKEND
    )
except Exception:
    celery = None

async def _generate_timetable_internal(school_id: str):
    async with AsyncSessionLocal() as db:
        # 1. Fetch data
        teachers_res = await db.execute(select(models.Teacher))
        teachers = teachers_res.scalars().all()
        
        rooms_res = await db.execute(select(models.Room))
        rooms = rooms_res.scalars().all()
        
        subjects_res = await db.execute(select(models.Subject))
        subjects = subjects_res.scalars().all()
        
        # For classes, we need their lesson requirements. 
        # In this MVP, we'll assume a simplified requirement for trial.
        # In a full app, you'd have a ClassLessonRequirement model.
        classes_res = await db.execute(select(models.ClassRoom))
        classes_raw = classes_res.scalars().all()
        
        # Mock requirements for the trial if none exist
        classes = []
        for c in classes_raw:
            classes.append({
                "id": str(c.id),
                "name": c.name,
                "lessons": [
                    {"subject_id": str(subjects[0].id), "teacher_id": str(teachers[0].id), "count": 2},
                    {"subject_id": str(subjects[1].id) if len(subjects) > 1 else str(subjects[0].id), "teacher_id": str(teachers[1].id) if len(teachers) > 1 else str(teachers[0].id), "count": 1}
                ] if len(teachers) > 0 and len(subjects) > 0 else []
            })

        # 2. Run Solver
        solver = TimetableSolver(
            teachers=[{"id": str(t.id), "name": t.name, "blocked_slots": t.blocked_slots} for t in teachers],
            classes=classes,
            rooms=[{"id": str(r.id), "name": r.name} for r in rooms],
            subjects=[{"id": str(s.id), "name": s.name} for s in subjects],
            constraints={},
            days=5,
            periods=8
        )
        
        result = solver.solve()
        
        if result["status"] == "success":
            # 3. Save Version
            version = models.TimetableVersion(
                school_id=school_id,
                published_at=datetime.utcnow(),
                is_active=False,
                data_snapshot=result["data"]
            )
            db.add(version)
            await db.commit()
            await db.refresh(version)
            
            # 4. Save Slots
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
            return {"status": "success", "version_id": str(version.id)}
        else:
            return {"status": "failed", "error": result.get("error")}

if celery:
    @celery.task
    def generate_timetable_task(school_id: str):
        return asyncio.run(_generate_timetable_internal(school_id))
else:
    # Stub for local dev without Celery
    class _FakeTask:
        def delay(self, *args, **kwargs):
            class _Result:
                id = "local-stub"
            return _Result()
    generate_timetable_task = _FakeTask()
