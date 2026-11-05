import axiosInstance from './axiosInstance';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { storage } from '../utils/storage';

interface ApiUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface ApiToken {
  access_token: string;
  token_type: string;
}

function mapUser(user: ApiUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'USER',
    createdAt: user.created_at,
  };
}

async function fetchCurrentUser(): Promise<User> {
  const response = await axiosInstance.get<ApiUser>('/auth/me');
  const user = mapUser(response.data);
  storage.setUser(user);
  return user;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiToken>('/auth/login', credentials);
    storage.setToken(response.data.access_token);

    try {
      const user = await fetchCurrentUser();
      return { token: response.data.access_token, user };
    } catch (error) {
      storage.clearAuth();
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    await axiosInstance.post<ApiUser>('/auth/register', credentials);
    return authApi.login({
      email: credentials.email,
      password: credentials.password,
    });
  },

  getCurrentUser: fetchCurrentUser,

  logout: async (): Promise<void> => {
    // JWTs are stateless in this MVP; removing the token signs the user out locally.
    storage.clearAuth();
  },
};
