-- =============================================================================
-- CloudSync PostgreSQL Database Schema
-- Compatible with PostgreSQL 13+ and Spring Boot Data JPA
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS share_links CASCADE;
DROP TABLE IF EXISTS file_versions CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS storage_quotas CASCADE;
DROP TABLE IF EXISTS cloud_provider_configs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- -----------------------------------------------------------------------------
-- 2. FOLDERS TABLE (Self-referencing tree structure)
-- -----------------------------------------------------------------------------
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_folders_owner_id ON folders(owner_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);

-- -----------------------------------------------------------------------------
-- 3. FILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(30) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(30) NOT NULL CHECK (file_type IN ('pdf', 'image', 'doc', 'spreadsheet', 'presentation', 'code', 'archive', 'audio', 'video', 'other')),
    size_bytes BIGINT NOT NULL DEFAULT 0,
    provider VARCHAR(20) NOT NULL DEFAULT 'AZURE' CHECK (provider IN ('AZURE', 'GCP')),
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_version_id UUID,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_files_owner_id ON files(owner_id);
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_provider ON files(provider);
CREATE INDEX idx_files_file_type ON files(file_type);

-- -----------------------------------------------------------------------------
-- 4. FILE VERSIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    size_bytes BIGINT NOT NULL,
    cloud_path TEXT NOT NULL,
    download_url TEXT,
    notes TEXT,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_file_version UNIQUE(file_id, version_number)
);

CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);

-- Add foreign key constraint back to files for current_version_id
ALTER TABLE files 
ADD CONSTRAINT fk_files_current_version 
FOREIGN KEY (current_version_id) REFERENCES file_versions(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 5. SHARE LINKS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    permission VARCHAR(20) NOT NULL DEFAULT 'DOWNLOAD' CHECK (permission IN ('VIEW', 'DOWNLOAD')),
    views_count INT NOT NULL DEFAULT 0,
    downloads_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_file_id ON share_links(file_id);

-- -----------------------------------------------------------------------------
-- 6. ACTIVITY LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    user_email VARCHAR(150),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    target_name VARCHAR(255) NOT NULL,
    target_id UUID,
    provider VARCHAR(20) CHECK (provider IN ('AZURE', 'GCP')),
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- -----------------------------------------------------------------------------
-- 7. CLOUD PROVIDER CONFIGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE cloud_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('AZURE', 'GCP')),
    account_email VARCHAR(150),
    container_or_bucket_name VARCHAR(150),
    is_configured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    used_storage_bytes BIGINT NOT NULL DEFAULT 0,
    total_storage_bytes BIGINT NOT NULL DEFAULT 10737418240, -- 10GB default
    configured_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMPTZ
);

CREATE INDEX idx_cloud_config_user_id ON cloud_provider_configs(user_id);

-- -----------------------------------------------------------------------------
-- 8. STORAGE QUOTAS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE storage_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    used_bytes BIGINT NOT NULL DEFAULT 0,
    total_bytes BIGINT NOT NULL DEFAULT 10737418240, -- 10GB default
    azure_used_bytes BIGINT NOT NULL DEFAULT 0,
    gcp_used_bytes BIGINT NOT NULL DEFAULT 0,
    files_count INT NOT NULL DEFAULT 0,
    folders_count INT NOT NULL DEFAULT 0,
    last_calculated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

