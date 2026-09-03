/**
 * AUTHENTICATION API SERVICE
 * 
 * Target REST Endpoints:
 * - POST /api/auth/login     -> Login user & receive JWT token
 * - POST /api/auth/register  -> Register a new user
 * - GET  /api/auth/me        -> Get current authenticated user profile
 * - POST /api/auth/logout    -> Logout user / invalidate session
 */

import axiosInstance from './axiosInstance';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { MOCK_CURRENT_USER, MOCK_ADMIN_USER } from '../mock/mockData';
import { storage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate latency
      
      const isAdmin = credentials.email.toLowerCase().includes('admin');
      const user = isAdmin ? MOCK_ADMIN_USER : { ...MOCK_CURRENT_USER, email: credentials.email };
      const token = `mock_jwt_token_${Date.now()}_${user.id}`;
      
      storage.setToken(token);
      storage.setUser(user);
      
      return { token, user };
    }

    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      storage.setToken(response.data.token);
      storage.setUser(response.data.user);
    }
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      
      const user: User = {
        id: `usr_${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
        role: 'USER',
        createdAt: new Date().toISOString(),
      };
      const token = `mock_jwt_token_${Date.now()}_${user.id}`;
      
      storage.setToken(token);
      storage.setUser(user);
      
      return { token, user };
    }

    const response = await axiosInstance.post<AuthResponse>('/auth/register', credentials);
    if (response.data.token) {
      storage.setToken(response.data.token);
      storage.setUser(response.data.user);
    }
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK) {
      const storedUser = storage.getUser<User>();
      return storedUser || MOCK_CURRENT_USER;
    }

    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    if (!USE_MOCK) {
      try {
        await axiosInstance.post('/auth/logout');
      } catch (err) {
        console.warn('Logout endpoint call failed, clearing local storage', err);
      }
    }
    storage.clearAuth();
  }
};
