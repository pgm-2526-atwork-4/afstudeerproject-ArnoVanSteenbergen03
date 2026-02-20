import { Request, Response, NextFunction } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@/config/database";
import { roles, userRoles } from "@/db/schema";
import "@/types";

// checks if the user is logged in
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


export function requireRoles(allowed: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const rows = await db
      .select({ roleName: roles.roleName })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const userRoleSet = new Set(rows.map((r) => r.roleName));
    const ok = allowed.some((r) => userRoleSet.has(r));

    if (!ok) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
