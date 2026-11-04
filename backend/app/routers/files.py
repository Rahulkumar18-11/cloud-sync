import uuid
from tempfile import SpooledTemporaryFile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import FileRecord, User
from app.schemas import FileResponse as FileSchema
from app.storage import (
    StorageConfigurationError,
    StorageError,
    StorageUnavailable,
    StoredFileNotFound,
    delete_stored_file,
    get_stored_file_response,
    save_stored_file,
)

router = APIRouter(tags=["Files"])
CHUNK_SIZE = 1024 * 1024


def get_owned_file(file_id: uuid.UUID, owner_id: uuid.UUID, db: Session) -> FileRecord:
    record = db.scalar(
        select(FileRecord).where(
            FileRecord.id == file_id,
            FileRecord.owner_id == owner_id,
        )
    )
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return record


def storage_http_exception(error: StorageError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=str(error),
    )


@router.post("", response_model=FileSchema, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FileRecord:
    raw_name = (file.filename or "uploaded-file").replace("\\", "/")
    original_name = Path(raw_name).name[:255] or "uploaded-file"
    content_type = (file.content_type or "application/octet-stream")[:255]
    settings = get_settings()
    max_size = settings.max_upload_size_mb * 1024 * 1024

    file_id = uuid.uuid4()
    storage_key = f"{current_user.id}/{file_id.hex}"
    size_bytes = 0
    storage_backend = settings.storage_backend

    try:
        with SpooledTemporaryFile(max_size=8 * 1024 * 1024, mode="w+b") as temporary_file:
            while chunk := await file.read(CHUNK_SIZE):
                size_bytes += len(chunk)
                if size_bytes > max_size:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds the {settings.max_upload_size_mb} MB limit",
                    )
                temporary_file.write(chunk)

            temporary_file.seek(0)
            storage_backend = save_stored_file(
                storage_key,
                temporary_file,
                content_type,
                backend=storage_backend,
            )
    except HTTPException:
        raise
    except StorageError as error:
        raise storage_http_exception(error) from error
    finally:
        await file.close()

    record = FileRecord(
        id=file_id,
        original_name=original_name,
        storage_key=storage_key,
        content_type=content_type,
        size_bytes=size_bytes,
        storage_backend=storage_backend,
        owner_id=current_user.id,
    )
    try:
        db.add(record)
        db.commit()
        db.refresh(record)
    except Exception:
        db.rollback()
        try:
            delete_stored_file(storage_key, storage_backend)
        except StorageError:
            # A failed cleanup can leave an orphaned object, but must not hide the DB error.
            pass
        raise
    return record


@router.get("", response_model=list[FileSchema])
def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[FileRecord]:
    statement = (
        select(FileRecord)
        .where(FileRecord.owner_id == current_user.id)
        .order_by(FileRecord.created_at.desc())
    )
    return list(db.scalars(statement).all())


@router.get("/{file_id}/download")
def download_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    record = get_owned_file(file_id, current_user.id, db)
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
        raise storage_http_exception(error) from error


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    record = get_owned_file(file_id, current_user.id, db)
    try:
        delete_stored_file(record.storage_key, record.storage_backend)
    except StorageError as error:
        raise storage_http_exception(error) from error

    db.delete(record)
    db.commit()
