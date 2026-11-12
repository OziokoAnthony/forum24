from pydantic import BaseModel, EmailStr, Field

from .common import CamelModel


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserOut(CamelModel):
    id: int
    name: str
    email: str
    slug: str
    role: str
    title: str | None = None


class TokenOut(CamelModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut
