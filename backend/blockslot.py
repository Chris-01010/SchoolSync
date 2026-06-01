from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from .database import get_db
from .models import BlockedSlot, Teacher, User, UserRole, GUID
from .schemas import BlockedSlotCreate, BlockedSlotOut
from .auth import get_current_user

router = APIRouter(prefix="/blocked-slots", tags=["Blocked Slots"])


async def get_teacher_from_user(current_user: User, db: AsyncSession) -> Teacher:
    """Helper: get Teacher profile from logged-in user"""
    result = await db.execute(select(Teacher).where(Teacher.user_id == current_user.id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return teacher


# ─── TEACHER: block their own slot ───────────────────────────────────────────
# ─── HOD / ADMIN: block any teacher's slot ───────────────────────────────────
@router.post("/", response_model=BlockedSlotOut, status_code=status.HTTP_201_CREATED)
async def create_blocked_slot(
    payload: BlockedSlotCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.TEACHER:
        teacher = await get_teacher_from_user(current_user, db)
        if teacher.id != payload.teacher_id:
            raise HTTPException(status_code=403, detail="You can only block your own slots")

    elif current_user.role not in [UserRole.HOD, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify target teacher exists
    teacher_result = await db.execute(select(Teacher).where(Teacher.id == payload.teacher_id))
    if not teacher_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Prevent duplicates
    existing = await db.execute(
        select(BlockedSlot).where(
            BlockedSlot.teacher_id == payload.teacher_id,
            BlockedSlot.day == payload.day,
            BlockedSlot.period == payload.period
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Slot already blocked for this teacher")

    slot = BlockedSlot(**payload.model_dump())
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return slot


# ─── TEACHER: see only their own blocks ──────────────────────────────────────
# ─── HOD / ADMIN: see all, optionally filter by teacher_id ───────────────────
@router.get("/", response_model=List[BlockedSlotOut])
async def get_blocked_slots(
    teacher_id: UUID = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(BlockedSlot)

    if current_user.role == UserRole.TEACHER:
        teacher = await get_teacher_from_user(current_user, db)
        query = query.where(BlockedSlot.teacher_id == teacher.id)

    elif current_user.role in [UserRole.HOD, UserRole.ADMIN]:
        if teacher_id:
            query = query.where(BlockedSlot.teacher_id == teacher_id)

    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(query)
    return result.scalars().all()


# ─── TEACHER: can remove only their own blocks ────────────────────────────────
# ─── HOD / ADMIN: can remove/override any block ──────────────────────────────
@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blocked_slot(
    slot_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(BlockedSlot).where(BlockedSlot.id == slot_id))
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Blocked slot not found")

    if current_user.role == UserRole.TEACHER:
        teacher = await get_teacher_from_user(current_user, db)
        if slot.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="You can only remove your own blocked slots")

    elif current_user.role not in [UserRole.HOD, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(slot)
    await db.commit()