import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import FileRecord, ShareLink, User
from app.schemas import CreateShareRequest, SharedFileResponse, ShareLinkResponse
from app.storage import (
    StorageError,
    StoredFileNotFound,
    get_stored_file_response,
)

router = APIRouter(tags=["File sharing"])


def get_active_share(token: str, db: Session) -> ShareLink:
    share = db.scalar(select(ShareLink).where(ShareLink.token == token))
    if share is None or not share.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found")

    expires_at = share.expires_at
    if expires_at is not None:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) >= expires_at:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link expired")
    return share


@router.post(
    "/files/{file_id}/share",
    response_model=ShareLinkResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_share_link(
    file_id: uuid.UUID,
    payload: CreateShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ShareLinkResponse:
    record = db.scalar(
        select(FileRecord).where(
            FileRecord.id == file_id,
            FileRecord.owner_id == current_user.id,
        )
    )
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    expires_at = None
    if payload.expires_in_hours is not None:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=payload.expires_in_hours)

    share = ShareLink(
        file_id=record.id,
        created_by=current_user.id,
        token=secrets.token_urlsafe(32),
        expires_at=expires_at,
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return ShareLinkResponse(
        token=share.token,
        share_path=f"/api/v1/shares/{share.token}",
        expires_at=share.expires_at,
    )


@router.get("/shares/{token}", response_model=SharedFileResponse)
def get_shared_file(token: str, db: Session = Depends(get_db)) -> SharedFileResponse:
    share = get_active_share(token, db)
    record = db.get(FileRecord, share.file_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared file not found")
    return SharedFileResponse(
        original_name=record.original_name,
        content_type=record.content_type,
        size_bytes=record.size_bytes,
        expires_at=share.expires_at,
    )


@router.get("/shares/{token}/download")
def download_shared_file(token: str, db: Session = Depends(get_db)) -> Response:
    share = get_active_share(token, db)
    record = db.get(FileRecord, share.file_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared file not found")
    try:
        return get_stored_file_response(
            record.storage_key,
            record.content_type,
            record.original_name,
            record.storage_backend,
        )
    except StoredFileNotFound as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except StorageError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error
