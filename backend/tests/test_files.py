from tests.test_auth import login_user, register_user


def test_upload_list_download_share_and_delete(client) -> None:
    register_user(client)
    token = login_user(client)
    headers = {"Authorization": f"Bearer {token}"}

    upload = client.post(
        "/api/v1/files",
        headers=headers,
        files={"file": ("hello.txt", b"Hello from CloudSync", "text/plain")},
    )
    assert upload.status_code == 201
    file_data = upload.json()
    assert file_data["original_name"] == "hello.txt"
    assert file_data["size_bytes"] == len(b"Hello from CloudSync")

    listing = client.get("/api/v1/files", headers=headers)
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    download = client.get(f"/api/v1/files/{file_data['id']}/download", headers=headers)
    assert download.status_code == 200
    assert download.content == b"Hello from CloudSync"

    share_response = client.post(
        f"/api/v1/files/{file_data['id']}/share",
        headers=headers,
        json={"expires_in_hours": 24},
    )
    assert share_response.status_code == 201
    share_token = share_response.json()["token"]

    shared_metadata = client.get(f"/api/v1/shares/{share_token}")
    assert shared_metadata.status_code == 200
    assert shared_metadata.json()["original_name"] == "hello.txt"

    shared_download = client.get(f"/api/v1/shares/{share_token}/download")
    assert shared_download.status_code == 200
    assert shared_download.content == b"Hello from CloudSync"

    deletion = client.delete(f"/api/v1/files/{file_data['id']}", headers=headers)
    assert deletion.status_code == 204
    assert client.get("/api/v1/files", headers=headers).json() == []


def test_users_cannot_access_each_others_files(client) -> None:
    register_user(client, "owner@example.com")
    owner_token = login_user(client, "owner@example.com")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    upload = client.post(
        "/api/v1/files",
        headers=owner_headers,
        files={"file": ("private.txt", b"private", "text/plain")},
    )
    file_id = upload.json()["id"]

    register_user(client, "other@example.com")
    other_token = login_user(client, "other@example.com")
    other_headers = {"Authorization": f"Bearer {other_token}"}

    response = client.get(f"/api/v1/files/{file_id}/download", headers=other_headers)
    assert response.status_code == 404


def test_file_endpoints_require_authentication(client) -> None:
    assert client.get("/api/v1/files").status_code == 401
    assert client.post(
        "/api/v1/files",
        files={"file": ("test.txt", b"test", "text/plain")},
    ).status_code == 401


def test_s3_storage_backend_upload_share_download_and_delete(client, monkeypatch) -> None:
    from io import BytesIO

    from app.core.config import get_settings
    from app import storage

    class FakeS3Client:
        def __init__(self) -> None:
            self.objects: dict[tuple[str, str], bytes] = {}
            self.content_types: dict[tuple[str, str], str] = {}

        def put_object(self, *, Bucket, Key, Body, ContentType):
            object_key = (Bucket, Key)
            self.objects[object_key] = Body.read()
            self.content_types[object_key] = ContentType
            return {"ETag": '"fake-etag"'}

        def get_object(self, *, Bucket, Key):
            return {"Body": BytesIO(self.objects[(Bucket, Key)])}

        def delete_object(self, *, Bucket, Key):
            self.objects.pop((Bucket, Key), None)
            self.content_types.pop((Bucket, Key), None)
            return {}

    fake_s3 = FakeS3Client()
    settings = get_settings()
    monkeypatch.setattr(settings, "storage_backend", "s3")
    monkeypatch.setattr(settings, "aws_s3_bucket", "cloudsync-test-bucket")
    monkeypatch.setattr(storage, "get_s3_client", lambda: fake_s3)

    register_user(client, "s3-user@example.com")
    token = login_user(client, "s3-user@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    upload = client.post(
        "/api/v1/files",
        headers=headers,
        files={"file": ("s3-note.txt", b"Stored in the S3 adapter", "text/plain")},
    )
    assert upload.status_code == 201
    file_data = upload.json()
    assert file_data["storage_backend"] == "s3"
    assert len(fake_s3.objects) == 1

    listing = client.get("/api/v1/files", headers=headers)
    assert listing.status_code == 200
    assert listing.json()[0]["storage_backend"] == "s3"

    download = client.get(f"/api/v1/files/{file_data['id']}/download", headers=headers)
    assert download.status_code == 200
    assert download.content == b"Stored in the S3 adapter"

    share_response = client.post(
        f"/api/v1/files/{file_data['id']}/share",
        headers=headers,
        json={"expires_in_hours": 24},
    )
    assert share_response.status_code == 201
    share_token = share_response.json()["token"]

    shared_download = client.get(f"/api/v1/shares/{share_token}/download")
    assert shared_download.status_code == 200
    assert shared_download.content == b"Stored in the S3 adapter"

    deletion = client.delete(f"/api/v1/files/{file_data['id']}", headers=headers)
    assert deletion.status_code == 204
    assert fake_s3.objects == {}
