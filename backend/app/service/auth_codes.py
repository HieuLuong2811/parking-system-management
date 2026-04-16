from __future__ import annotations

import asyncio
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple


@dataclass(frozen=True)
class AuthCodeData:
    user_code: str
    roles: List[str]
    expires_at: datetime


class AuthCodeStore:
    def __init__(self, ttl_seconds: int) -> None:
        self._ttl = timedelta(seconds=ttl_seconds)
        self._lock = asyncio.Lock()
        self._codes: Dict[str, AuthCodeData] = {}

    def _purge_expired_unsafe(self, now: datetime) -> None:
        expired = [code for code, data in self._codes.items() if data.expires_at <= now]
        for code in expired:
            self._codes.pop(code, None)

    async def create_code(self, user_code: str, roles: List[str]) -> Tuple[str, datetime]:
        now = datetime.utcnow()
        expires_at = now + self._ttl
        async with self._lock:
            self._purge_expired_unsafe(now)
            while True:
                code = secrets.token_urlsafe(24)
                if code not in self._codes:
                    break
            self._codes[code] = AuthCodeData(user_code=user_code, roles=roles, expires_at=expires_at)
        return code, expires_at

    async def exchange_code(self, code: str) -> Optional[AuthCodeData]:
        now = datetime.utcnow()
        async with self._lock:
            self._purge_expired_unsafe(now)
            data = self._codes.pop(code, None)
            if not data:
                return None
            if data.expires_at <= now:
                return None
            return data

