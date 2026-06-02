import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'careplus_token';
const USER_KEY = 'careplus_user';

export const StorageService = {
  setToken: (token: string) => AsyncStorage.setItem(TOKEN_KEY, token),
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  removeToken: () => AsyncStorage.removeItem(TOKEN_KEY),

  setUser: (user: object) => AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: async () => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  removeUser: () => AsyncStorage.removeItem(USER_KEY),

  clear: async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  },
};
