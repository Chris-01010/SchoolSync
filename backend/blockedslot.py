from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from .models import GUID
from .database import get_db
from .models import BlockedSlot, Teacher, User, UserRole
from .schemas import (
    BlockedSlotCreate, BlockedSlotOut,
    TeacherWeekResponse, DaySchedule, WeekSlot
)
from .auth import get_current_user, check_role

router = APIRouter(prefix="/blocked-slots", tags=["Blocked Slots"])

DAYS    = list(range(5))      # 0=Mon .. 4=Fri
PERIODS = list(range(1, 9))   # periods 1–8


# ── HOD: get all teachers (for dropdown) ──────────────────────────────────────
@router.get("/teachers-list")
async def get_teachers_list(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Teacher))
        teachers = result.scalars().all()
        return [{"id": str(t.id), "name": t.name} for t in teachers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Teacher: block a slot ──────────────────────────────────────────────────────
@router.post(
    "/",
    response_model=BlockedSlotOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(check_role([UserRole.TEACHER, UserRole.HOD]))]
)
async def create_blocked_slot(
    payload: BlockedSlotCreate,
    db: AsyncSession = Depends(get_db)
):
    teacher = (await db.execute(
        select(Teacher).where(Teacher.id == payload.teacher_id)
    )).scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    existing = (await db.execute(
        select(BlockedSlot).where(
            BlockedSlot.teacher_id == payload.teacher_id,
            BlockedSlot.day == payload.day,
            BlockedSlot.period == payload.period
        )
    )).scalar_one_or_none()

    if existing:
        if existing.is_hod_locked:
            raise HTTPException(
                status_code=423,
                detail="This slot has been permanently released by the HOD. You cannot re-block it."
            )
        raise HTTPException(status_code=409, detail="Slot already blocked for this teacher")

    slot = BlockedSlot(**payload.model_dump())
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return slot


# ── HOD: list all active blocks (optionally filtered by teacher) ───────────────
@router.get(
    "/",
    response_model=List[BlockedSlotOut],
    dependencies=[Depends(check_role([UserRole.HOD, UserRole.ADMIN]))]
)
async def get_blocked_slots(
    teacher_id: UUID = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(BlockedSlot).where(BlockedSlot.is_hod_locked == False)
    if teacher_id:
        query = query.where(BlockedSlot.teacher_id == teacher_id)
    result = await db.execute(query)
    return result.scalars().all()


# ── HOD: full weekly grid for one teacher ─────────────────────────────────────
@router.get(
    "/week/{teacher_id}",
    response_model=TeacherWeekResponse,
)
async def get_teacher_week(
    teacher_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    try:
        teacher = (await db.execute(
            select(Teacher).where(Teacher.id == teacher_id)
        )).scalar_one_or_none()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")

        all_slots = (await db.execute(
            select(BlockedSlot).where(BlockedSlot.teacher_id == teacher_id)
        )).scalars().all()

        slot_map = {(s.day, s.period): s for s in all_slots}

        schedule = []
        for day in DAYS:
            day_slots = []
            for period in PERIODS:
                entry = slot_map.get((day, period))
                if entry:
                    day_slots.append(WeekSlot(
                        period=period,
                        is_blocked=not entry.is_hod_locked,
                        is_hod_locked=entry.is_hod_locked,
                        block_id=entry.id if not entry.is_hod_locked else None,
                        reason=entry.reason if not entry.is_hod_locked else None,
                    ))
                else:
                    day_slots.append(WeekSlot(
                        period=period,
                        is_blocked=False,
                        is_hod_locked=False,
                    ))
            schedule.append(DaySchedule(day=day, slots=day_slots))

        return TeacherWeekResponse(
            teacher_id=teacher.id,
            teacher_name=teacher.name,
            schedule=schedule
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── HOD: remove block + lock slot ─────────────────────────────────────────────
@router.delete(
    "/{slot_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(check_role([UserRole.HOD, UserRole.ADMIN]))]
)
async def hod_remove_block(
    slot_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(BlockedSlot).where(BlockedSlot.id == slot_id)
    )
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    if slot.is_hod_locked:
        raise HTTPException(status_code=409, detail="Slot is already HOD-locked")

    slot.is_hod_locked = True
    slot.reason = None
    await db.commit()

    return {
        "message": "Block removed. Slot is HOD-locked — teacher cannot re-block.",
        "slot_id": str(slot_id),
        "day": slot.day,
        "period": slot.period
    }