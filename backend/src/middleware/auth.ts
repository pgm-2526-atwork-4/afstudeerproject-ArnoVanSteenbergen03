import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "@/config/database";
import { userPermissions, permissions } from "@/db/schema";
import "@/types";

// Checks if the user is logged in
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Checks if the user account has been approved by an admin
export const requireApproved = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!(req.user as any).isApproved) {
    return res.status(403).json({ error: "Account pending approval by admin" });
  }
  next();
};

// Checks if the user has a specific permission
export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    const rows = await db
      .select({ key: permissions.key })
      .from(userPermissions)
      .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
      .where(eq(userPermissions.userId, userId));

    const userPerms = new Set(rows.map((r) => r.key));

    if (!userPerms.has(permissionKey)) {
      return res
        .status(403)
        .json({ error: "Forbidden", missing: permissionKey });
    }

    next();
  };
}

// Checks if the user has ALL of the listed permissions
export function requirePermissions(...permissionKeys: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    const rows = await db
      .select({ key: permissions.key })
      .from(userPermissions)
      .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
      .where(eq(userPermissions.userId, userId));

    const userPerms = new Set(rows.map((r) => r.key));
    const missing = permissionKeys.filter((k) => !userPerms.has(k));

    if (missing.length > 0) {
      return res.status(403).json({ error: "Forbidden", missing });
    }

    next();
  };
}
