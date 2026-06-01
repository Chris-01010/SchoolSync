# backend/relief_dispatch.py
from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from . import models

logger = logging.getLogger(__name__)
DEADLINE_MINUTES = 15


async def dispatch_to_pool(
    assignment: models.ReliefAssignment,
    ranked: list,           # list of ScoredCandidate from rank_candidates()
    db: AsyncSession,
    deadline_minutes: int = DEADLINE_MINUTES,
):
    """Call this right after rank_candidates() returns."""
    # Store the full ranked pool as a JSON list of teacher_id strings
    assignment.ranked_pool = json.dumps([str(c.teacher.id) for c in ranked])
    assignment.rank_index = 0
    await _send_to_current(assignment, deadline_minutes, db)


async def _send_to_current(
    assignment: models.ReliefAssignment,
    deadline_minutes: int,
    db: AsyncSession,
):
    pool = json.loads(assignment.ranked_pool or "[]")

    if assignment.rank_index >= len(pool):
        assignment.status = models.ReliefStatus.PENDING  # reuse as POOL_EXHAUSTED signal
        assignment.reason_text = "POOL_EXHAUSTED"
        await db.commit()
        await _alert_admins(assignment, db)
        return

    assignment.relief_teacher_id = pool[assignment.rank_index]
    assignment.status = models.ReliefStatus.PENDING
    assignment.deadline_at = datetime.now(timezone.utc) + timedelta(minutes=deadline_minutes)
    await db.commit()
    logger.info(
        "Dispatched assignment %s to teacher %s (rank %d)",
        assignment.id, assignment.relief_teacher_id, assignment.rank_index + 1
    )


async def expire_overdue_assignments(db: AsyncSession):
    """Called by APScheduler every minute."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(models.ReliefAssignment).where(
            models.ReliefAssignment.status == models.ReliefStatus.PENDING,
            models.ReliefAssignment.deadline_at <= now,
            models.ReliefAssignment.ranked_pool.isnot(None),  # only dispatch-managed ones
        )
    )
    for assignment in result.scalars().all():
        logger.info("Assignment %s timed out — rolling over.", assignment.id)
        assignment.status = models.ReliefStatus.EXPIRED  # add EXPIRED to your enum (see below)
        assignment.rank_index += 1
        await _send_to_current(assignment, DEADLINE_MINUTES, db)


async def _alert_admins(assignment: models.ReliefAssignment, db: AsyncSession):
    result = await db.execute(
        select(models.User).where(models.User.role == models.UserRole.ADMIN)
    )
    for admin in result.scalars().all():
        logger.warning(
            "POOL EXHAUSTED — no teacher accepted assignment %s. Admin: %s",
            assignment.id, admin.email
        )
        # swap in your email_service call here when ready