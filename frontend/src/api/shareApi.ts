/**
 * FILE SHARING API SERVICE
 * 
 * Target REST Endpoints:
 * - POST   /api/shares          -> Create a secure share link for a file
 * - GET    /api/shares/:token   -> Fetch public metadata for a shared file
 * - DELETE /api/shares/:id      -> Revoke a share link
 */

import axiosInstance from './axiosInstance';
import { ShareLink, SharePermission, FileItem } from '../types/file';
import { INITIAL_SHARE_LINKS, INITIAL_FILES } from '../mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

let localMockShareLinks: ShareLink[] = [...INITIAL_SHARE_LINKS];

export const shareApi = {
  createShareLink: async (fileId: string, fileName: string, permission: SharePermission = 'DOWNLOAD', expiryDays?: number): Promise<ShareLink> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const token = `cs_share_${Math.random().toString(36).substring(2, 9)}`;
      
      let expiresAt: string | null = null;
      if (expiryDays && expiryDays > 0) {
        const date = new Date();
        date.setDate(date.getDate() + expiryDays);
        expiresAt = date.toISOString();
      }

      const newShare: ShareLink = {
        id: `sh_${Date.now()}`,
        fileId,
        fileName,
        token,
        shareableUrl: `${window.location.origin}/shared/${token}`,
        permission,
        createdAt: new Date().toISOString(),
        expiresAt,
        viewsCount: 0,
        downloadsCount: 0,
      };

      localMockShareLinks = [newShare, ...localMockShareLinks];
      return newShare;
    }

    const response = await axiosInstance.post<ShareLink>('/shares', {
      fileId,
      permission,
      expiryDays,
    });
    return response.data;
  },

  getSharedFileByToken: async (token: string): Promise<{ shareLink: ShareLink; file: FileItem }> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const link = localMockShareLinks.find(s => s.token === token);
      
      if (!link) {
        throw new Error('Shared link not found or expired');
      }

      const file = INITIAL_FILES.find(f => f.id === link.fileId) || {
        id: link.fileId,
        name: link.fileName,
        folderId: null,
        sizeBytes: 4250000,
        fileType: 'pdf',
        extension: 'pdf',
        mimeType: 'application/pdf',
        provider: 'AZURE',
        createdAt: link.createdAt,
        updatedAt: link.createdAt,
        ownerId: 'usr_001',
        ownerName: 'Alex Rivera',
        versionsCount: 1,
        isShared: true,
      };

      return { shareLink: link, file: file as FileItem };
    }

    const response = await axiosInstance.get<{ shareLink: ShareLink; file: FileItem }>(`/shares/${token}`);
    return response.data;
  },

  revokeShareLink: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localMockShareLinks = localMockShareLinks.filter(s => s.id !== id);
      return;
    }

    await axiosInstance.delete(`/shares/${id}`);
  }
};
