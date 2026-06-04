import jwt from "jsonwebtoken";
import type { JwtPayload, UserRole } from "../types";

export function signToken(userId: string, email: string, role: UserRole): string {
  return jwt.sign(
    { userId, email, role } as JwtPayload,
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}
