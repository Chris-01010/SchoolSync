from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from database import get_db
from models import User, UserRole,Room
import auth
from schemas import RoomCreate, RoomUpdate, Room as RoomSchema

router = APIRouter(prefix="/rooms", tags=["Rooms"])

def require_admin(current_user: User = Depends(auth.get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user

@router.post("/", response_model=RoomSchema, status_code=status.HTTP_201_CREATED)
async def create_room(payload: RoomCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    room = Room(**payload.model_dump())
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room

@router.get("/", response_model=List[RoomSchema])
async def list_rooms(db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Room))
    return result.scalars().all()

@router.get("/{room_id}", response_model=RoomSchema)
async def get_room(room_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")
    return room

@router.patch("/{room_id}", response_model=RoomSchema)
async def update_room(room_id: uuid.UUID, payload: RoomUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(room, field, value)

    await db.commit()
    await db.refresh(room)
    return room

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(room_id: uuid.UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    await db.delete(room)
    await db.commit()
