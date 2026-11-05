import axiosInstance from './axiosInstance';
import { FileItem, ShareLink } from '../types/file';
import { getFileTypeFromExtension } from '../utils/formatters';

interface ApiShare {
  token: string;
  share_path: string;
  expires_at: string | null;
}

interface ApiSharedFile {
  original_name: string;
  content_type: string;
  size_bytes: number;
  storage_backend: string;
  expires_at: string | null;
}

function buildShareLink(token: string, fileId: string, fileName: string, expiresAt: string | null): ShareLink {
  const publicAppUrl = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
  const normalizedAppUrl = publicAppUrl.endsWith('/')
    ? publicAppUrl.slice(0, -1)
    : publicAppUrl;

  return {
    id: token,
    fileId,
    fileName,
    token,
    shareableUrl: `${normalizedAppUrl}/shared/${token}`,
    permission: 'DOWNLOAD',
    createdAt: new Date().toISOString(),
    expiresAt,
    viewsCount: 0,
    downloadsCount: 0,
  };
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const shareApi = {
  createShareLink: async (
    fileId: string,
    fileName: string,
    _permission: 'VIEW' | 'DOWNLOAD' = 'DOWNLOAD',
    expiryDays = 7,
  ): Promise<ShareLink> => {
    const expiresInHours = expiryDays > 0 ? expiryDays * 24 : null;
    const response = await axiosInstance.post<ApiShare>(`/files/${fileId}/share`, {
      expires_in_hours: expiresInHours,
    });

    return buildShareLink(
      response.data.token,
      fileId,
      fileName,
      response.data.expires_at,
    );
  },

  getSharedFileByToken: async (token: string): Promise<{ shareLink: ShareLink; file: FileItem }> => {
    const response = await axiosInstance.get<ApiSharedFile>(`/shares/${token}`);
    const data = response.data;
    const parts = data.original_name.split('.');
    const extension = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    const now = new Date().toISOString();

    const file: FileItem = {
      id: token,
      name: data.original_name,
      folderId: null,
      sizeBytes: data.size_bytes,
      fileType: getFileTypeFromExtension(extension),
      extension,
      mimeType: data.content_type,
      provider: data.storage_backend === 's3' ? 'AWS_S3' : 'LOCAL',
      createdAt: now,
      updatedAt: now,
      ownerId: '',
      ownerName: 'CloudSync user',
      versionsCount: 1,
      isShared: true,
    };

    return {
      shareLink: buildShareLink(token, file.id, file.name, data.expires_at),
      file,
    };
  },

  downloadSharedFile: async (token: string, fileName: string): Promise<void> => {
    const response = await axiosInstance.get<Blob>(`/shares/${token}/download`, {
      responseType: 'blob',
    });
    saveBlob(response.data, fileName);
  },

  revokeShareLink: async (_id: string): Promise<void> => {
    throw new Error('Revoking share links is not available in this MVP yet.');
  },
};
