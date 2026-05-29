# backend/notification_hub.py
# ─────────────────────────────────────────────────────────────
# In-memory SSE broadcast hub for real-time notifications.
#
# How it works:
#   1. Each connected client (browser tab) registers an asyncio.Queue
#      keyed by their user_id via connect().
#   2. When notify() saves a notification to the DB, it also calls
#      broadcast() which pushes the notification dict into every
#      Queue belonging to that user_id.
#   3. The SSE endpoint reads from the Queue and yields events.
#
# Limitations (acceptable for a single-server demo/MVP):
#   - In-memory only — won't work across multiple server processes.
#   - If the server restarts, all SSE connections drop (clients reconnect).
#   - For production scale, replace with Redis pub/sub.
# ─────────────────────────────────────────────────────────────

import asyncio
from collections import defaultdict
from typing import Dict, Set
from uuid import UUID


class NotificationHub:
    """Per-user fan-out for SSE notification streams."""

    def __init__(self):
        # user_id (str) → set of asyncio.Queue
        self._subscribers: Dict[str, Set[asyncio.Queue]] = defaultdict(set)

    def connect(self, user_id: str) -> asyncio.Queue:
        """Register a new SSE client. Returns the Queue to read from."""
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers[user_id].add(q)
        return q

    def disconnect(self, user_id: str, q: asyncio.Queue):
        """Unregister an SSE client."""
        self._subscribers[user_id].discard(q)
        if not self._subscribers[user_id]:
            del self._subscribers[user_id]

    async def broadcast(self, user_id: str, payload: dict):
        """Push a notification payload to all connected clients of a user."""
        uid = str(user_id)
        for q in list(self._subscribers.get(uid, [])):
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                pass  # drop if client is too slow


# Singleton — import this in leave_api.py and the SSE endpoint
hub = NotificationHub()