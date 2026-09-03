export interface StorageQuota {
  usedBytes: number;
  totalBytes: number;
  azureUsedBytes: number;
  gcpUsedBytes: number;
  filesCount: number;
  foldersCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
  storageQuota: StorageQuota;
}

export interface ProfileUpdateRequest {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface PasswordChangeRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
