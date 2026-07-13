import { StorageService } from './storage.service';

const BASE_URL = 'https://q4n8mbr4-4000.inc1.devtunnels.ms/api';

export const request = async (endpoint: string, options: any = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Auto-attach stored JWT token
  const token = await StorageService.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
};
