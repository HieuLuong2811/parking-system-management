from __future__ import annotations

from datetime import datetime, timedelta
from typing import List, Tuple

import hashlib
import jwt
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.auth import TokenPayload
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)

def hash_password(raw: str) -> str:
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return pwd_context.hash(digest)


def verify_password(raw: str, hashed: str) -> bool:
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return pwd_context.verify(digest, hashed)


def create_access_token(subject: str, roles: List[str], expires_delta: timedelta | None = None) -> Tuple[str, datetime]:
    to_encode = {
        "sub": subject,
        "user_code": subject,
        "roles": roles,
    }
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
    return token, expire


def decode_access_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
