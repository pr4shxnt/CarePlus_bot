export const getApiBase = () => {
  return "https://skkcg1pw-4000.inc1.devtunnels.ms";
};

export const getToken = () => localStorage.getItem("admin_token");
export const setToken = (token: string) => localStorage.setItem("admin_token", token);
export const removeToken = () => localStorage.removeItem("admin_token");

export const getUser = () => {
  const user = localStorage.getItem("admin_user");
  return user ? JSON.parse(user) : null;
};
export const setUser = (user: any) => localStorage.setItem("admin_user", JSON.stringify(user));
export const removeUser = () => localStorage.removeItem("admin_user");

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const base = getApiBase();
  const token = getToken();

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${base}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  return data;
}
