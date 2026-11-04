# CloudSync Python Backend

The Python backend provides authentication, file management, and shareable download links. PostgreSQL stores metadata and local disk stores uploaded file contents during development. Amazon S3 will be added as a cloud storage backend after the local workflow is working.

## Requirements

- Python 3.12 or newer
- Docker Desktop with Docker Compose
- Git

## 1. Start PostgreSQL

Run from the repository root:

```bash
docker compose up -d postgres
docker compose ps
docker compose logs postgres --tail=30
```

Wait until the PostgreSQL container is healthy. The database schema is initialized automatically when PostgreSQL creates a fresh data volume.

## 2. Set up the backend (Windows Git Bash)

Run from the repository root:

```bash
cd backend
py -3 -m venv .venv
source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

If you already created the virtual environment and installed dependencies, pull the latest branch and run `pip install -r requirements.txt` again to install the newly added packages.

## 3. Run the API

From the `backend/` directory with `.venv` active:

```bash
uvicorn app.main:app --reload
```

Open:

- API root: http://127.0.0.1:8000/
- Health check: http://127.0.0.1:8000/health
- Swagger API documentation: http://127.0.0.1:8000/docs

## 4. Available API routes

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | No | Create an account |
| POST | `/api/v1/auth/login` | No | Get a JWT access token |
| GET | `/api/v1/auth/me` | Bearer token | Get the current user |
| POST | `/api/v1/files` | Bearer token | Upload a file |
| GET | `/api/v1/files` | Bearer token | List the current user's files |
| GET | `/api/v1/files/{file_id}/download` | Bearer token | Download an owned file |
| DELETE | `/api/v1/files/{file_id}` | Bearer token | Delete an owned file |
| POST | `/api/v1/files/{file_id}/share` | Bearer token | Create a share link |
| GET | `/api/v1/shares/{token}` | No | View shared file details |
| GET | `/api/v1/shares/{token}/download` | No | Download using a valid share link |

Uploads are limited to 50 MB by default. Change `MAX_UPLOAD_SIZE_MB` in your local `.env` to adjust the limit.

## 5. Test the backend

From the `backend/` directory with the virtual environment active:

```bash
python -m pytest
python -m ruff check .
```

Tests use an isolated in-memory SQLite database and temporary file directory. They do not require the PostgreSQL container.

## Storage and AWS

The currently implemented storage backend is local disk (`backend/uploads/`, relative to the backend working directory). PostgreSQL stores the file's metadata and storage key.

Amazon S3 is the planned cloud object-storage backend. When that phase begins, the API will use Boto3 and a private S3 bucket. Local AWS credentials should be provided through the AWS CLI profile/credential chain; deployed AWS workloads should use a least-privilege IAM role. Do not place access keys in source code or commit them.

## Security notes

- Passwords are stored as Argon2 hashes, never as plaintext.
- Authenticated routes require a bearer JWT.
- Users can only list, download, delete, or share files they own.
- Share tokens are randomly generated and can expire.
- The S3 bucket should remain private when S3 support is added.
- Replace the development JWT secret before any deployment.

