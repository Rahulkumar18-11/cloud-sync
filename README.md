# CloudSync

CloudSync is a straightforward file storage and sharing application. Users can register, upload files, view and download their files, delete them, and share them through expiring links.

The application uses **Python/FastAPI**, **PostgreSQL**, and an existing **React + TypeScript** frontend. Files can be stored on local disk or in a private **Amazon S3** bucket.

## Current MVP status

| Feature | Status |
| --- | --- |
| Registration and login | Implemented |
| Argon2 password hashing and JWT authentication | Implemented |
| File upload, list, download and delete | Implemented |
| Share links with optional expiry | Implemented |
| React login, registration and file dashboard | Connected to FastAPI |
| Public shared-file page and download | Connected to FastAPI |
| PostgreSQL metadata persistence | Implemented |
| Local file storage | Implemented and default |
| Amazon S3 storage using Boto3 | Implemented; requires bucket and IAM profile configuration |
| Folder management, versions, admin and activity screens | Outside the current MVP |

The upload limit is 50 MB per file by default. Configure `MAX_UPLOAD_SIZE_MB` in `backend/.env` to change it.

## Technology stack

| Layer | Technology |
| --- | --- |
| Backend | Python, FastAPI, Uvicorn |
| Validation/configuration | Pydantic, pydantic-settings |
| Database | PostgreSQL 16, SQLAlchemy 2.x, Psycopg 3 |
| Authentication | JWT (PyJWT), Argon2 (pwdlib) |
| Storage | Local disk or private Amazon S3 (Boto3) |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| HTTP client | Axios |
| Testing and quality | pytest, HTTPX, Ruff |
| Local database | Docker Compose |
| CI | GitHub Actions: backend tests/lint and frontend build |

## Architecture

### Local mode (default)

```text
React + TypeScript
       | HTTP / JWT
       v
Python FastAPI
   |          |
   v          v
PostgreSQL   Local disk
(metadata)   (file contents)
```

### S3 mode

```text
React + TypeScript
       | HTTP / JWT
       v
Python FastAPI
   |          |
   v          v
PostgreSQL   Private Amazon S3
(metadata)   (file contents)
```

PostgreSQL stores user accounts, file ownership, names, content types, sizes, storage keys, backend selection and share-link records. Each file row remembers whether its bytes live in local disk or S3. Changing `STORAGE_BACKEND` affects new uploads; it does not move existing files.

S3 objects are not public. FastAPI verifies the authenticated owner or share token and streams the file from S3 to the client. The frontend uses the same endpoints in local and S3 mode.

### How share links work

A CloudSync share URL is an application URL, not an S3 object URL. For example, `https://cloudsync.example.com/shared/<token>` opens the React shared-file page. That page asks FastAPI to validate the token and file expiry; when the recipient downloads, FastAPI reads the private object from S3 (or local disk) and streams it to the recipient.

When running locally, the generated link uses `http://localhost:5173` because that is the frontend's current origin. That address works only on the computer running the Vite development server. It is not a public link and cannot be opened by another person on the internet.

Set `VITE_PUBLIC_APP_URL` in `frontend/.env` to the deployed frontend's public HTTPS URL when the frontend is hosted. Also set `VITE_API_BASE_URL` to the deployed FastAPI public HTTPS base URL, including `/api/v1`. These Vite variables are embedded at build/start time, so rebuild or restart the frontend after changing them. A public share link is usable by other people only after both the frontend and API are reachable from the internet and the API can reach PostgreSQL and S3.

For a local demonstration, a temporary HTTPS tunnel can expose both frontend and backend, but the frontend's API base URL and backend CORS allow-list must point to the tunnel URLs. Do not use localhost as a recipient-facing URL.

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
├── docs/
│   └── aws-s3-setup.md
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Run locally (Windows Git Bash)

Use two terminals: one for the backend and one for the frontend. Keep Docker Desktop running.

### 1. Get the migration branch

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

From the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

Wait until PostgreSQL is healthy.

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

For an existing setup, activate the existing `.venv` and run `pip install -r requirements.txt` after pulling updates. The database initializer creates missing tables without dropping existing data.

Backend URLs:

- Swagger: http://127.0.0.1:8000/docs
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

The frontend environment file points to `http://127.0.0.1:8000/api/v1`, disables mock mode, and sets `VITE_PUBLIC_APP_URL=http://localhost:5173` for local share links. Keep real `.env` files local; do not commit them.

## Use the application

1. Open http://localhost:5173 and register a user.
2. Sign in.
3. Upload a file from the dashboard.
4. Refresh the page and verify that the file remains listed.
5. Download or delete the file.
6. Create a share link and open it in an incognito window to verify public sharing.

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

## Choose the storage backend

### Local storage

This is the default and needs no AWS credentials:

```env
STORAGE_BACKEND=local
UPLOAD_DIR=uploads
```

Files are stored under `backend/uploads/`.

### Amazon S3

The S3 adapter is implemented. To enable it, create a private S3 bucket, configure least-privilege permissions for a dedicated IAM identity, and set these values in `backend/.env`:

```env
STORAGE_BACKEND=s3
AWS_REGION=ap-south-1
AWS_S3_BUCKET=YOUR_BUCKET_NAME
```

Configure a named AWS CLI profile or IAM Identity Center profile, then set `AWS_PROFILE` in the same Git Bash terminal before starting Uvicorn. For AWS-hosted compute, use an IAM role. Never put AWS access keys in `.env` or source code.

Keep S3 Block Public Access enabled. The backend only needs `s3:PutObject`, `s3:GetObject` and `s3:DeleteObject` on the bucket's object ARN. S3 downloads are streamed through FastAPI after authorization; direct public object access is not used.

**Important:** switching `STORAGE_BACKEND` does not migrate existing files. Existing records continue to use their original storage backend; only new uploads use the selected default.

Follow [docs/aws-s3-setup.md](docs/aws-s3-setup.md) for detailed bucket creation, IAM policy, CLI profile setup and S3 verification steps.

AWS storage, requests and data transfer can incur charges. No AWS account or credentials are needed while using local mode.

## Run checks

Backend (from `backend/` with virtual environment active):

```bash
python -m pytest
python -m ruff check .
```

Tests use an in-memory SQLite database, a temporary upload directory and a fake S3 client. A real AWS account is not required to run the test suite.

Frontend (from `frontend/`):

```bash
npm ci
npm run build
```

## Environment variables and secrets

Copy the templates:

- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env`

Never commit real environment files, database passwords, JWT secrets, AWS credentials, or session tokens. Replace the development JWT secret before deployment.

## Roadmap

1. Configure and verify the private S3 bucket and IAM profile.
2. Improve share-link revocation and storage error recovery.
3. Add stronger upload validation and operational safeguards.
4. Containerize the complete application and prepare deployment.

## Team workflow

Work on `feature/python-fastapi-migration` or a dedicated feature branch. Keep `main` stable, commit related changes and use pull requests for review.

## License

This project is for academic and educational purposes.
