import { User } from '../types/auth';
import { FileItem, FolderItem, FileVersion, ShareLink } from '../types/file';
import { ActivityLog } from '../types/activity';
import { AdminUser, SystemStorageStats, SystemCloudConfig } from '../types/admin';
import { StorageQuota } from '../types/user';

export const MOCK_CURRENT_USER: User = {
  id: 'usr_001',
  name: 'Alex Rivera',
  email: 'user@cloudsync.io',
  role: 'USER',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2025-10-15T09:30:00Z',
};

export const MOCK_ADMIN_USER: User = {
  id: 'usr_002',
  name: 'Sarah Connor',
  email: 'admin@cloudsync.io',
  role: 'ADMIN',
  avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  createdAt: '2025-09-01T08:00:00Z',
};

export const INITIAL_FOLDERS: FolderItem[] = [
  {
    id: 'fld_101',
    name: 'Project Architecture & Specs',
    parentId: null,
    createdAt: '2026-01-10T11:20:00Z',
    updatedAt: '2026-02-01T14:30:00Z',
    ownerId: 'usr_001',
    itemsCount: 4,
    sizeBytes: 15420000,
  },
  {
    id: 'fld_102',
    name: 'Financial Reports 2026',
    parentId: null,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-04T16:15:00Z',
    ownerId: 'usr_001',
    itemsCount: 3,
    sizeBytes: 28900000,
  },
  {
    id: 'fld_103',
    name: 'UI UX Design Assets',
    parentId: null,
    createdAt: '2026-01-20T13:45:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
    ownerId: 'usr_001',
    itemsCount: 5,
    sizeBytes: 45600000,
  },
  {
    id: 'fld_104',
    name: 'Frontend Mockups',
    parentId: 'fld_103',
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-02-02T11:00:00Z',
    ownerId: 'usr_001',
    itemsCount: 2,
    sizeBytes: 12000000,
  },
];

export const INITIAL_FILES: FileItem[] = [
  {
    id: 'fil_201',
    name: 'CloudSync_System_Architecture_Diagram.pdf',
    folderId: 'fld_101',
    sizeBytes: 4250000,
    fileType: 'pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    provider: 'AZURE',
    createdAt: '2026-01-12T14:00:00Z',
    updatedAt: '2026-02-01T15:20:00Z',
    ownerId: 'usr_001',
    ownerName: 'Alex Rivera',
    versionsCount: 3,
    currentVersionId: 'ver_301_v3',
    isShared: true,
  },
  {
    id: 'fil_202',
    name: 'Spring_Boot_REST_API_Contract.docx',
    folderId: 'fld_101',
    sizeBytes: 1850000,
    fileType: 'doc',
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    provider: 'GCP',
    createdAt: '2026-01-14T09:30:00Z',
    updatedAt: '2026-01-28T11:10:00Z',
    ownerId: 'usr_001',
    ownerName: 'Alex Rivera',
    versionsCount: 2,
    currentVersionId: 'ver_302_v2',
    isShared: false,
  },
  {
    id: 'fil_203',
    name: 'Q1_Budget_Allocation_Forecast.xlsx',
    folderId: 'fld_102',
    sizeBytes: 8400000,
    fileType: 'spreadsheet',
    extension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    provider: 'AZURE',
    createdAt: '2026-01-18T16:45:00Z',
    updatedAt: '2026-02-04T12:00:00Z',
    ownerId: 'usr_001',
    ownerName: 'Alex Rivera',
    versionsCount: 4,
    currentVersionId: 'ver_303_v4',
    isShared: true,
  },
  {
    id: 'fil_204',
    name: 'CloudSync_Brand_Design_Tokens.json',
    folderId: 'fld_103',
    sizeBytes: 240000,
    fileType: 'code',
    extension: 'json',
    mimeType: 'application/json',
    provider: 'GCP',
    createdAt: '2026-01-25T10:15:00Z',
    updatedAt: '2026-02-05T09:30:00Z',
    ownerId: 'usr_001',
    ownerName: 'Alex Rivera',
    versionsCount: 1,
    currentVersionId: 'ver_304_v1',
    isShared: false,
  },
  {
    id: 'fil_205',
    name: 'CloudSync_Product_Demo_Walkthrough.mp4',
    folderId: null,
    sizeBytes: 154000000,
    fileType: 'video',
    extension: 'mp4',
    mimeType: 'video/mp4',
    provider: 'AZURE',
    createdAt: '2026-02-01T18:00:00Z',
    updatedAt: '2026-02-01T18:00:00Z',
    ownerId: 'usr_001',
    ownerName: 'Alex Rivera',
    versionsCount: 1,
    currentVersionId: 'ver_305_v1',
    isShared: true,
  },
  {
    id: 'fil_206',
    name: 'MultiCloud_Sync_Performance_Benchmark.pdf',
    folderId: null,
    sizeBytes: 3100000,
    fileType: 'pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    provider: 'GCP',
    createdAt: '2026-02-03T11:20:00Z',
    updatedAt: '2026-02-03T11:20:00Z',
    ownerId: 'usr_001',
    ownerName: 'Alex Rivera',
    versionsCount: 2,
    currentVersionId: 'ver_306_v2',
    isShared: false,
  },
  {
    id: 'fil_207',
    name: 'Dashboard_Hero_Mockup_V2.png',
    folderId: 'fld_104',
    sizeBytes: 6500000,
    fileType: 'image',
    extension: 'png',
    mimeType: 'image/png',
    provider: 'AZURE',
    createdAt: '2026-01-23T14:10:00Z',
    updatedAt: '2026-02-02T16:00:00Z',
    ownerId: 'usr_001',
    ownerName: 'Alex Rivera',
    versionsCount: 2,
    currentVersionId: 'ver_307_v2',
    isShared: false,
  }
];

export const MOCK_FILE_VERSIONS: Record<string, FileVersion[]> = {
  'fil_201': [
    {
      id: 'ver_301_v3',
      versionNumber: 3,
      sizeBytes: 4250000,
      createdAt: '2026-02-01T15:20:00Z',
      createdBy: 'Alex Rivera',
      isCurrent: true,
      notes: 'Added Azure Blob Storage sync sequence flow chart'
    },
    {
      id: 'ver_301_v2',
      versionNumber: 2,
      sizeBytes: 3890000,
      createdAt: '2026-01-20T10:00:00Z',
      createdBy: 'Alex Rivera',
      isCurrent: false,
      notes: 'Updated security endpoints & JWT validation section'
    },
    {
      id: 'ver_301_v1',
      versionNumber: 1,
      sizeBytes: 3100000,
      createdAt: '2026-01-12T14:00:00Z',
      createdBy: 'Alex Rivera',
      isCurrent: false,
      notes: 'Initial architectural draft'
    }
  ],
  'fil_203': [
    {
      id: 'ver_303_v4',
      versionNumber: 4,
      sizeBytes: 8400000,
      createdAt: '2026-02-04T12:00:00Z',
      createdBy: 'Alex Rivera',
      isCurrent: true,
      notes: 'Approved Q1 cloud infrastructure expenditure'
    },
    {
      id: 'ver_303_v3',
      versionNumber: 3,
      sizeBytes: 7900000,
      createdAt: '2026-01-29T16:30:00Z',
      createdBy: 'Alex Rivera',
      isCurrent: false,
      notes: 'Revised GCP storage tier pricing model'
    }
  ]
};

export const INITIAL_SHARE_LINKS: ShareLink[] = [
  {
    id: 'sh_401',
    fileId: 'fil_201',
    fileName: 'CloudSync_System_Architecture_Diagram.pdf',
    token: 'cs_share_7x89q2a',
    shareableUrl: `${window.location.origin}/shared/cs_share_7x89q2a`,
    permission: 'DOWNLOAD',
    createdAt: '2026-02-02T10:00:00Z',
    expiresAt: '2026-03-01T23:59:59Z',
    viewsCount: 24,
    downloadsCount: 12,
  },
  {
    id: 'sh_402',
    fileId: 'fil_205',
    fileName: 'CloudSync_Product_Demo_Walkthrough.mp4',
    token: 'cs_share_9k31m0z',
    shareableUrl: `${window.location.origin}/shared/cs_share_9k31m0z`,
    permission: 'VIEW',
    createdAt: '2026-02-03T15:30:00Z',
    expiresAt: null,
    viewsCount: 89,
    downloadsCount: 0,
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act_501',
    userId: 'usr_001',
    userName: 'Alex Rivera',
    userEmail: 'user@cloudsync.io',
    action: 'UPLOAD_FILE',
    targetName: 'MultiCloud_Sync_Performance_Benchmark.pdf',
    details: 'Uploaded 3.1 MB to Google Cloud Storage (GCP)',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    provider: 'GCP',
  },
  {
    id: 'act_502',
    userId: 'usr_001',
    userName: 'Alex Rivera',
    userEmail: 'user@cloudsync.io',
    action: 'SHARE_FILE',
    targetName: 'CloudSync_Product_Demo_Walkthrough.mp4',
    details: 'Generated public share link with VIEW permission',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    provider: 'AZURE',
  },
  {
    id: 'act_503',
    userId: 'usr_001',
    userName: 'Alex Rivera',
    userEmail: 'user@cloudsync.io',
    action: 'RESTORE_VERSION',
    targetName: 'CloudSync_System_Architecture_Diagram.pdf',
    details: 'Restored file version v3',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    provider: 'AZURE',
  },
  {
    id: 'act_504',
    userId: 'usr_001',
    userName: 'Alex Rivera',
    userEmail: 'user@cloudsync.io',
    action: 'CREATE_FOLDER',
    targetName: 'UI UX Design Assets',
    details: 'Created new root directory',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'act_505',
    userId: 'usr_002',
    userName: 'Sarah Connor',
    userEmail: 'admin@cloudsync.io',
    action: 'UPDATE_PROFILE',
    targetName: 'Global Cloud Config',
    details: 'Switched default primary provider to Azure Blob Storage',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr_001',
    name: 'Alex Rivera',
    email: 'user@cloudsync.io',
    role: 'USER',
    enabled: true,
    usedStorageBytes: 254890000,
    totalStorageBytes: 10737418240, // 10 GB
    filesCount: 15,
    createdAt: '2025-10-15T09:30:00Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'usr_002',
    name: 'Sarah Connor',
    email: 'admin@cloudsync.io',
    role: 'ADMIN',
    enabled: true,
    usedStorageBytes: 524288000,
    totalStorageBytes: 53687091200, // 50 GB
    filesCount: 42,
    createdAt: '2025-09-01T08:00:00Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'usr_003',
    name: 'Marcus Vance',
    email: 'marcus.vance@techcorp.com',
    role: 'USER',
    enabled: true,
    usedStorageBytes: 1845000000,
    totalStorageBytes: 10737418240, // 10 GB
    filesCount: 88,
    createdAt: '2025-11-20T14:10:00Z',
    lastActive: '2026-02-04T18:22:00Z',
  },
  {
    id: 'usr_004',
    name: 'Elena Rostova',
    email: 'elena.rostova@devstudio.io',
    role: 'USER',
    enabled: false,
    usedStorageBytes: 89000000,
    totalStorageBytes: 10737418240,
    filesCount: 6,
    createdAt: '2025-12-05T11:00:00Z',
    lastActive: '2026-01-15T09:00:00Z',
  }
];

export const INITIAL_STORAGE_STATS: SystemStorageStats = {
  totalCapacityBytes: 107374182400, // 100 GB
  usedCapacityBytes: 2713178000,   // ~2.71 GB
  azureStorageBytes: 1650000000,   // ~1.65 GB
  gcpStorageBytes: 1063178000,     // ~1.06 GB
  totalUsersCount: 4,
  activeUsersCount: 3,
  totalFilesCount: 151,
  totalFoldersCount: 24,
};

export const INITIAL_CLOUD_CONFIG: SystemCloudConfig = {
  defaultProvider: 'AZURE',
  azureContainerName: 'cloudsync-user-blobs',
  gcpBucketName: 'cloudsync-prod-storage',
  allowPublicSharing: true,
  maxUploadSizeBytes: 1073741824, // 1 GB
};
