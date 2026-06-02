import { request } from './api';
import { StorageService } from './storage.service';

export const AuthService = {
  login: async (email: string, password: string) => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Persist token and user so all subsequent requests are authenticated
    if (result?.data?.token) {
      await StorageService.setToken(result.data.token);
    }
    if (result?.data?.user) {
      await StorageService.setUser(result.data.user);
    }

    return result;
  },

  logout: async () => {
    await StorageService.clear();
  },

  register: async (userData: any) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return request('/auth/me', { method: 'GET' });
  },
};
