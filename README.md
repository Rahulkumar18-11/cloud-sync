# CloudSync

> A unified multi-cloud file management platform for Microsoft Azure Blob Storage and Google Cloud Storage.

CloudSync is a full-stack application for managing files across multiple cloud storage providers through one interface. Users can upload, organize, search, version, download, and securely share files without switching between cloud provider consoles.

The project is being migrated from a Java/Spring Boot backend to a **Python/FastAPI backend**. The existing React frontend and PostgreSQL data model will be retained during the migration so the team can replace the backend incrementally instead of rebuilding working UI components.

---

## Project Status

| Area | Current state |
| --- | --- |
| Frontend | React + TypeScript + Vite application exists; API services currently support mock data. |
| Database | PostgreSQL 16 schema, seed data, and Docker Compose setup exist. |
| Existing backend | Initial Java/Spring Boot scaffold exists. The Python replacement has not been implemented yet. |
| Python backend | Planned: FastAPI, SQLAlchemy, Alembic, and provider-specific storage adapters. |
| Cloud integrations | Azure Blob Storage and Google Cloud Storage are the target providers; live integration must be implemented and tested. |

**Migration principle:** implement the Python API behind the existing frontend contracts, test each feature, and retire the Java/Maven scaffold only after the replacement is working and the team has reviewed the change.

## Key Features

### File and folder management
- Upload files to Azure Blob Storage or Google Cloud Storage.
- Organize files using nested folders and breadcrumb navigation.
- Search files by name and filter by type or cloud provider.
- Rename, move, download, and delete files.
- Maintain file versions and restore an earlier version.

### Sharing and access control
- Generate token-based share links.
- Support view and download permissions, with optional expiry.
- Authenticate users using JWT access tokens.
- Enforce role-based access control for `USER` and `ADMIN` roles.

### Administration and observability
- Track total and per-provider storage usage.
- Maintain activity/audit logs for important operations.
- Provide administration views for users and provider configuration.

---

## Technology Stack

### Target stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Backend language | Python 3.12+ | Application and business logic |
| Backend framework | FastAPI | REST API and dependency injection |
| ASGI server | Uvicorn | Local and production ASGI server |
| Request/response validation | Pydantic v2 | API schemas and data validation |
| Configuration | pydantic-settings | Environment-based configuration |
| ORM | SQLAlchemy 2.x | Database models and queries |
| Database | PostgreSQL 16 | Users, folders, file metadata, versions, shares, quotas, and audit logs |
| PostgreSQL driver | Psycopg 3 | Python-to-PostgreSQL connectivity |
| Schema migrations | Alembic | Version-controlled database changes |
| Authentication | PyJWT + pwdlib (Argon2) | JWT handling and password hashing |
| Azure integration | azure-storage-blob | Azure Blob Storage operations |
| Google Cloud integration | google-cloud-storage | Google Cloud Storage operations |
| File uploads | FastAPI UploadFile + python-multipart | Multipart file upload handling |
| Frontend | React 19 + TypeScript + Vite | Existing web application |
| Frontend API client | Axios | Calls to the Python REST API |
| Containerization | Docker + Docker Compose | Reproducible local services |
| Testing | pytest + HTTPX | Unit and API/integration tests |
| Code quality | Ruff | Python linting and formatting |
| CI | GitHub Actions | Automated checks for pull requests |

The backend will be a **modular monolith** initially. We will not introduce microservices, Redis, Celery, or Kubernetes unless actual requirements justify that additional operational complexity.

### Why the frontend remains React

The repository already contains a substantial React/TypeScript UI, reusable components, page layouts, API service modules, and frontend data types. Keeping it avoids rewriting that work. The backend and business logic will be Python; the browser UI will remain React/TypeScript and communicate with FastAPI over REST.

If the requirement is literally to have every application layer written in Python, the frontend would also need to be rebuilt using a Python UI approach. That is a separate scope and is not the migration path planned here.

---

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│              React + TypeScript Frontend            │
│  Login | Dashboard | Explorer | Sharing | Admin      │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / JSON / multipart
                         ▼
┌─────────────────────────────────────────────────────┐
│                 FastAPI REST Backend                │
│                                                     │
│  API Routes → Schemas → Services → Repositories     │
│                              │                      │
│                 ┌────────────┴────────────┐         │
│                 ▼                         ▼         │
│          PostgreSQL                 Storage Layer   │
│      Metadata and audit logs       Provider adapter │
│                                  ┌───────┴────────┐  │
│                                  ▼                ▼  │
│                              Azure Blob       Google │
│                              Storage          Cloud  │
│                                               Storage│
└─────────────────────────────────────────────────────┘
```

PostgreSQL stores application metadata; the actual file bytes are stored in the selected cloud provider. A common storage-provider interface will keep file-management services independent of Azure- or GCP-specific SDK details.

## Planned Python Backend Structure

The Python application will be added under `backend/`. The existing Java files will remain untouched during the first migration stages.

```text
cloud-sync/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── files.py
│   │   │           ├── folders.py
│   │   │           ├── shares.py
│   │   │           └── admin.py
│   │   ├── core/              # Settings, security, common dependencies
│   │   ├── db/                # SQLAlchemy engine and session
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── repositories/      # Database access/query functions
│   │   ├── services/          # Business logic
│   │   └── storage/
│   │       ├── base.py        # Storage-provider interface
│   │       ├── azure.py       # Azure Blob adapter
│   │       └── gcp.py         # Google Cloud Storage adapter
│   ├── tests/
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
├── docs/
├── frontend/
├── docker-compose.yml
└── README.md
```

This is the target layout; files will be added as each phase is implemented.

## Database Design

The current PostgreSQL schema defines these eight core tables:

| Table | Responsibility |
| --- | --- |
| `users` | User profile, password hash, role, and account state |
| `folders` | Hierarchical folders and ownership |
| `files` | File metadata, owner, folder, and selected provider |
| `file_versions` | Version history and cloud object paths |
| `share_links` | Share tokens, permissions, expiry, and access counters |
| `activity_logs` | Audit events |
| `cloud_provider_configs` | Provider configuration and usage information |
| `storage_quotas` | Per-user and per-provider storage counters |

The Python ORM models must map to the existing table/column names first. Any schema changes should be introduced through Alembic migrations and reviewed with the team.

> **Database safety:** the current `database/schema.sql` contains `DROP TABLE IF EXISTS` statements. It is suitable only for initializing a disposable local database through the initial Docker setup. Do not manually re-run it against a database containing data. The migration work will move ongoing schema changes to Alembic.

## Frontend and API Contract

The existing frontend API modules under `frontend/src/api/` define the integration contract. The Python API should preserve those routes and response shapes where practical, rather than forcing a broad frontend rewrite.

Initial route groups include:

| Area | Existing frontend contract |
| --- | --- |
| Authentication | `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` |
| Files | `/api/files`, `/api/files/upload`, `/api/files/{id}/download`, rename, move, delete, and versions |
| Folders | Folder creation, listing, renaming, moving, and deletion |
| Sharing | Create, inspect, and revoke share links |
| Administration | User management, storage metrics, provider configuration, and activity logs |

The frontend currently defaults to mock mode. Once the matching Python endpoints are implemented and tested, set `VITE_USE_MOCK_DATA=false` in the local frontend environment and point `VITE_API_BASE_URL` to the FastAPI server.

FastAPI's interactive API documentation will be available at `/docs` while the backend is running.

---

## Chronological Implementation Roadmap

We will implement and verify the migration in small, reviewable stages.

| Phase | Work | Completion criteria |
| --- | --- | --- |
| 0. Planning | Confirm target stack, repository layout, API contract, and team workflow | Architecture and responsibilities agreed |
| 1. Python foundation | Create virtual environment, dependencies, settings, FastAPI app, health endpoint, and CORS configuration | API starts locally and health endpoint responds |
| 2. Database integration | Configure SQLAlchemy/Psycopg, map existing tables, and configure Alembic | Python backend connects to PostgreSQL without destructive schema resets |
| 3. Authentication | Registration, login, password hashing, JWT validation, current-user endpoint, and role checks | Auth endpoints pass tests |
| 4. Core file/folder APIs | CRUD, ownership checks, search, filtering, and metadata validation | Existing frontend services can use live API data |
| 5. Cloud storage | Implement provider interface and Azure/GCP adapters; upload and download files | Files are stored and retrieved from the selected provider |
| 6. Versioning and sharing | Version history, restore, tokenized shares, permissions, and expiry | Share/version flows pass tests |
| 7. Admin and audit | Admin APIs, quotas, metrics, and activity logs | Admin screens receive real backend data |
| 8. Integration and hardening | Connect frontend, disable mock mode, add tests, logging, error handling, and security checks | End-to-end workflows pass |
| 9. Containerization and CI | Add backend Dockerfile, update Compose, and run automated checks in GitHub Actions | Team can run and validate the stack consistently |
| 10. Java retirement | Remove obsolete Maven/Java files only after parity, review, and team agreement | Python backend is the maintained implementation |

---

## Getting Started

### Prerequisites

- Git
- Python 3.12 or later
- Docker Desktop with Docker Compose
- Node.js 20 or later and npm

### 1. Clone the repository

```bash
git clone https://github.com/Rahulkumar18-11/cloud-sync.git
cd cloud-sync
```

### 2. Start PostgreSQL

Run from the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

The current Compose configuration initializes the schema and seed data when PostgreSQL creates a fresh data volume for the first time.

### 3. Run the existing frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend is served by Vite, normally at `http://localhost:5173`.

### 4. Run the Python backend

The Python backend setup commands will be enabled after Phase 1 adds the FastAPI application and dependency files. The intended local workflow is:

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The intended API base URL is `http://localhost:8000/api`, with interactive documentation at `http://localhost:8000/docs`.

---

## Environment Configuration

Secrets and machine-specific settings must be stored in local environment files, not committed to Git. Commit only safe example files such as `.env.example`.

The backend configuration will include values similar to:

```env
DATABASE_URL=postgresql+psycopg://<user>:<password>@localhost:5432/cloudsync
JWT_SECRET_KEY=<long-random-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
AZURE_STORAGE_CONNECTION_STRING=<azure-connection-string>
AZURE_STORAGE_CONTAINER=<container-name>
GOOGLE_CLOUD_PROJECT=<gcp-project-id>
GOOGLE_APPLICATION_CREDENTIALS=<local-service-account-file>
CORS_ORIGINS=http://localhost:5173
```

Do not commit real database passwords, JWT secrets, Azure connection strings, GCP service-account JSON files, or production credentials. The seeded demo accounts are for local development only and must not be used in a deployed environment.

---

## Team Workflow

Because this is a group repository:

1. Work on a dedicated feature branch; do not push unfinished work directly to `main`.
2. Keep commits focused and use descriptive messages.
3. Open a pull request against `main`.
4. Review the diff and run relevant checks before merging.
5. Coordinate database and API contract changes with the teammates working on the frontend and database.

Suggested branch names:

- `feature/python-fastapi-migration`
- `feature/python-auth`
- `feature/python-file-apis`
- `feature/azure-storage`
- `feature/gcp-storage`

## License

This project is developed for academic and educational demonstration purposes.
