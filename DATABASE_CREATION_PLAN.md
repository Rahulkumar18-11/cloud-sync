# Database Architecture Specification - CloudSync Project

**Status:** Phase 1 Implemented (Schema, Seed & Docker Active)  
**Date:** 2026-09-10  
**Scope:** Relational Model, Constraints, and JPA Entity Mappings

---

## Objective

Create a complete, production-ready PostgreSQL database schema for the CloudSync cloud file management system with JPA entity classes, proper relationships, and database migrations.

---

## Phase 1: Entity Design & JPA Configuration

### 1.1 User Entity
**File:** `src/main/java/com/vaultx/entity/User.java`

```
Properties:
- id (UUID, Primary Key)
- name (String, required)
- email (String, unique, required)
- password (String, encrypted)
- role (Enum: USER, ADMIN)
- avatarUrl (String, optional)
- createdAt (LocalDateTime)
- updatedAt (LocalDateTime)
- lastLogin (LocalDateTime)
- isActive (Boolean)

Relationships:
- One-to-Many: Files (User → FileItem)
- One-to-Many: Folders (User → FolderItem)
- One-to-Many: Activities (User → Activity)
- One-to-Many: SharedLinks (User → ShareLink)
```

### 1.2 Folder Entity
**File:** `src/main/java/com/vaultx/entity/Folder.java`

```
Properties:
- id (UUID, Primary Key)
- name (String, required)
- parentId (UUID, optional - self-referencing for hierarchy)
- ownerId (UUID, Foreign Key to User)
- createdAt (LocalDateTime)
- updatedAt (LocalDateTime)

Relationships:
- Many-to-One: Owner User
- One-to-Many: Child Folders (self-referencing)
- One-to-Many: Files
- Many-to-One: Parent Folder (self-referencing)
```

### 1.3 File Entity
**File:** `src/main/java/com/vaultx/entity/File.java`

```
Properties:
- id (UUID, Primary Key)
- name (String, required)
- extension (String)
- mimeType (String)
- fileType (Enum: pdf, image, doc, spreadsheet, presentation, code, archive, audio, video, other)
- sizeBytes (Long)
- provider (Enum: AZURE, GCP)
- folderId (UUID, Foreign Key to Folder - nullable)
- ownerId (UUID, Foreign Key to User)
- currentVersionId (UUID, Foreign Key to FileVersion)
- createdAt (LocalDateTime)
- updatedAt (LocalDateTime)
- isShared (Boolean)

Relationships:
- Many-to-One: Owner User
- Many-to-One: Folder
- One-to-Many: FileVersions
- One-to-Many: SharedLinks
- One-to-Many: Activities
```

### 1.4 FileVersion Entity
**File:** `src/main/java/com/vaultx/entity/FileVersion.java`

```
Properties:
- id (UUID, Primary Key)
- fileId (UUID, Foreign Key to File)
- versionNumber (Integer)
- sizeBytes (Long)
- createdAt (LocalDateTime)
- createdBy (UUID, Foreign Key to User)
- downloadUrl (String, optional)
- isCurrent (Boolean)
- notes (String, optional)
- cloudPath (String - path in cloud storage)

Relationships:
- Many-to-One: File
- Many-to-One: Created By User
```

### 1.5 ShareLink Entity
**File:** `src/main/java/com/vaultx/entity/ShareLink.java`

```
Properties:
- id (UUID, Primary Key)
- fileId (UUID, Foreign Key to File)
- sharedBy (UUID, Foreign Key to User - who created share)
- token (String, unique - for public access)
- permission (Enum: VIEW, DOWNLOAD)
- expiresAt (LocalDateTime, optional)
- createdAt (LocalDateTime)
- accessCount (Long - tracking access)
- isActive (Boolean)

Relationships:
- Many-to-One: File
- Many-to-One: SharedBy User
```

### 1.6 Activity Entity
**File:** `src/main/java/com/vaultx/entity/Activity.java`

```
Properties:
- id (UUID, Primary Key)
- userId (UUID, Foreign Key to User)
- action (Enum: UPLOAD, DELETE, RENAME, MOVE, DOWNLOAD, SHARE, UNSHARE)
- resourceType (Enum: FILE, FOLDER)
- resourceId (UUID)
- resourceName (String)
- description (String)
- timestamp (LocalDateTime)
- provider (Enum: AZURE, GCP, optional)

Relationships:
- Many-to-One: User
```

### 1.7 CloudProviderConfig Entity
**File:** `src/main/java/com/vaultx/entity/CloudProviderConfig.java`

```
Properties:
- id (UUID, Primary Key)
- userId (UUID, Foreign Key to User)
- provider (Enum: AZURE, GCP)
- accountEmail (String)
- isConfigured (Boolean)
- isActive (Boolean)
- usedStorageBytes (Long)
- totalStorageBytes (Long)
- configuredAt (LocalDateTime)
- lastSyncedAt (LocalDateTime)

Relationships:
- Many-to-One: User
```

### 1.8 StorageQuota Entity (Optional - could be computed)
**File:** `src/main/java/com/vaultx/entity/StorageQuota.java`

```
Properties:
- id (UUID, Primary Key)
- userId (UUID, Foreign Key to User)
- usedBytes (Long)
- totalBytes (Long)
- azureUsedBytes (Long)
- gcpUsedBytes (Long)
- filesCount (Integer)
- foldersCount (Integer)
- lastCalculated (LocalDateTime)

Relationships:
- One-to-One: User
```

---

## Phase 2: Database Configuration

### 2.1 Update application.properties

```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/cloudsync
spring.datasource.username=postgres
spring.datasource.password=password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Connection Pool (HikariCP)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.connection-timeout=20000
```

---

## Phase 3: Implementation Steps

### Step 1: Create Entity Classes
- Create all 8 entity classes with annotations
- Add validation annotations (@NotNull, @NotBlank, @Email, etc.)
- Add proper constructors and getters/setters
- Use Lombok @Data, @NoArgsConstructor, @AllArgsConstructor

### Step 2: Create JPA Repositories
- `UserRepository extends JpaRepository<User, UUID>`
- `FileRepository extends JpaRepository<File, UUID>`
- `FolderRepository extends JpaRepository<Folder, UUID>`
- `FileVersionRepository extends JpaRepository<FileVersion, UUID>`
- `ShareLinkRepository extends JpaRepository<ShareLink, UUID>`
- `ActivityRepository extends JpaRepository<Activity, UUID>`
- `CloudProviderConfigRepository extends JpaRepository<CloudProviderConfig, UUID>`
- `StorageQuotaRepository extends JpaRepository<StorageQuota, UUID>`

Add custom query methods as needed (e.g., `findByEmail`, `findByOwnerId`, etc.)

### Step 3: Create Database Migration Scripts
- DDL scripts for all tables
- Index creation for performance
- Constraint definitions (foreign keys, unique constraints)

### Step 4: Create Service Layer (Optional at this phase)
- `UserService`
- `FileService`
- `FolderService`
- etc.

---

## Detailed Tasks Breakdown

```
DATABASE CREATION PROJECT
├── Phase 1: Entity Design (Estimated: 1 day)
│   ├── Create User.java entity
│   ├── Create Folder.java entity
│   ├── Create File.java entity
│   ├── Create FileVersion.java entity
│   ├── Create ShareLink.java entity
│   ├── Create Activity.java entity
│   ├── Create CloudProviderConfig.java entity
│   └── Create StorageQuota.java entity
│
├── Phase 2: Configuration (Estimated: 4 hours)
│   ├── Update pom.xml with Liquibase dependency
│   ├── Update application.properties
│   ├── Create Liquibase changelog master file
│   └── Configure connection pooling
│
├── Phase 3: Repository Layer (Estimated: 4 hours)
│   ├── Create UserRepository
│   ├── Create FileRepository
│   ├── Create FolderRepository
│   ├── Create FileVersionRepository
│   ├── Create ShareLinkRepository
│   ├── Create ActivityRepository
│   ├── Create CloudProviderConfigRepository
│   └── Create StorageQuotaRepository
│
├── Phase 4: Migration Scripts (Estimated: 1 day)
│   ├── Create changelog for User table
│   ├── Create changelog for Folder table
│   ├── Create changelog for File table
│   ├── Create changelog for FileVersion table
│   ├── Create changelog for ShareLink table
│   ├── Create changelog for Activity table
│   ├── Create changelog for CloudProviderConfig table
│   ├── Create changelog for StorageQuota table
│   └── Add indexes and constraints
│
├── Phase 5: Testing (Estimated: 1 day)
│   ├── Create integration test configuration
│   ├── Create H2 test database config
│   ├── Write repository tests
│   └── Validate CRUD operations
│
└── Phase 6: Documentation (Estimated: 4 hours)
    ├── Create database schema diagram
    ├── Document relationships
    ├── Add setup instructions
    └── Create troubleshooting guide
```

---

## Key Considerations

1. **UUIDs vs Auto-Increment IDs**
   - Using UUID for primary keys (recommended for distributed systems)
   - PostgreSQL native `gen_random_uuid()` used

2. **Audit Fields**
   - All entities should have `createdAt` and `updatedAt` timestamps
   - Uses Hibernate `@CreationTimestamp` and `@UpdateTimestamp`

3. **Cascading**
   - Careful cascading strategy for deletions (e.g., cascadeType.ALL)
   - Orphaned versions and share links cascade on file deletion

4. **Performance Indexes**
   - Index on `email` for user lookups
   - Index on `ownerId` for file/folder queries
   - Index on `createdAt` for sorting/filtering

5. **Database User Permissions**
   - Use dedicated database user with minimal required permissions

---

## Success Criteria

- [x] All 8 relational tables designed and specified
- [x] All relationships properly defined
- [x] PostgreSQL database running via Docker Compose
- [x] All tables created with proper constraints
- [x] Foreign keys properly configured
- [x] Indexes created on performance-critical columns
- [x] Seed data inserted for testing
- [x] Backend connects successfully
- [ ] JPA entity classes created in backend
- [ ] All repositories created with custom query methods
- [ ] Integration tests passing (CRUD operations)

---

## Dependencies & Prerequisites

- Docker Desktop installed and running
- Java 21+ JDK configured
- Maven 3.8+ configured

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Schema drift | Keep schema.sql and JPA entities strictly aligned |
| Data type mismatches | Validate types against frontend TypeScript types |
| Performance bottlenecks | Indexes placed proactively on foreign keys and search fields |
| Connection pool exhaustion | HikariCP configured properly |

---

## Next Actions

1. Review and approve database schema
2. Backend Lead creates JPA entity classes
3. Backend Lead creates Spring Data JPA repositories
4. Implement REST API endpoints matching frontend contracts

