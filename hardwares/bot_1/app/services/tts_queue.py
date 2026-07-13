import asyncio
from collections import deque
from dataclasses import dataclass
from typing import Optional


@dataclass
class TtsJob:
    """A single unit of work for the TTS pipeline: one sentence-sized chunk of text."""
    seq: int
    text: Optional[str]  # None marks the sentinel that tells a worker to stop


class TtsQueue:
    """FIFO queue ADT of pending TTS synthesis jobs.

    A producer (the token stream in the /ws/chat handler) enqueues sentence-sized
    chunks as soon as they're complete; a consumer worker dequeues and synthesizes
    them one at a time, in order, without waiting for the rest of the reply.
    """

    def __init__(self):
        self._items = deque()
        self._not_empty = asyncio.Event()

    def enqueue(self, job: TtsJob) -> None:
        self._items.append(job)
        self._not_empty.set()

    async def dequeue(self) -> TtsJob:
        while not self._items:
            self._not_empty.clear()
            await self._not_empty.wait()
        return self._items.popleft()

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def __len__(self) -> int:
        return len(self._items)
