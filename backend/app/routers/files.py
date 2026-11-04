import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import FileRecord, User
from app.schemas import FileResponse as FileSchema
from app.storage import local_file_path, remove_local_file

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
    destination = local_file_path(storage_key)
    destination.parent.mkdir(parents=True, exist_ok=True)
    size_bytes = 0

    try:
        with destination.open("wb") as output:
            while chunk := await file.read(CHUNK_SIZE):
                size_bytes += len(chunk)
                if size_bytes > max_size:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds the {settings.max_upload_size_mb} MB limit",
                    )
                output.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    record = FileRecord(
        id=file_id,
        original_name=original_name,
        storage_key=storage_key,
        content_type=content_type,
        size_bytes=size_bytes,
        storage_backend="local",
        owner_id=current_user.id,
    )
    try:
        db.add(record)
        db.commit()
        db.refresh(record)
    except Exception:
        db.rollback()
        destination.unlink(missing_ok=True)
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
) -> FileResponse:
    record = get_owned_file(file_id, current_user.id, db)
    path = local_file_path(record.storage_key)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored file not found")
    return FileResponse(
        path=path,
        media_type=record.content_type,
        filename=record.original_name,
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    record = get_owned_file(file_id, current_user.id, db)
    storage_key = record.storage_key
    db.delete(record)
    db.commit()
    remove_local_file(storage_key)
