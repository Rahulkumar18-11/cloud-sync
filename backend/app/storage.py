from functools import lru_cache
from pathlib import Path
from shutil import copyfileobj
from urllib.parse import quote
from typing import BinaryIO

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi.responses import FileResponse, StreamingResponse

from app.core.config import get_settings

CHUNK_SIZE = 1024 * 1024


class StorageError(RuntimeError):
    """Base error for storage operations."""


class StorageConfigurationError(StorageError):
    """Raised when the selected storage backend is not configured."""


class StoredFileNotFound(StorageError):
    """Raised when a metadata record points to a missing stored object."""


class StorageUnavailable(StorageError):
    """Raised when the configured storage service cannot complete an operation."""


@lru_cache
def get_s3_client():
    """Create a cached S3 client using Boto3's standard credential provider chain."""
    settings = get_settings()
    return boto3.client("s3", region_name=settings.aws_region)


def _selected_backend(backend: str | None = None) -> str:
    selected = (backend or get_settings().storage_backend).strip().lower()
    if selected not in {"local", "s3"}:
        raise StorageConfigurationError("STORAGE_BACKEND must be either 'local' or 's3'.")
    return selected


def _s3_bucket() -> str:
    bucket = get_settings().aws_s3_bucket.strip()
    if not bucket:
        raise StorageConfigurationError(
            "AWS_S3_BUCKET is required when STORAGE_BACKEND=s3."
        )
    return bucket


def local_file_path(storage_key: str) -> Path:
    """Resolve a storage key safely beneath the configured uploads directory."""
    root = Path(get_settings().upload_dir).expanduser().resolve()
    destination = (root / storage_key).resolve()
    if destination == root or root not in destination.parents:
        raise ValueError("Invalid storage key")
    return destination


def save_stored_file(
    storage_key: str,
    file_obj: BinaryIO,
    content_type: str,
    backend: str | None = None,
) -> str:
    """Persist a seekable binary file object and return the selected backend."""
    selected = _selected_backend(backend)
    file_obj.seek(0)

    if selected == "local":
        destination = local_file_path(storage_key)
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open("wb") as output:
            copyfileobj(file_obj, output, length=CHUNK_SIZE)
        return selected

    bucket = _s3_bucket()
    try:
        get_s3_client().upload_fileobj(
            file_obj,
            bucket,
            storage_key,
            ExtraArgs={"ContentType": content_type},
        )
    except (BotoCoreError, ClientError, Exception) as error:
        # Boto3 managed transfers can raise both botocore and boto3 transfer exceptions.
        raise StorageUnavailable("Amazon S3 upload failed. Check AWS credentials and bucket permissions.") from error
    return selected


def delete_stored_file(storage_key: str, backend: str) -> None:
    """Delete an object from the same backend recorded in its database row."""
    selected = _selected_backend(backend)
    if selected == "local":
        local_file_path(storage_key).unlink(missing_ok=True)
        return

    bucket = _s3_bucket()
    try:
        get_s3_client().delete_object(Bucket=bucket, Key=storage_key)
    except (BotoCoreError, ClientError) as error:
        raise StorageUnavailable("Amazon S3 could not delete the stored object.") from error


def get_stored_file_response(
    storage_key: str,
    content_type: str,
    filename: str,
    backend: str,
):
    """Return a download response without making S3 objects public."""
    selected = _selected_backend(backend)
    if selected == "local":
        path = local_file_path(storage_key)
        if not path.is_file():
            raise StoredFileNotFound("Stored file not found")
        return FileResponse(
            path=path,
            media_type=content_type,
            filename=filename,
        )

    bucket = _s3_bucket()
    try:
        result = get_s3_client().get_object(Bucket=bucket, Key=storage_key)
        body = result["Body"]
    except ClientError as error:
        code = error.response.get("Error", {}).get("Code", "")
        if code in {"NoSuchKey", "404", "NotFound"}:
            raise StoredFileNotFound("Stored file not found") from error
        raise StorageUnavailable("Amazon S3 could not retrieve the stored object.") from error
    except BotoCoreError as error:
        raise StorageUnavailable("Amazon S3 could not retrieve the stored object.") from error

    def stream_file():
        try:
            while chunk := body.read(CHUNK_SIZE):
                yield chunk
        finally:
            body.close()

    disposition_name = quote(filename, safe="")
    return StreamingResponse(
        stream_file(),
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{disposition_name}"},
    )
