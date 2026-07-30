/**
 * JWT auth middleware: verifies Bearer tokens and enforces admin role.
 */
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/** Authenticated principal attached to protected requests. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

/** Requires a valid JWT and sets `req.user`. */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: "JWT secret is not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = {
      id: decoded.id,
      name: decoded.name || decoded.email.split("@")[0],
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Allows only users with role `admin` (use after `authenticate`). */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}
