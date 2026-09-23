# CloudSync

> Secure, unified multi-cloud file storage and management platform.

CloudSync is a centralized web platform designed to simplify file management across heterogeneous cloud storage environments. Instead of juggling different consoles and APIs, users can upload, organize, search, version, and share files seamlessly across **Microsoft Azure Blob Storage** and **Google Cloud Storage (GCP)** through a single modern interface.

---

## Key Capabilities

### Core File Operations
- **Multi-Cloud Upload & Storage**: Upload files directly to Microsoft Azure Blob Storage or Google Cloud Storage.
- **Hierarchical Folder Organization**: Create nested folder hierarchies with dynamic breadcrumb navigation.
- **File Versioning**: Maintain an audit trail of previous file revisions with point-in-time restore capabilities.
- **Granular File Sharing**: Generate token-based public share links with configurable permissions (View or Download) and optional expiration dates.
- **Instant Search & Filtering**: Client-debounced search by file name, with filters for file type (PDF, doc, spreadsheet, media, code) and cloud provider.

### Administration & Security
- **Authentication & Authorization**: Stateless JWT-based authentication with role-based access control (`USER` and `ADMIN`).
- **Storage Metrics & Quotas**: Real-time tracking of overall and per-provider storage consumption (Azure vs. GCP).
- **Audit Logging**: Comprehensive activity logs recording actions (uploads, renames, moves, deletions, shares) with timestamps and actor details.
- **Admin Command Center**: System-wide capacity metrics, provider toggles, and user account management.

---

## Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | Single-page application with type safety |
| **Styling** | Tailwind CSS v4, Lucide Icons | Responsive layout with light and dark mode |
| **Routing & State** | React Router 7, Context API | Client-side routing and global auth/theme state |
| **Backend** | Spring Boot, Spring Data JPA | RESTful microservice architecture on Java 21/25 |
| **Database** | PostgreSQL 16 | Relational storage for users, metadata, and audit logs |
| **Cloud Storage** | Azure Blob Storage, Google Cloud Storage | Distributed object storage engines |
| **DevOps** | Docker, Docker Compose | Containerized local development and orchestration |

---

## Repository Structure

```
cloud-sync/
├── frontend/                     # React + TypeScript single-page application
│   ├── src/
│   │   ├── api/                  # Axios service modules matching REST contracts
│   │   ├── components/           # Reusable UI widgets and modals
│   │   ├── context/              # Auth, theme, and toast providers
│   │   ├── pages/                # Route-level views (Dashboard, Admin, Profile)
│   │   └── types/                # Shared TypeScript interface models
│   ├── package.json
│   └── vite.config.ts
│
├── database/                     # PostgreSQL schema and initialization
│   ├── schema.sql                # Complete relational DDL (tables, indexes, constraints)
│   ├── seed.sql                  # Initial accounts and sample data for development
│   └── README.md                 # Database setup and entity mapping guide
│
├── src/                          # Spring Boot backend source code
│   ├── main/java/com/vaultx/     # Application controllers, entities, services
│   └── main/resources/           # Configuration and application.properties
│
├── docker-compose.yml            # Local PostgreSQL 16 orchestration
├── pom.xml                       # Maven build configuration
└── README.md
```

---

## Getting Started

### Prerequisites
- **Git**
- **Docker Desktop** (recommended for running PostgreSQL without local installation)
- **Java JDK 21+** and **Maven**
- **Node.js 20+** and **npm**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Rahulkumar18-11/cloud-sync.git
cd cloud-sync
```

---

### Step 2: Start the Database

Launch PostgreSQL via Docker Compose. The database will automatically initialize with the schema and test seed data:

```bash
docker compose up -d postgres
```

Verify that the container is healthy:

```bash
docker compose ps
```

---

### Step 3: Run the Backend

Start the Spring Boot REST API:

```bash
# Windows
.\mvnw spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

The backend server starts on `http://localhost:8080`. You can verify it by visiting `http://localhost:8080/api/test`.

---

### Step 4: Run the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The web application will be accessible at `http://localhost:5173`.

---

## Pre-configured Development Accounts

When developing locally against the seeded database or frontend mock mode:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cloudsync.io` | `Password123!` | System stats, user management, audit logs, file explorer |
| **Standard User** | `user@cloudsync.io` | `Password123!` | Personal file storage, sharing, folder management |

---

## Configuration Reference

Key backend properties can be configured in `src/main/resources/application.properties` or via environment variables:

| Property | Default Value | Description |
| :--- | :--- | :--- |
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/cloudsync` | PostgreSQL connection URL |
| `spring.datasource.username` | `postgres` | Database username |
| `spring.datasource.password` | `password` | Database password |
| `server.port` | `8080` | Backend HTTP listening port |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Frontend API target endpoint |
| `VITE_USE_MOCK_DATA` | `true` (set `false` for live backend) | Toggle frontend mock dataset |

---

## Team & Contributors

Developed as an academic capstone project by:

- **Anshu** (25MCC20050) – Database Architecture & Infrastructure
- **Rahul Kumar** (25MCC20051) – Backend & Cloud Integration
- **Hemant** (25MCC20023) – Testing, Quality Assurance & Documentation

---

## License

This project is created for educational and academic demonstration purposes.
