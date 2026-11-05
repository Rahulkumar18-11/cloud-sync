import axiosInstance from './axiosInstance';
import { FileItem, FileVersion, CloudProvider, FileType } from '../types/file';
import { getFileTypeFromExtension } from '../utils/formatters';

interface ApiFile {
  id: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  storage_backend: string;
  owner_id: string;
  created_at: string;
}

function mapFile(file: ApiFile): FileItem {
  const nameParts = file.original_name.split('.');
  const extension = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
  const createdAt = file.created_at;

  return {
    id: file.id,
    name: file.original_name,
    folderId: null,
    sizeBytes: file.size_bytes,
    fileType: getFileTypeFromExtension(extension),
    extension,
    mimeType: file.content_type,
    provider: file.storage_backend === 's3' ? 'AWS_S3' : 'LOCAL',
    createdAt,
    updatedAt: createdAt,
    ownerId: file.owner_id,
    ownerName: 'You',
    versionsCount: 1,
    isShared: false,
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

export const fileApi = {
  getFiles: async (params?: {
    folderId?: string | null;
    search?: string;
    fileType?: FileType | 'all';
    provider?: CloudProvider | 'all';
  }): Promise<FileItem[]> => {
    const response = await axiosInstance.get<ApiFile[]>('/files');
    let files = response.data.map(mapFile);

    if (params?.search) {
      const query = params.search.toLowerCase();
      files = files.filter((file) => file.name.toLowerCase().includes(query));
    }
    if (params?.fileType && params.fileType !== 'all') {
      files = files.filter((file) => file.fileType === params.fileType);
    }
    if (params?.provider && params.provider !== 'all') {
      files = files.filter((file) => file.provider === params.provider);
    }

    return files;
  },

  uploadFile: async (
    file: File,
    _folderId: string | null = null,
    _provider: CloudProvider = 'LOCAL',
    onProgress?: (percent: number) => void,
  ): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ApiFile>('/files', formData, {
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });

    return mapFile(response.data);
  },

  deleteFile: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/files/${id}`);
  },

  renameFile: async (_id: string, _newName: string): Promise<FileItem> => {
    throw new Error('Renaming files is not available in this MVP yet.');
  },

  moveFile: async (_id: string, _targetFolderId: string | null): Promise<FileItem> => {
    throw new Error('Folders are not available in this MVP yet.');
  },

  downloadFile: async (id: string, fileName: string): Promise<void> => {
    const response = await axiosInstance.get<Blob>(`/files/${id}/download`, {
      responseType: 'blob',
    });
    saveBlob(response.data, fileName);
  },

  // Version history is outside the current MVP; retain these exports for legacy components.
  getFileVersions: async (_fileId: string): Promise<FileVersion[]> => [],
  restoreVersion: async (_fileId: string, _versionId: string): Promise<FileItem> => {
    throw new Error('File version history is not available in this MVP.');
  },
};
