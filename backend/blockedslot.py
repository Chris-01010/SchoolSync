from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from .models import GUID
from .database import get_db
from .models import BlockedSlot, Teacher, User, UserRole
from .schemas import BlockedSlotCreate, BlockedSlotOut
from .auth import get_current_user, check_role

router = APIRouter(prefix="/blocked-slots", tags=["Blocked Slots"])


@router.post("/", response_model=BlockedSlotOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(check_role([UserRole.ADMIN]))])
async def create_blocked_slot(
    payload: BlockedSlotCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check teacher exists
    teacher_result = await db.execute(select(Teacher).where(Teacher.id == payload.teacher_id))
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Check for duplicate
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


@router.get("/", response_model=List[BlockedSlotOut],
            dependencies=[Depends(check_role([UserRole.ADMIN]))])
async def get_blocked_slots(
    teacher_id: UUID = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(BlockedSlot)
    if teacher_id:
        query = query.where(BlockedSlot.teacher_id == teacher_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(check_role([UserRole.ADMIN]))])
async def delete_blocked_slot(
    slot_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BlockedSlot).where(BlockedSlot.id == slot_id))
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    await db.delete(slot)
    await db.commit()