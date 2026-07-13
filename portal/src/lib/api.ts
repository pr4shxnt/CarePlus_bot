export const getApiBase = () => {
  return import.meta.env.VITE_API_BASE || "https://q4n8mbr4-4000.inc1.devtunnels.ms";
};

export const getToken = () => localStorage.getItem("portal_token");
export const setToken = (token: string) => localStorage.setItem("portal_token", token);
export const removeToken = () => localStorage.removeItem("portal_token");

export const getUser = () => {
  const user = localStorage.getItem("portal_user");
  return user ? JSON.parse(user) : null;
};
export const setUser = (user: any) => localStorage.setItem("portal_user", JSON.stringify(user));
export const removeUser = () => localStorage.removeItem("portal_user");

// Lazy load mock data handler to prevent circular references
let getMockFallback: any = null;

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

  try {
    const response = await fetch(`${base}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (response.status === 401) {
      if (endpoint !== "/api/auth/login") {
        removeToken();
        removeUser();
        window.location.href = "/login";
      }
      throw new Error(data.error || "Session expired. Please log in again.");
    }
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    if (endpoint.startsWith("/api/")) {
      throw error;
    }

    console.warn(`Fetch to ${endpoint} failed. Attempting mock database fallback.`, error);
    
    // Resolve mock data fallback
    if (!getMockFallback) {
      try {
        const mockModule = await import("./mockData");
        getMockFallback = mockModule.getMockDataFallback;
      } catch (mockError) {
        console.error("Failed to load mock data repository", mockError);
        throw error;
      }
    }
    
    return getMockFallback(endpoint, options);
  }
}

