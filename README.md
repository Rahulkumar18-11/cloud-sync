# CloudSync

CloudSync is a simple file storage and sharing application. Users can register, upload files, view their files, download them, and share files through links.

The backend is being moved from Java/Spring Boot to **Python/FastAPI**. The existing React frontend is retained. PostgreSQL stores application metadata, and Amazon S3 is the planned cloud storage target.

## Current progress

| Component | Status |
| --- | --- |
| Python FastAPI backend | Starter API and MVP routes implemented |
| Authentication | Registration, login, Argon2 password hashing, JWT bearer tokens |
| File management | Upload, list, download, and delete using local storage |
| File sharing | Share links with optional expiry and public download |
| PostgreSQL | Schema and Docker Compose service prepared; connect it before starting the API |
| React frontend | Existing UI retained; integration with the Python API is still pending |
| AWS S3 | Planned next storage backend; not required to run locally yet |

**Scope:** make a small working project first. No microservices, Kubernetes, background workers, complex admin dashboards, or advanced analytics.

## Technology stack

| Part | Technology |
| --- | --- |
| Backend | Python, FastAPI, Uvicorn |
| Validation/configuration | Pydantic, pydantic-settings |
| Database | PostgreSQL 16, SQLAlchemy 2.x, Psycopg 3 |
| Authentication | JWT (PyJWT), Argon2 password hashing (pwdlib) |
| Local file storage | Local uploads directory |
| Planned cloud storage | Amazon S3 using Boto3 |
| Frontend | Existing React + TypeScript + Vite |
| Testing | pytest, HTTPX, SQLite test database |
| Code quality | Ruff |
| Local database container | Docker Compose |
| CI | GitHub Actions |

## Architecture

### Current local development flow

```text
React frontend (integration pending)
              |
              v
       Python FastAPI
          /       \
         v         v
    PostgreSQL   Local disk
    (metadata)   (file bytes)
```

### Planned AWS storage flow

```text
       React frontend
              |
              v
       Python FastAPI
          /       \
         v         v
    PostgreSQL   Amazon S3
    (metadata)   (file bytes)
```

File contents are currently stored locally. PostgreSQL stores file ownership, names, content types, sizes, storage keys, and share-link records. AWS S3 integration will replace local disk as the cloud storage option later. The S3 bucket will remain private; share downloads will be authorized by the API before a short-lived download URL is issued.

## Repository structure

```text
cloud-sync/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── db/
│   │   ├── routers/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── security.py
│   │   └── storage.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── schema.sql
│   └── seed.sql
├── frontend/
├── docker-compose.yml
└── README.md
```

## Run locally (Windows Git Bash)

### 1. Clone the migration branch

```bash
git clone -b feature/python-fastapi-migration https://github.com/Rahulkumar18-11/cloud-sync.git
cd cloud-sync
```

### 2. Start PostgreSQL

Run from the repository root:

```bash
docker compose up -d postgres
docker compose ps
docker compose logs postgres --tail=30
```

Wait until the PostgreSQL container is healthy. On a fresh Docker volume, Compose initializes the database using `database/schema.sql`.

### 3. Set up the Python backend

```bash
cd backend
py -3 -m venv .venv
source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

If you already have the environment and dependencies, activate it and run `pip install -r requirements.txt` after pulling updates.

### 4. Start the API

From `backend/` with the virtual environment active:

```bash
uvicorn app.main:app --reload
```

Open the Swagger page at http://127.0.0.1:8000/docs.

### 5. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The existing frontend is not yet connected to the new Python endpoints; the API can be tested independently through Swagger in the meantime.

## API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Register a user |
| POST | `/api/v1/auth/login` | Log in and receive a JWT |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/files` | Upload a file |
| GET | `/api/v1/files` | List own files |
| GET | `/api/v1/files/{file_id}/download` | Download own file |
| DELETE | `/api/v1/files/{file_id}` | Delete own file |
| POST | `/api/v1/files/{file_id}/share` | Create a share link |
| GET | `/api/v1/shares/{token}` | View shared file details |
| GET | `/api/v1/shares/{token}/download` | Download shared file |

Uploads are limited to 50 MB by default. Configure `MAX_UPLOAD_SIZE_MB` in `backend/.env` to change the limit.

## Run tests and lint

From `backend/` with the virtual environment active:

```bash
python -m pytest
python -m ruff check .
```

Tests use an in-memory SQLite database and a temporary uploads directory; PostgreSQL is not required for the test suite.

## AWS S3 plan

AWS is intended for cloud object storage, not as a requirement for the current local development phase.

- Create one private S3 bucket when S3 integration begins.
- Keep S3 Block Public Access enabled.
- The FastAPI backend will use Boto3 to upload, download, and delete objects.
- PostgreSQL will store the object key and file metadata, not the file contents.
- The API will check ownership/share permissions before returning a short-lived presigned download URL.
- Use an AWS CLI profile locally and an IAM role on AWS-hosted compute. Never hardcode or commit AWS access keys.

No AWS bucket, Boto3 package, or cloud credentials are required for the current local MVP.

## Environment variables and secrets

Copy `backend/.env.example` to `backend/.env`. Never commit the real `.env`, database passwords, JWT secrets, or AWS credentials. Replace the development JWT secret before deployment.

## Development roadmap

| Step | Work |
| --- | --- |
| 1 | FastAPI starter and health endpoint |
| 2 | PostgreSQL integration and database validation |
| 3 | User registration/login and JWT authentication |
| 4 | File upload, list, download, and delete |
| 5 | Share links and protected downloads |
| 6 | Connect the existing React frontend to the API |
| 7 | Add Amazon S3 storage using Boto3 |
| 8 | Containerize the complete application and validate deployment |

## Team workflow

- Work on `feature/python-fastapi-migration` or a separate feature branch, not directly on `main`.
- Commit related changes with clear messages.
- Push branches and use pull requests for review.
- Coordinate API and database changes with frontend contributors.

Current migration branch: `feature/python-fastapi-migration`.

## License

This project is for academic and educational purposes.
