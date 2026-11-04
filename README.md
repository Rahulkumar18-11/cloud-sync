# CloudSync

A simple file storage and sharing application. Users will be able to upload files, view their files, download them, and share them through links.

The backend is being moved from Java/Spring Boot to **Python/FastAPI**. We are keeping the existing React frontend and PostgreSQL database design where practical.

## Current progress

| Component | Status |
| --- | --- |
| React frontend | Existing UI is in the repository; it currently uses mock data by default. |
| PostgreSQL | Existing schema, seed file, and Docker Compose service are available. |
| Python backend | FastAPI starter app and health endpoint added. |
| File storage | To be implemented. The first working version will use a local uploads folder. |
| File sharing | To be implemented using shareable links/tokens. |
| Azure / Google Cloud | Optional follow-up once the basic upload and sharing workflow works. |

**Scope:** build a small working project first. We are not implementing microservices, Kubernetes, background workers, complex admin dashboards, or advanced analytics.

## Technology stack

| Part | Technology |
| --- | --- |
| Backend language | Python 3.12+ |
| API framework | FastAPI |
| API server | Uvicorn |
| Request validation | Pydantic |
| Database | PostgreSQL 16 |
| ORM / database access | SQLAlchemy 2.x |
| PostgreSQL driver | Psycopg 3 |
| Database migrations | Alembic |
| Authentication (planned) | JWT and Argon2 password hashing |
| File upload handling | FastAPI UploadFile and python-multipart |
| Initial file storage | Local `backend/uploads/` directory |
| Frontend | Existing React + TypeScript + Vite |
| Testing | pytest and HTTPX |
| Code quality | Ruff |
| Containers | Docker Compose |
| CI | GitHub Actions |

The local file-storage option makes the project easy to run without cloud credentials or cloud charges. Azure Blob Storage and Google Cloud Storage can be added after the basic application works.

## MVP features

The first working version will focus on:

1. Upload a file.
2. List uploaded files.
3. Download a file.
4. Delete a file.
5. Generate a share link for a file.
6. Open a share link and download the shared file.

Basic user authentication and ownership checks will be added so one user cannot access another user's private files.

## Architecture

```text
React + TypeScript frontend
          |
          | HTTP requests
          v
Python FastAPI backend
       |          |
       v          v
 PostgreSQL   Local file storage
 (metadata)   (actual file bytes)
```

PostgreSQL stores file information such as the file name, size, owner, upload time, and storage path. The actual file contents are stored in `backend/uploads/`.

## Repository structure

The Python backend is being added under `backend/`. The old Java scaffold is being left in place temporarily so the team can migrate without disrupting the shared repository.

```text
cloud-sync/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py
│   │   └── main.py
│   ├── tests/
│   │   └── test_health.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env.example
├── database/
│   ├── schema.sql
│   └── seed.sql
├── frontend/
├── docs/
├── docker-compose.yml
└── README.md
```

## Run the project locally

### 1. Clone the repository

```bash
git clone https://github.com/Rahulkumar18-11/cloud-sync.git
cd cloud-sync
```

### 2. Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

The database scripts are automatically applied when Docker initializes a fresh PostgreSQL data volume. Do not re-run `database/schema.sql` on a database containing data: it currently contains DROP TABLE statements.

### 3. Set up and run the Python backend

From the repository root, on Windows PowerShell:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

On macOS / Linux:

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The backend will run at `http://127.0.0.1:8000`.

- API status: http://127.0.0.1:8000/health
- Interactive API docs: http://127.0.0.1:8000/docs

At this first stage, the health endpoint checks that the API is running. PostgreSQL connection and file operations are the next development steps.

### 4. Run the existing frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend normally runs at http://localhost:5173. It will continue using mock data until the corresponding Python API endpoints are ready. Do not turn mock mode off yet.

## Run backend checks

From the `backend/` directory with the virtual environment active:

```bash
pytest
ruff check .
```

GitHub Actions runs these checks for the Python backend on pushes to the migration branch and for pull requests to `main`.

## Environment variables and secrets

Copy `backend/.env.example` to `backend/.env` for local development. Never commit the real `.env` file, database passwords, JWT secrets, cloud credentials, or service-account JSON files. Only the example environment file should be tracked.

## Development plan

| Step | Work |
| --- | --- |
| 1 | Python environment, FastAPI application, and health endpoint |
| 2 | Connect FastAPI to the existing PostgreSQL database |
| 3 | Add the minimum database models needed for users and files |
| 4 | Add simple registration/login and file ownership checks |
| 5 | Implement upload, list, download, and delete |
| 6 | Implement share-link creation and public download |
| 7 | Connect the existing frontend to the real API |
| 8 | Test the complete flow and make the application easy to run with Docker |
| 9 | Consider Azure Blob Storage and Google Cloud Storage as optional storage backends |

## Team contribution workflow

- Work on a feature branch rather than directly on `main`.
- Commit small, related changes with clear messages.
- Push your branch and open a pull request to `main`.
- Coordinate API and database changes with the teammates working on the frontend and database.

Current migration branch: `feature/python-fastapi-migration`.

## License

This project is for academic and educational purposes.
