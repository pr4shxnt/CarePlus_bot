import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, UserRole } from "../types";

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "No token provided." });
    return;
  }

  const token = header.slice(7);
  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Token invalid or expired." });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthenticated." });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: `Access denied. Required role: ${roles.join(" or ")}.` });
      return;
    }
    next();
  };
}

// Bot-to-server API key authentication (different from JWT)
export function authenticateBot(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers["x-bot-api-key"];
  if (!apiKey || apiKey !== process.env.BOT_API_KEY) {
    res.status(401).json({ success: false, error: "Invalid bot API key." });
    return;
  }
  next();
}
