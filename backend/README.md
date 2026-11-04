# CloudSync Python Backend

The Python backend provides authentication, file management, and shareable download links. PostgreSQL stores application metadata. File contents can be stored on local disk or in a private Amazon S3 bucket.

## Requirements

- Python 3.12 or newer
- Docker Desktop with Docker Compose
- Git
- AWS CLI only if you choose the S3 storage mode

## 1. Start PostgreSQL

Run from the repository root:

```bash
docker compose up -d postgres
docker compose ps
docker compose logs postgres --tail=30
```

Wait until the PostgreSQL container is healthy. The database tables are initialized automatically on a fresh data volume. For an existing database, run the safe table initializer from the backend directory after activating the virtual environment.

## 2. Set up the backend (Windows Git Bash)

Run from the repository root:

```bash
cd backend
py -3 -m venv .venv
source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
python -m app.db.init_db
```

If you already created the environment, activate it and run `pip install -r requirements.txt` after pulling updates.

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

## 5. Choose a storage backend

### Local (default)

The default configuration is:

```env
STORAGE_BACKEND=local
UPLOAD_DIR=uploads
```

Uploaded file bytes are stored under `backend/uploads/`. No AWS account or credentials are required.

### Amazon S3

The S3 adapter is implemented using Boto3. PostgreSQL records which backend stores each file. Set the following in `backend/.env`:

```env
STORAGE_BACKEND=s3
AWS_REGION=ap-south-1
AWS_S3_BUCKET=YOUR_BUCKET_NAME
```

Configure a named AWS CLI profile (or IAM Identity Center profile) and select it in the same terminal before starting Uvicorn:

```bash
aws configure sso --profile cloudsync
aws sso login --profile cloudsync
export AWS_PROFILE=cloudsync
```

Use the SSO commands when your organization has IAM Identity Center configured. Otherwise, use a dedicated non-root IAM identity and an approved named CLI profile. Do not put access keys in `.env` or commit credential files.

The bucket must be private with S3 Block Public Access enabled. The application requires object-level `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` permissions scoped to the chosen bucket. See [docs/aws-s3-setup.md](../docs/aws-s3-setup.md) for the bucket setup, IAM policy and verification steps.

Each file record stores its own `storage_backend`. Changing the configured default affects new uploads; it does not move existing objects. A file originally uploaded locally will still download from local storage after new uploads are switched to S3.

S3 downloads are streamed through FastAPI after ownership or share-token validation. The bucket and objects are not public.

## 6. Test the backend

From the `backend/` directory with the virtual environment active:

```bash
python -m pytest
python -m ruff check .
```

Tests use an isolated in-memory SQLite database and a fake S3 client. They do not require PostgreSQL, AWS credentials or a real bucket.

## Security notes

- Passwords are stored as Argon2 hashes, never as plaintext.
- Authenticated routes require a bearer JWT.
- Users can only list, download, delete, or share files they own.
- Share tokens are randomly generated and can expire.
- Keep S3 Block Public Access enabled and grant the app only the required object permissions.
- Use an IAM role for AWS-hosted workloads and a named CLI profile for local development.
- Replace the development JWT secret before any deployment.
