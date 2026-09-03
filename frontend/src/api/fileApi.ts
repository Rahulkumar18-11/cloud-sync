/**
 * FILE MANAGEMENT API SERVICE
 * 
 * Target REST Endpoints:
 * - GET    /api/files                        -> List files (query params: folderId, search, fileType, provider)
 * - POST   /api/files/upload                 -> Upload file (multipart/form-data with file, folderId, provider)
 * - GET    /api/files/:id/download           -> Download file / get download presigned URL
 * - DELETE /api/files/:id                    -> Delete file metadata & cloud blob
 * - PUT    /api/files/:id/rename             -> Rename file
 * - PUT    /api/files/:id/move               -> Move file to target folder
 * - GET    /api/files/:id/versions           -> Get version history for file
 * - POST   /api/files/:id/versions/:vId/restore -> Restore specified version
 */

import axiosInstance from './axiosInstance';
import { FileItem, FileVersion, CloudProvider, FileType } from '../types/file';
import { INITIAL_FILES, MOCK_FILE_VERSIONS } from '../mock/mockData';
import { getFileTypeFromExtension } from '../utils/formatters';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

// State store for mock items
let localMockFiles: FileItem[] = [...INITIAL_FILES];

export const fileApi = {
  getFiles: async (params?: { folderId?: string | null; search?: string; fileType?: FileType | 'all'; provider?: CloudProvider | 'all' }): Promise<FileItem[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let files = [...localMockFiles];

      if (params?.folderId !== undefined) {
        files = files.filter(f => f.folderId === params.folderId);
      }

      if (params?.search) {
        const query = params.search.toLowerCase();
        files = files.filter(f => f.name.toLowerCase().includes(query));
      }

      if (params?.fileType && params.fileType !== 'all') {
        files = files.filter(f => f.fileType === params.fileType);
      }

      if (params?.provider && params.provider !== 'all') {
        files = files.filter(f => f.provider === params.provider);
      }

      return files;
    }

    const response = await axiosInstance.get<FileItem[]>('/files', { params });
    return response.data;
  },

  uploadFile: async (file: File, folderId: string | null = null, provider: CloudProvider = 'AZURE', onProgress?: (percent: number) => void): Promise<FileItem> => {
    if (USE_MOCK) {
      // Simulate progress ticks
      for (let p = 10; p <= 100; p += 20) {
        await new Promise((res) => setTimeout(res, 120));
        if (onProgress) onProgress(p);
      }

      const ext = file.name.split('.').pop() || '';
      const newFile: FileItem = {
        id: `fil_${Date.now()}`,
        name: file.name,
        folderId: folderId,
        sizeBytes: file.size || 2500000,
        fileType: getFileTypeFromExtension(ext),
        extension: ext,
        mimeType: file.type || 'application/octet-stream',
        provider: provider,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'usr_001',
        ownerName: 'Alex Rivera',
        versionsCount: 1,
        currentVersionId: `ver_${Date.now()}_v1`,
        isShared: false,
      };

      localMockFiles = [newFile, ...localMockFiles];
      return newFile;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    formData.append('provider', provider);

    const response = await axiosInstance.post<FileItem>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localMockFiles = localMockFiles.filter(f => f.id !== id);
      return;
    }

    await axiosInstance.delete(`/files/${id}`);
  },

  renameFile: async (id: string, newName: string): Promise<FileItem> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      localMockFiles = localMockFiles.map(f => {
        if (f.id === id) {
          const ext = newName.split('.').pop() || f.extension;
          return {
            ...f,
            name: newName,
            extension: ext,
            fileType: getFileTypeFromExtension(ext),
            updatedAt: new Date().toISOString(),
          };
        }
        return f;
      });
      const updated = localMockFiles.find(f => f.id === id)!;
      return updated;
    }

    const response = await axiosInstance.put<FileItem>(`/files/${id}/rename`, { name: newName });
    return response.data;
  },

  moveFile: async (id: string, targetFolderId: string | null): Promise<FileItem> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      localMockFiles = localMockFiles.map(f => f.id === id ? { ...f, folderId: targetFolderId, updatedAt: new Date().toISOString() } : f);
      return localMockFiles.find(f => f.id === id)!;
    }

    const response = await axiosInstance.put<FileItem>(`/files/${id}/move`, { folderId: targetFolderId });
    return response.data;
  },

  downloadFile: async (id: string, fileName: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      // Create dummy blob for download simulation
      const blob = new Blob([`Simulated CloudSync Content for file: ${fileName}`], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return;
    }

    const response = await axiosInstance.get(`/files/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getFileVersions: async (fileId: string): Promise<FileVersion[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return MOCK_FILE_VERSIONS[fileId] || [
        {
          id: `ver_${fileId}_v1`,
          versionNumber: 1,
          sizeBytes: 2500000,
          createdAt: new Date().toISOString(),
          createdBy: 'Alex Rivera',
          isCurrent: true,
          notes: 'Original upload version'
        }
      ];
    }

    const response = await axiosInstance.get<FileVersion[]>(`/files/${fileId}/versions`);
    return response.data;
  },

  restoreVersion: async (fileId: string, versionId: string): Promise<FileItem> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      localMockFiles = localMockFiles.map(f => {
        if (f.id === fileId) {
          return { ...f, currentVersionId: versionId, updatedAt: new Date().toISOString() };
        }
        return f;
      });
      return localMockFiles.find(f => f.id === fileId)!;
    }

    const response = await axiosInstance.post<FileItem>(`/files/${fileId}/versions/${versionId}/restore`);
    return response.data;
  }
};
