-- =============================================================================
-- CloudSync Database Seed / Test Data
-- Provides initial accounts and sample data for immediate backend testing
-- =============================================================================

-- Seed Admin & Regular User (BCrypt password: 'Password123!')
-- BCrypt hash for 'Password123!': $2a$10$7R6vGgD68Hk5q5b/K1C1uehI8Vb0sN8a3y0t7c6d6w3j4o2l8m0hK
INSERT INTO users (id, name, email, password_hash, role, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Admin CloudSync', 'admin@cloudsync.io', '$2a$10$7R6vGgD68Hk5q5b/K1C1uehI8Vb0sN8a3y0t7c6d6w3j4o2l8m0hK', 'ADMIN', true),
  ('22222222-2222-2222-2222-222222222222', 'Alex Rivera', 'user@cloudsync.io', '$2a$10$7R6vGgD68Hk5q5b/K1C1uehI8Vb0sN8a3y0t7c6d6w3j4o2l8m0hK', 'USER', true)
ON CONFLICT (email) DO NOTHING;

-- Seed Storage Quota for Alex Rivera
INSERT INTO storage_quotas (user_id, used_bytes, total_bytes, azure_used_bytes, gcp_used_bytes, files_count, folders_count)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  254890000, 
  10737418240, 
  160000000, 
  94890000, 
  2, 
  1
) ON CONFLICT (user_id) DO NOTHING;

-- Seed Sample Folders
INSERT INTO folders (id, name, parent_id, owner_id)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Documents', NULL, '22222222-2222-2222-2222-222222222222'),
  ('55555555-5555-5555-5555-555555555555', 'Project Specs', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample File
INSERT INTO files (id, name, extension, mime_type, file_type, size_bytes, provider, folder_id, owner_id)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Project_Architecture.pdf',
  'pdf',
  'application/pdf',
  'pdf',
  2450000,
  'AZURE',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT (id) DO NOTHING;

-- Seed Initial File Version
INSERT INTO file_versions (id, file_id, version_number, size_bytes, cloud_path, is_current, created_by, notes)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '44444444-4444-4444-4444-444444444444',
  1,
  2450000,
  'azure/documents/Project_Architecture.pdf',
  true,
  '22222222-2222-2222-2222-222222222222',
  'Initial upload'
) ON CONFLICT (file_id, version_number) DO NOTHING;

-- Link current version back to files
UPDATE files 
SET current_version_id = '66666666-6666-6666-6666-666666666666'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Seed Default Cloud Provider Settings for Admin
INSERT INTO cloud_provider_configs (id, user_id, provider, account_email, container_or_bucket_name, is_configured, is_active)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  'AZURE',
  'azure-admin@cloudsync.io',
  'cloudsync-primary-container',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- Seed Sample Activity Log
INSERT INTO activity_logs (id, user_id, user_name, user_email, action, details, target_name, target_id, provider)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  '22222222-2222-2222-2222-222222222222',
  'Alex Rivera',
  'user@cloudsync.io',
  'UPLOAD_FILE',
  'Uploaded Project_Architecture.pdf to Microsoft Azure',
  'Project_Architecture.pdf',
  '44444444-4444-4444-4444-444444444444',
  'AZURE'
) ON CONFLICT (id) DO NOTHING;

