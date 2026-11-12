from __future__ import annotations

import time

import pytest

from app.security import (
    InvalidTokenError,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

SECRET = "unit-test-secret"


def test_password_round_trip_and_salting():
    first = hash_password("correct horse battery staple")
    second = hash_password("correct horse battery staple")
    assert first != second  # unique salt
    assert first.startswith("scrypt$")
    assert verify_password("correct horse battery staple", first)
    assert not verify_password("wrong password", first)
    assert not verify_password("correct horse battery staple", "not-a-hash")


def test_token_round_trip():
    token = create_access_token(42, secret_key=SECRET, role="editor", ttl_minutes=10)
    payload = decode_access_token(token, secret_key=SECRET)
    assert payload["sub"] == "42"
    assert payload["role"] == "editor"
    assert payload["exp"] > payload["iat"]


def test_token_rejects_wrong_secret():
    token = create_access_token(1, secret_key=SECRET)
    with pytest.raises(InvalidTokenError):
        decode_access_token(token, secret_key="another-secret")


def test_token_rejects_tampered_payload():
    token = create_access_token(1, secret_key=SECRET)
    header, _payload, signature = token.split(".")
    forged = f"{header}.eyJzdWIiOiI5OTkifQ.{signature}"
    with pytest.raises(InvalidTokenError):
        decode_access_token(forged, secret_key=SECRET)


def test_token_expiry():
    issued = int(time.time()) - 3600
    token = create_access_token(1, secret_key=SECRET, ttl_minutes=1, now=issued)
    with pytest.raises(InvalidTokenError):
        decode_access_token(token, secret_key=SECRET)


@pytest.mark.parametrize("token", ["", "abc", "a.b", "a.b.c.d"])
def test_malformed_tokens(token):
    with pytest.raises(InvalidTokenError):
        decode_access_token(token, secret_key=SECRET)
