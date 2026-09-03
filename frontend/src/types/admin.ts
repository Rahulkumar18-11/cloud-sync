import { CloudProvider } from './file';
import { UserRole } from './auth';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  usedStorageBytes: number;
  totalStorageBytes: number;
  filesCount: number;
  createdAt: string;
  lastActive: string;
}

export interface SystemStorageStats {
  totalCapacityBytes: number;
  usedCapacityBytes: number;
  azureStorageBytes: number;
  gcpStorageBytes: number;
  totalUsersCount: number;
  activeUsersCount: number;
  totalFilesCount: number;
  totalFoldersCount: number;
}

export interface SystemCloudConfig {
  defaultProvider: CloudProvider;
  azureContainerName: string;
  gcpBucketName: string;
  allowPublicSharing: boolean;
  maxUploadSizeBytes: number;
}
