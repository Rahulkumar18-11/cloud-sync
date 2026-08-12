/**
 * ADMIN PANEL API SERVICE (Role-gated ADMIN)
 * 
 * Target REST Endpoints:
 * - GET    /api/admin/users              -> List all registered users
 * - PUT    /api/admin/users/:id/status   -> Enable/disable user access
 * - DELETE /api/admin/users/:id          -> Delete user account
 * - GET    /api/admin/storage/stats      -> System-wide multi-cloud storage metrics
 * - GET    /api/admin/cloud-config       -> Fetch global cloud provider settings
 * - PUT    /api/admin/cloud-config       -> Update default provider (Azure/GCP toggle)
 * - GET    /api/admin/activities         -> System audit logs
 */

import axiosInstance from './axiosInstance';
import { AdminUser, SystemStorageStats, SystemCloudConfig } from '../types/admin';
import { ActivityLog } from '../types/activity';
import { INITIAL_ADMIN_USERS, INITIAL_STORAGE_STATS, INITIAL_CLOUD_CONFIG, INITIAL_ACTIVITIES } from '../mock/mockData';
import { CloudProvider } from '../types/file';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

let mockAdminUsers = [...INITIAL_ADMIN_USERS];
let mockStorageStats = { ...INITIAL_STORAGE_STATS };
let mockCloudConfig = { ...INITIAL_CLOUD_CONFIG };
let mockActivities = [...INITIAL_ACTIVITIES];

export const adminApi = {
  getUsers: async (): Promise<AdminUser[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockAdminUsers;
    }

    const response = await axiosInstance.get<AdminUser[]>('/admin/users');
    return response.data;
  },

  setUserStatus: async (userId: string, enabled: boolean): Promise<AdminUser> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockAdminUsers = mockAdminUsers.map(u => u.id === userId ? { ...u, enabled } : u);
      return mockAdminUsers.find(u => u.id === userId)!;
    }

    const response = await axiosInstance.put<AdminUser>(`/admin/users/${userId}/status`, { enabled });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      mockAdminUsers = mockAdminUsers.filter(u => u.id !== userId);
      return;
    }

    await axiosInstance.delete(`/admin/users/${userId}`);
  },

  getStorageStats: async (): Promise<SystemStorageStats> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return mockStorageStats;
    }

    const response = await axiosInstance.get<SystemStorageStats>('/admin/storage/stats');
    return response.data;
  },

  getCloudConfig: async (): Promise<SystemCloudConfig> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockCloudConfig;
    }

    const response = await axiosInstance.get<SystemCloudConfig>('/admin/cloud-config');
    return response.data;
  },

  updateDefaultProvider: async (provider: CloudProvider): Promise<SystemCloudConfig> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      mockCloudConfig = { ...mockCloudConfig, defaultProvider: provider };
      
      // Log admin action
      mockActivities.unshift({
        id: `act_${Date.now()}`,
        userId: 'usr_002',
        userName: 'Sarah Connor',
        userEmail: 'admin@cloudsync.io',
        action: 'UPDATE_PROFILE',
        targetName: 'Global Cloud Configuration',
        details: `Switched primary storage provider to ${provider === 'AZURE' ? 'Microsoft Azure' : 'Google Cloud Storage'}`,
        timestamp: new Date().toISOString(),
      });

      return mockCloudConfig;
    }

    const response = await axiosInstance.put<SystemCloudConfig>('/admin/cloud-config', { defaultProvider: provider });
    return response.data;
  },

  getActivityLogs: async (): Promise<ActivityLog[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockActivities;
    }

    const response = await axiosInstance.get<ActivityLog[]>('/admin/activities');
    return response.data;
  }
};
