export type CloudProvider = 'AZURE' | 'GCP';

export type FileType = 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'presentation' | 'code' | 'archive' | 'audio' | 'video' | 'other';

export type ViewMode = 'grid' | 'list';

export interface FileVersion {
  id: string;
  versionNumber: number;
  sizeBytes: number;
  createdAt: string;
  createdBy: string;
  downloadUrl?: string;
  isCurrent: boolean;
  notes?: string;
}

export interface FileItem {
  id: string;
  name: string;
  folderId: string | null;
  sizeBytes: number;
  fileType: FileType;
  extension: string;
  mimeType: string;
  provider: CloudProvider;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
  downloadUrl?: string;
  versionsCount: number;
  currentVersionId?: string;
  isShared?: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  itemsCount: number;
  sizeBytes: number;
}

export type SharePermission = 'VIEW' | 'DOWNLOAD';

export interface ShareLink {
  id: string;
  fileId: string;
  fileName: string;
  token: string;
  shareableUrl: string;
  permission: SharePermission;
  createdAt: string;
  expiresAt: string | null;
  viewsCount: number;
  downloadsCount: number;
}

export interface UploadProgressItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  provider: CloudProvider;
  error?: string;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}
