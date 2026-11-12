"""Password hashing and stateless access tokens.

Deliberately dependency-light: ``hashlib.scrypt`` for passwords (no native
build required, memory-hard) and a small HS256 JWT implementation on top of
``hmac``/``hashlib``. Both are covered by ``tests/test_security.py``.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

_SCRYPT_N = 2**14
_SCRYPT_R = 8
_SCRYPT_P = 1
_SCRYPT_DKLEN = 32


class InvalidTokenError(Exception):
    """Raised when a token is malformed, has a bad signature or has expired."""


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=_SCRYPT_N,
        r=_SCRYPT_R,
        p=_SCRYPT_P,
        dklen=_SCRYPT_DKLEN,
    )
    return "scrypt${}${}${}${}${}".format(
        _SCRYPT_N,
        _SCRYPT_R,
        _SCRYPT_P,
        _b64url_encode(salt),
        _b64url_encode(derived),
    )


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, n, r, p, salt_b64, hash_b64 = stored.split("$")
        if scheme != "scrypt":
            return False
        expected = _b64url_decode(hash_b64)
        derived = hashlib.scrypt(
            password.encode("utf-8"),
            salt=_b64url_decode(salt_b64),
            n=int(n),
            r=int(r),
            p=int(p),
            dklen=len(expected),
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(derived, expected)


def create_access_token(
    subject: str | int,
    *,
    secret_key: str,
    role: str = "reader",
    ttl_minutes: int = 480,
    now: int | None = None,
) -> str:
    issued_at = int(time.time()) if now is None else int(now)
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(subject),
        "role": role,
        "iat": issued_at,
        "exp": issued_at + ttl_minutes * 60,
    }
    signing_input = ".".join(
        [
            _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8")),
            _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8")),
        ]
    )
    signature = hmac.new(
        secret_key.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256
    ).digest()
    return f"{signing_input}.{_b64url_encode(signature)}"


def decode_access_token(
    token: str, *, secret_key: str, now: int | None = None
) -> dict[str, Any]:
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
    except ValueError as exc:
        raise InvalidTokenError("Malformed token") from exc

    signing_input = f"{header_b64}.{payload_b64}"
    expected_signature = hmac.new(
        secret_key.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256
    ).digest()

    try:
        provided_signature = _b64url_decode(signature_b64)
        header = json.loads(_b64url_decode(header_b64))
        payload = json.loads(_b64url_decode(payload_b64))
    except (ValueError, json.JSONDecodeError) as exc:
        raise InvalidTokenError("Malformed token") from exc

    if not hmac.compare_digest(provided_signature, expected_signature):
        raise InvalidTokenError("Bad signature")
    if header.get("alg") != "HS256":
        raise InvalidTokenError("Unsupported algorithm")

    current_time = int(time.time()) if now is None else int(now)
    expires_at = payload.get("exp")
    if not isinstance(expires_at, int) or expires_at <= current_time:
        raise InvalidTokenError("Token expired")

    return payload
