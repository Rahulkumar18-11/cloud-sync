# CloudSync

CloudSync is a straightforward file storage and sharing application. Users can create accounts, upload and manage files, and share files through expiring links.

The backend is **Python/FastAPI** with **PostgreSQL** for metadata. The existing **React + TypeScript** frontend is now connected to the FastAPI MVP. Local disk is used for file bytes during development; **Amazon S3** is the planned cloud-storage backend.

## Current MVP

| Feature | Status |
| --- | --- |
| User registration and login | Implemented |
| Password hashing and JWT authentication | Implemented |
| File upload, list, download and delete | Implemented |
| Share links with optional expiry | Implemented |
| React login, registration, file dashboard and shared-file page | Connected to FastAPI |
| PostgreSQL persistence | Implemented |
| Local file storage | Implemented |
| Amazon S3 storage | Planned |
| Folders, file versions, activity logs and admin tools | Outside the current MVP |

The upload limit is 50 MB per file by default. It can be changed with `MAX_UPLOAD_SIZE_MB` in `backend/.env`.

## Technology stack

| Layer | Technology |
| --- | --- |
| Backend | Python, FastAPI, Uvicorn |
| Validation/configuration | Pydantic, pydantic-settings |
| Database | PostgreSQL 16, SQLAlchemy 2.x, Psycopg 3 |
| Authentication | JWT (PyJWT), Argon2 password hashing (pwdlib) |
| Current file storage | Local disk under `backend/uploads/` |
| Planned cloud storage | Amazon S3 using Boto3 |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Frontend HTTP client | Axios |
| Tests and quality | pytest, HTTPX, Ruff |
| Local services | Docker Compose |
| CI | GitHub Actions (Python tests/lint + frontend build) |

## Architecture

### Current local setup

```text
React + TypeScript
       |
       | HTTP / JWT
       v
Python FastAPI
   |          |
   v          v
PostgreSQL   Local disk
(metadata)   (file contents)
```

### Planned AWS storage

```text
React + TypeScript
       |
       v
Python FastAPI
   |          |
   v          v
PostgreSQL   Amazon S3
(metadata)   (file contents)
```

PostgreSQL stores user accounts, ownership, file metadata, storage keys and share links. File contents remain on local disk until the S3 storage adapter is implemented. The future S3 bucket will be private; public sharing will be authorized by the API before a short-lived download is provided.

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
│   ├── src/
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Run locally (Windows Git Bash)

Use **two terminals**: one for the backend and one for the frontend. Keep PostgreSQL running in Docker.

### 1. Get the current migration branch

For an existing clone:

```bash
cd ~/Desktop/cloud-sync
git switch feature/python-fastapi-migration
git pull origin feature/python-fastapi-migration
```

For a fresh clone:

```bash
git clone -b feature/python-fastapi-migration https://github.com/Rahulkumar18-11/cloud-sync.git
cd cloud-sync
```

### 2. Start PostgreSQL

Run from the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

Wait until the `postgres` service is healthy.

### 3. Configure and start the backend (Terminal 1)

```bash
cd backend
py -3 -m venv .venv
source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
python -m app.db.init_db
uvicorn app.main:app --reload
```

If `.venv` already exists, activate it and run `pip install -r requirements.txt` after pulling updates. The database initialization command creates any missing MVP tables; it does not delete existing records.

Backend URLs:

- Swagger API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

### 4. Configure and start the frontend (Terminal 2)

From the repository root in a second Git Bash terminal:

```bash
cd ~/Desktop/cloud-sync/frontend
cp .env.example .env
npm ci
npm run dev
```

Open http://localhost:5173.

The frontend environment file points to the local FastAPI API at `http://127.0.0.1:8000/api/v1` and disables mock mode. Do not commit either local `.env` file.

## Use the application

1. Open http://localhost:5173 and create an account.
2. Sign in. Your session is authenticated with a JWT bearer token.
3. Upload one or more files from the dashboard.
4. Download or delete a file from its actions.
5. Create a share link and copy it. Open the link in another browser/private window to test public download.

The current frontend MVP deliberately focuses on these supported workflows. Legacy folder, version history, profile, activity and admin screens are not connected to the Python API yet.

## API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Create an account |
| POST | `/api/v1/auth/login` | Log in and receive a JWT |
| GET | `/api/v1/auth/me` | Get the authenticated user |
| POST | `/api/v1/files` | Upload a file (multipart field: `file`) |
| GET | `/api/v1/files` | List the authenticated user's files |
| GET | `/api/v1/files/{file_id}/download` | Download an owned file |
| DELETE | `/api/v1/files/{file_id}` | Delete an owned file |
| POST | `/api/v1/files/{file_id}/share` | Create a share link |
| GET | `/api/v1/shares/{token}` | Read shared-file details |
| GET | `/api/v1/shares/{token}/download` | Download using a valid share link |

## Run backend checks

From `backend/` with the virtual environment active:

```bash
python -m pytest
python -m ruff check .
```

The tests use an in-memory SQLite database and a temporary upload directory. They do not require the PostgreSQL container.

The frontend CI build runs in GitHub Actions. You can also run it locally from `frontend/`:

```bash
npm ci
npm run build
```

## AWS S3 plan

AWS S3 is the next storage implementation, not a requirement for local development.

- Create a private S3 bucket in the chosen AWS Region.
- Keep S3 Block Public Access enabled.
- Add Boto3 to the backend when implementing the S3 adapter.
- Store S3 object keys and metadata in PostgreSQL, not file bytes.
- Check file ownership/share token validity in FastAPI before creating a short-lived presigned download URL.
- Use an AWS CLI profile for local development and a least-privilege IAM role for workloads running on AWS.
- Never hardcode or commit AWS access keys.

No AWS account, bucket, SDK, or credentials are required for the current local MVP.

## Environment variables and secrets

Copy the example files:

- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env`

Never commit real environment files, database passwords, JWT secrets or AWS credentials. Replace the development JWT secret before deployment.

## Roadmap

1. Complete frontend MVP integration and validate the complete user workflow.
2. Add AWS S3 as an alternative storage backend.
3. Improve share-link management and operational safeguards.
4. Add Docker support for running the full application and prepare deployment.

## Team workflow

Work on `feature/python-fastapi-migration` or a dedicated feature branch. Keep `main` stable, commit related changes and use pull requests for review.

## License

This project is for academic and educational purposes.
