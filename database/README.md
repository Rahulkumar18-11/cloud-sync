# Database Design & Operations Guide

This directory maintains the relational data model, DDL definitions, seed datasets, and operational procedures for CloudSync's PostgreSQL layer.

---

## Architectural Overview

CloudSync relies on **PostgreSQL 16** for storing user profiles, folder hierarchies, file metadata, sharing tokens, and audit logs. The physical files themselves are stored in Microsoft Azure Blob Storage and Google Cloud Storage buckets, while PostgreSQL acts as the high-performance metadata catalogue and indexing engine.

### Key Design Decisions
1. **Universally Unique Identifiers (UUIDv4)**: Primary keys use `gen_random_uuid()` to prevent predictable ID enumeration and simplify distributed multi-region data synchronization.
2. **Naming Alignment with Spring Data JPA**: All table and column names strictly adhere to standard `snake_case` (e.g., `user_id`, `created_at`, `size_bytes`). This allows Hibernate's default `CamelCaseToUnderscoresNamingStrategy` to map directly to Java fields without requiring repetitive `@Column` annotations.
3. **Explicit Integrity Rules**: Foreign keys enforce referential integrity with cascading deletes (`ON DELETE CASCADE`) on dependent records such as file versions and share links, preventing orphaned metadata when a file is deleted.
4. **Timezone Awareness**: All timestamp fields use `TIMESTAMPTZ` (UTC) to eliminate timezone conversion ambiguities across client browsers and cloud regions.

---

## Entity Relationship Summary

The schema is divided into 8 core tables:

| Table Name | Description | Key Relationships |
| :--- | :--- | :--- |
| `users` | User credentials, roles (`USER`, `ADMIN`), and account state | Parent to folders, files, activity logs, quotas |
| `folders` | Hierarchical folder tree with self-referencing hierarchy | `parent_id` references `folders(id)`, `owner_id` references `users(id)` |
| `files` | Primary file records, MIME types, and provider designation (`AZURE`, `GCP`) | `folder_id` references `folders(id)`, `owner_id` references `users(id)` |
| `file_versions` | Historical revisions with cloud storage paths and change notes | `file_id` references `files(id)` on cascade |
| `share_links` | Secure public sharing tokens, access limits, and view counters | `file_id` references `files(id)`, `shared_by` references `users(id)` |
| `activity_logs` | Immutable audit trail for uploads, downloads, renames, and deletions | `user_id` references `users(id)` |
| `cloud_provider_configs` | System and user cloud connection configurations | `user_id` references `users(id)` |
| `storage_quotas` | 1-to-1 storage consumption counters per provider | Unique foreign key to `users(id)` |

---

## Managing the Database Locally

We run PostgreSQL in a lightweight Docker container to ensure all team members work against an identical, reproducible database version.

### 1. Launch the Database
Make sure Docker Desktop is running, then execute from the repository root:

```bash
docker compose up -d postgres
```

On first run, Docker automatically mounts and executes:
- `database/schema.sql` (Creates all tables, constraints, and performance indexes)
- `database/seed.sql` (Loads default administrative and testing accounts)

### 2. Check Container Health
```bash
docker compose ps
```

### 3. Inspect Tables via Terminal
You can connect to `psql` directly inside the container without installing PostgreSQL tools on your host machine:

```bash
# List all created tables
docker exec -it cloudsync-postgres psql -U postgres -d cloudsync -c "\dt"

# View initial seed users
docker exec -it cloudsync-postgres psql -U postgres -d cloudsync -c "SELECT email, role, is_active FROM users;"
```

### 4. Stop the Database
```bash
docker compose down
```

### 5. Reset to a Clean State
If you update `schema.sql` or `seed.sql` and want to rebuild the database from scratch:

```bash
docker compose down -v
docker compose up -d postgres
```

---

## JPA Entity Mapping Reference for Backend Developers

When implementing Spring Boot entity classes in `com.vaultx.entity` (or `com.cloudsync.entity`), use this mapping specification:

| PostgreSQL Table | Java Entity Class | Recommended Field Types & Annotations |
| :--- | :--- | :--- |
| `users` | `User.java` | `@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;`<br>`@Enumerated(EnumType.STRING) private UserRole role;` |
| `folders` | `Folder.java` | `@ManyToOne private Folder parent;`<br>`@ManyToOne private User owner;` |
| `files` | `File.java` | `@Enumerated(EnumType.STRING) private CloudProvider provider;`<br>`@ManyToOne private Folder folder;` |
| `file_versions` | `FileVersion.java` | `@ManyToOne private File file;`<br>`private Long sizeBytes;` |
| `share_links` | `ShareLink.java` | `@Column(unique = true) private String token;`<br>`@Enumerated(EnumType.STRING) private SharePermission permission;` |
| `activity_logs` | `ActivityLog.java` | `private String action;`<br>`private Instant timestamp;` |
| `cloud_provider_configs` | `CloudProviderConfig.java` | `@Enumerated(EnumType.STRING) private CloudProvider provider;` |
| `storage_quotas` | `StorageQuota.java` | `@OneToOne @JoinColumn(name = "user_id") private User user;` |

---

## Default Seed Accounts for Local Testing

| Role | Email | Password | Password Hash (BCrypt) |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cloudsync.io` | `Password123!` | `$2a$10$7R6vGgD68Hk5q5b/K1C1uehI8Vb0sN8a3y0t7c6d6w3j4o2l8m0hK` |
| **User** | `user@cloudsync.io` | `Password123!` | `$2a$10$7R6vGgD68Hk5q5b/K1C1uehI8Vb0sN8a3y0t7c6d6w3j4o2l8m0hK` |
