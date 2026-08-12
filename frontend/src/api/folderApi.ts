/**
 * FOLDER MANAGEMENT API SERVICE
 * 
 * Target REST Endpoints:
 * - GET    /api/folders                 -> List folders (by parentId)
 * - POST   /api/folders                 -> Create new folder
 * - DELETE /api/folders/:id             -> Delete folder & nested contents
 * - PUT    /api/folders/:id/rename      -> Rename folder
 * - GET    /api/folders/:id/breadcrumbs -> Get ancestor hierarchy breadcrumbs
 */

import axiosInstance from './axiosInstance';
import { FolderItem, BreadcrumbItem } from '../types/file';
import { INITIAL_FOLDERS } from '../mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

let localMockFolders: FolderItem[] = [...INITIAL_FOLDERS];

export const folderApi = {
  getFolders: async (parentId: string | null = null): Promise<FolderItem[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return localMockFolders.filter(f => f.parentId === parentId);
    }

    const response = await axiosInstance.get<FolderItem[]>('/folders', { params: { parentId } });
    return response.data;
  },

  createFolder: async (name: string, parentId: string | null = null): Promise<FolderItem> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newFolder: FolderItem = {
        id: `fld_${Date.now()}`,
        name,
        parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'usr_001',
        itemsCount: 0,
        sizeBytes: 0,
      };

      localMockFolders = [newFolder, ...localMockFolders];
      return newFolder;
    }

    const response = await axiosInstance.post<FolderItem>('/folders', { name, parentId });
    return response.data;
  },

  deleteFolder: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localMockFolders = localMockFolders.filter(f => f.id !== id && f.parentId !== id);
      return;
    }

    await axiosInstance.delete(`/folders/${id}`);
  },

  getBreadcrumbs: async (folderId: string | null): Promise<BreadcrumbItem[]> => {
    const rootBreadcrumb: BreadcrumbItem = { id: null, name: 'All Files' };
    if (!folderId) return [rootBreadcrumb];

    if (USE_MOCK) {
      const trail: BreadcrumbItem[] = [];
      let currentId: string | null = folderId;

      while (currentId) {
        const found = localMockFolders.find(f => f.id === currentId);
        if (found) {
          trail.unshift({ id: found.id, name: found.name });
          currentId = found.parentId;
        } else {
          break;
        }
      }

      return [rootBreadcrumb, ...trail];
    }

    const response = await axiosInstance.get<BreadcrumbItem[]>(`/folders/${folderId}/breadcrumbs`);
    return response.data;
  }
};
