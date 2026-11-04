from pathlib import Path

from app.core.config import get_settings


def local_file_path(storage_key: str) -> Path:
    """Resolve a storage key safely beneath the configured uploads directory."""
    root = Path(get_settings().upload_dir).expanduser().resolve()
    destination = (root / storage_key).resolve()
    if destination == root or root not in destination.parents:
        raise ValueError("Invalid storage key")
    return destination


def remove_local_file(storage_key: str) -> None:
    """Remove a local file, ignoring the case where it is already missing."""
    path = local_file_path(storage_key)
    path.unlink(missing_ok=True)
