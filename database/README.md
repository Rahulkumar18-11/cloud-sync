# CloudSync Database Documentation

This directory contains the complete database DDL scripts, seed datasets, and Spring Boot JPA integration guide for CloudSync.

---

## 🗄️ Database Architecture

The database is built on **PostgreSQL 16** and uses UUIDs (`gen_random_uuid()`) for primary keys.

### Tables Overview

| Table Name | Description | Key Foreign Keys |
| :--- | :--- | :--- |
| `users` | User accounts, credentials, and roles (`USER`, `ADMIN`) | None |
| `folders` | Hierarchical folder tree | `parent_id -> folders(id)`, `owner_id -> users(id)` |
| `files` | File metadata, MIME types, and multi-cloud providers (`AZURE`, `GCP`) | `folder_id -> folders(id)`, `owner_id -> users(id)` |
| `file_versions` | Version history for each file | `file_id -> files(id)`, `created_by -> users(id)` |
| `share_links` | Secure public sharing tokens and permissions (`VIEW`, `DOWNLOAD`) | `file_id -> files(id)`, `shared_by -> users(id)` |
| `activity_logs` | Audit trail for uploads, downloads, deletions, and moves | `user_id -> users(id)` |
| `cloud_provider_configs` | System/user cloud credentials and primary provider settings | `user_id -> users(id)` |
| `storage_quotas` | 1-to-1 storage consumption metrics (Azure vs GCP) | `user_id -> users(id)` |

---

## 🚀 How to Run the Database

### 1. Start PostgreSQL (Using Docker)
Ensure Docker Desktop is open, then run:
```powershell
docker compose up -d postgres
```
This automatically boots PostgreSQL on port `5432` and loads `schema.sql` and `seed.sql`.

### 2. Verify Database Status
```powershell
docker compose ps
```

### 3. Query Tables Directly from Terminal
```powershell
# List all tables
docker exec -it cloudsync-postgres psql -U postgres -d cloudsync -c "\dt"

# View seeded users
docker exec -it cloudsync-postgres psql -U postgres -d cloudsync -c "SELECT email, role, is_active FROM users;"
```

### 4. Stop Database
```powershell
docker compose down
```

### 5. Wipe and Re-run from Scratch (Reset)
```powershell
docker compose down -v
docker compose up -d postgres
```

---

## ☕ Entity Mapping Guide for Backend (Member 2 - Backend)

Hibernate's default naming strategy (`CamelCaseToUnderscoresNamingStrategy`) maps Java camelCase directly to PostgreSQL snake_case:

| SQL Table | Java Entity Class | Recommended Annotations |
| :--- | :--- | :--- |
| `users` | `com.cloudsync.entity.User` | `@Table(name = "users")`, `@Enumerated(EnumType.STRING)` for `role` |
| `folders` | `com.cloudsync.entity.Folder` | `@Table(name = "folders")`, `@ManyToOne` for `parent` and `owner` |
| `files` | `com.cloudsync.entity.File` | `@Table(name = "files")`, `@Enumerated` for `provider`, `fileType` |
| `file_versions` | `com.cloudsync.entity.FileVersion` | `@Table(name = "file_versions")`, `@ManyToOne` for `file` |
| `share_links` | `com.cloudsync.entity.ShareLink` | `@Table(name = "share_links")`, `@Enumerated` for `permission` |
| `activity_logs` | `com.cloudsync.entity.ActivityLog` | `@Table(name = "activity_logs")` |
| `cloud_provider_configs` | `com.cloudsync.entity.CloudProviderConfig` | `@Table(name = "cloud_provider_configs")` |
| `storage_quotas` | `com.cloudsync.entity.StorageQuota` | `@Table(name = "storage_quotas")`, `@OneToOne` with `User` |

---

## 🔑 Pre-seeded Accounts for Testing

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cloudsync.io` | `Password123!` | `ADMIN` |
| **Regular User** | `user@cloudsync.io` | `Password123!` | `USER` |

*(Password hashes use BCrypt: `$2a$10$7R6vGgD68Hk5q5b/K1C1uehI8Vb0sN8a3y0t7c6d6w3j4o2l8m0hK`)*

