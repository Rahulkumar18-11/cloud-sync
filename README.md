# CloudSync

CloudSync is a simple file storage and sharing application. Users will be able to upload files, view their files, download them, and share them through links.

The backend is being moved from Java/Spring Boot to **Python/FastAPI**. The existing React frontend is being retained, and PostgreSQL will store application metadata.

**Cloud storage direction:** use **Amazon S3** for cloud file storage. During local development, files can be stored on the local filesystem so the project works without an AWS account, AWS credentials, or cloud charges. The storage layer will support switching to S3 when that integration is implemented.

## Current progress

| Component | Status |
| --- | --- |
| React frontend | Existing UI is in the repository; it currently uses mock data by default. |
| PostgreSQL | Docker Compose service and schema are available; Python database integration is next. |
| Python backend | FastAPI starter app and health endpoint are working. |
| Local file storage | Planned as the first storage implementation for local development. |
| Amazon S3 | Target cloud object storage; integration will follow the basic local file workflow. |
| File sharing | To be implemented using shareable links/tokens. |

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
| Local storage | Local `backend/uploads/` directory (development) |
| Cloud object storage | Amazon S3 (planned) |
| AWS SDK | Boto3 (to be added with the S3 implementation) |
| Frontend | Existing React + TypeScript + Vite |
| Testing | pytest and HTTPX |
| Code quality | Ruff |
| Containers | Docker Compose |
| CI | GitHub Actions |

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

### Local development

```text
React + TypeScript frontend
          |
          | HTTP requests
          v
Python FastAPI backend
       |          |
       v          v
 PostgreSQL   Local file storage
 (metadata)   (file contents)
```

### AWS storage target

```text
React + TypeScript frontend
          |
          | HTTP requests
          v
Python FastAPI backend
       |          |
       v          v
 PostgreSQL   Amazon S3
 (metadata)   (file contents)
```

PostgreSQL stores users, file metadata, ownership, storage keys, and share-link records. File contents are stored locally during the first development phase and in an S3 bucket when AWS storage is enabled. The backend will handle file access; the bucket should not be made public just to support sharing.

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
git clone -b feature/python-fastapi-migration https://github.com/Rahulkumar18-11/cloud-sync.git
cd cloud-sync
```

### 2. Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

The database scripts are automatically applied when Docker initializes a fresh PostgreSQL data volume. Do not re-run `database/schema.sql` on a database containing data: it contains DROP TABLE statements and is intended only for a fresh development database.

### 3. Set up and run the Python backend

From the repository root, on Windows Git Bash:

```bash
cd backend
py -3 -m venv .venv
source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

On Windows PowerShell:

```powershell
cd backend
py -3 -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

On macOS / Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The backend will run at `http://127.0.0.1:8000`.

- API status: http://127.0.0.1:8000/health
- Interactive API docs: http://127.0.0.1:8000/docs

At this stage, the health endpoint checks that the API is running. PostgreSQL connectivity and file operations are the next development steps.

### 4. Run the existing frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend normally runs at http://localhost:5173. It will continue using mock data until the corresponding Python API endpoints are ready. Do not turn mock mode off yet.

## AWS S3 plan

AWS is being introduced for **object storage**, not as a requirement for local development.

- Create one private S3 bucket for the project when we reach the AWS integration phase.
- Keep the bucket in the selected AWS Region and block public access.
- The FastAPI backend will use Boto3 to upload, download, and delete objects.
- PostgreSQL will store the S3 object key and metadata, not the file contents.
- Share links will be generated by the backend; for S3 downloads, the backend can issue short-lived presigned URLs after checking the share token and permissions.
- Use an IAM role for an application deployed on AWS. For local development, use an AWS CLI profile or another supported credential provider. Do not hardcode access keys in source code or commit them to Git.

No AWS bucket or credentials are required to run the current FastAPI starter locally. Boto3 will be added to the Python dependencies when the S3 storage implementation begins.

## Run backend checks

From the `backend/` directory with the virtual environment active:

```bash
python -m pytest
python -m ruff check .
```

GitHub Actions runs these checks for the Python backend on pushes to the migration branch and for pull requests to `main`.

## Environment variables and secrets

Copy `backend/.env.example` to `backend/.env` for local development. Storage defaults to local mode. The AWS Region and bucket name will be configured when S3 integration begins.

Never commit the real `.env` file, database passwords, JWT secrets, AWS credentials, or service-account files. Only the example environment file should be tracked. AWS workloads should use IAM roles and least-privilege permissions where possible. See the [AWS IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) and [Boto3 credentials guide](https://docs.aws.amazon.com/boto3/latest/guide/credentials.html).

## Development plan

| Step | Work |
| --- | --- |
| 1 | Python environment, FastAPI application, and health endpoint |
| 2 | Connect FastAPI to the existing PostgreSQL database and align the schema with the MVP |
| 3 | Add the minimum database models needed for users, files, and share links |
| 4 | Add simple registration/login and file ownership checks |
| 5 | Implement local upload, list, download, and delete |
| 6 | Implement share-link creation and protected downloads |
| 7 | Connect the existing frontend to the real API |
| 8 | Add an S3 storage implementation using Boto3 and private-bucket access |
| 9 | Test the complete local and AWS storage flows and document deployment |

## Team contribution workflow

- Work on a feature branch rather than directly on `main`.
- Commit small, related changes with clear messages.
- Push your branch and open a pull request to `main`.
- Coordinate API and database changes with the teammates working on the frontend and database.

Current migration branch: `feature/python-fastapi-migration`.

## License

This project is for academic and educational purposes.
