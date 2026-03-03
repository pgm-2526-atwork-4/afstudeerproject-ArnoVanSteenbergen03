import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { users, applications } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requirePermission } from "@/middleware/auth";

const router = Router();

// List approved users, optionally filtered by role
// Approved = admin users OR users with an approved application
router.get(
  "/",
  requirePermission("read_users"),
  async (req: Request, res: Response) => {
    try {
      const { role } = req.query;

      // Subquery: user IDs with an approved application
      const approvedUserIds = db
        .select({ userId: applications.userId })
        .from(applications)
        .where(eq(applications.status, "approved"));

      const conditions = [
        sql`(${users.userType} = 'admin' OR ${users.id} IN (${approvedUserIds}))`,
      ];

      if (role && typeof role === "string") {
        conditions.push(sql`${users.userType} = ${role}`);
      }

      const rows = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          firstname: users.firstname,
          lastname: users.lastname,
          userType: users.userType,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(and(...conditions))
        .orderBy(users.createdAt);

      res.json(rows);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },
);

export default router;
