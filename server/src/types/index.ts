// Shared TypeScript types across the server

export type UserRole = "doctor" | "guardian" | "patient" | "admin";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, ...(message && { message }) };
}

export function fail(error: string, status = 400): { status: number; body: ApiResponse } {
  return { status, body: { success: false, error } };
}
