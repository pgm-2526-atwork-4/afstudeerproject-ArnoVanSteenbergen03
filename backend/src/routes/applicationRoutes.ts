import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { applications, users, userPermissions, permissions } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { requirePermission } from "@/middleware/auth";

const router = Router();

// List all available permissions
router.get(
  "/permissions",
  requirePermission("read_applications"),
  async (req: Request, res: Response) => {
    try {
      const rows = await db
        .select({
          id: permissions.id,
          resource: permissions.resource,
          action: permissions.action,
          key: permissions.key,
          description: permissions.description,
        })
        .from(permissions)
        .orderBy(permissions.resource, permissions.action);

      res.json(rows);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  },
);

// List all applications
router.get(
  "/",
  requirePermission("read_applications"),
  async (req: Request, res: Response) => {
    try {
      const rows = await db
        .select({
          id: applications.id,
          userId: applications.userId,
          userType: applications.userType,
          status: applications.status,
          denialReason: applications.denialReason,
          createdAt: applications.createdAt,
          reviewedAt: applications.reviewedAt,
          firstname: users.firstname,
          lastname: users.lastname,
          email: users.email,
          username: users.username,
        })
        .from(applications)
        .innerJoin(users, eq(applications.userId, users.id))
        .orderBy(applications.createdAt);

      res.json(rows);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  },
);

// Count pending applications
router.get(
  "/count",
  requirePermission("read_applications"),
  async (req: Request, res: Response) => {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(eq(applications.status, "pending"));

      res.json({ count: result.count });
    } catch (error) {
      console.error("Failed to count applications:", error);
      res.status(500).json({ error: "Failed to count applications" });
    }
  },
);

// Approve application
router.post(
  "/:id/approve",
  requirePermission("update_applications"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const reviewerId = (req.user as any).id;
      const { permissionIds } = req.body as { permissionIds?: number[] };

      const [application] = await db
        .select()
        .from(applications)
        .where(eq(applications.id, id));

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.status !== "pending") {
        return res.status(400).json({ error: "Application already reviewed" });
      }

      await db
        .update(applications)
        .set({
          status: "approved",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        })
        .where(eq(applications.id, id));

      if (permissionIds && permissionIds.length > 0) {
        const validPermissions = await db
          .select({ id: permissions.id })
          .from(permissions)
          .where(inArray(permissions.id, permissionIds));

        if (validPermissions.length > 0) {
          await db
            .insert(userPermissions)
            .values(
              validPermissions.map((p) => ({
                userId: application.userId,
                permissionId: p.id,
                grantedBy: reviewerId,
              })),
            )
            .onConflictDoNothing();
        }
      }

      res.json({ message: "Application approved" });
    } catch (error) {
      console.error("Failed to approve application:", error);
      res.status(500).json({ error: "Failed to approve application" });
    }
  },
);

// Deny application
router.post(
  "/:id/deny",
  requirePermission("update_applications"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const reviewerId = (req.user as any).id;

      const [application] = await db
        .select()
        .from(applications)
        .where(eq(applications.id, id));

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.status !== "pending") {
        return res.status(400).json({ error: "Application already reviewed" });
      }

      await db
        .update(applications)
        .set({
          status: "denied",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          denialReason: reason || null,
        })
        .where(eq(applications.id, id));

      res.json({ message: "Application denied" });
    } catch (error) {
      console.error("Failed to deny application:", error);
      res.status(500).json({ error: "Failed to deny application" });
    }
  },
);

export default router;
