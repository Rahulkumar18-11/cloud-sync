/**
 * USER PROFILE API SERVICE
 * 
 * Target REST Endpoints:
 * - GET /api/user/profile       -> Get profile details
 * - PUT /api/user/profile       -> Update profile name, email, avatar
 * - PUT /api/user/password      -> Change account password
 * - GET /api/user/storage       -> Get user storage quota metrics
 */

import axiosInstance from './axiosInstance';
import { UserProfile, ProfileUpdateRequest, PasswordChangeRequest, StorageQuota } from '../types/user';
import { MOCK_CURRENT_USER } from '../mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

let mockProfile: UserProfile = {
  id: MOCK_CURRENT_USER.id,
  name: MOCK_CURRENT_USER.name,
  email: MOCK_CURRENT_USER.email,
  role: MOCK_CURRENT_USER.role,
  avatarUrl: MOCK_CURRENT_USER.avatarUrl,
  createdAt: MOCK_CURRENT_USER.createdAt,
  lastLogin: new Date().toISOString(),
  storageQuota: {
    usedBytes: 254890000,
    totalBytes: 10737418240, // 10 GB
    azureUsedBytes: 160000000,
    gcpUsedBytes: 94890000,
    filesCount: 7,
    foldersCount: 4,
  }
};

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return mockProfile;
    }

    const response = await axiosInstance.get<UserProfile>('/user/profile');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateRequest): Promise<UserProfile> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      mockProfile = {
        ...mockProfile,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || mockProfile.avatarUrl,
      };
      return mockProfile;
    }

    const response = await axiosInstance.put<UserProfile>('/user/profile', data);
    return response.data;
  },

  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (!data.newPassword || data.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      return;
    }

    await axiosInstance.put('/user/password', data);
  },

  getStorageQuota: async (): Promise<StorageQuota> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockProfile.storageQuota;
    }

    const response = await axiosInstance.get<StorageQuota>('/user/storage');
    return response.data;
  }
};
