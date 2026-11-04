import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    created_at: datetime


class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    original_name: str
    content_type: str
    size_bytes: int
    storage_backend: str
    created_at: datetime


class CreateShareRequest(BaseModel):
    expires_in_hours: int | None = Field(default=168, ge=1, le=720)


class ShareLinkResponse(BaseModel):
    token: str
    share_path: str
    expires_at: datetime | None


class SharedFileResponse(BaseModel):
    original_name: str
    content_type: str
    size_bytes: int
    expires_at: datetime | None
