import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { users, applications, userPermissions, permissions } from "@/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { requirePermission } from "@/middleware/auth";
import bcrypt from "bcrypt";
import { createUserSchema } from "@shared/schemas/users";
import { z } from "zod";
import { generateUsername } from "@/services/generateUsername";

const router = Router();

// Check if email is already taken
router.post(
  "/check-email",
  requirePermission("create_users"),
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email));

      res.json({ available: !existing });
    } catch (error) {
      res.status(500).json({ error: "Failed to check email" });
    }
  },
);

// Create a new user (admin manual upload)
router.post(
  "/",
  requirePermission("create_users"),
  async (req: Request, res: Response) => {
    try {
      const validated = createUserSchema.parse(req.body);
      const { firstname, lastname, email, password, userType, permissionIds } = validated;

      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email));

      if (existingEmail) {
        return res.status(409).json({ error: "Email already in use" });
      }

      const username = await generateUsername(firstname, lastname);

      const hashedPassword = await bcrypt.hash(password, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          email,
          firstname,
          lastname,
          username,
          password: hashedPassword,
          userType,
        })
        .returning();

      await db.insert(applications).values({
        userId: newUser.id,
        userType,
        status: "approved",
        reviewedBy: (req.user as any).id,
        reviewedAt: new Date(),
      });

      if (Array.isArray(permissionIds) && permissionIds.length > 0) {
        const adminId = (req.user as any).id;
        const validPermissions = await db
          .select({ id: permissions.id })
          .from(permissions)
          .where(inArray(permissions.id, permissionIds));

        if (validPermissions.length > 0) {
          await db
            .insert(userPermissions)
            .values(
              validPermissions.map((p) => ({
                userId: newUser.id,
                permissionId: p.id,
                grantedBy: adminId,
              })),
            )
            .onConflictDoNothing();
        }
      }

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        userType: newUser.userType,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        return res.status(400).json({ error: firstIssue?.message || "Validation failed" });
      }
      console.error("Failed to create user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  },
);

// List approved users, optionally filtered by role
router.get(
  "/",
  requirePermission("read_users"),
  async (req: Request, res: Response) => {
    try {
      const { role } = req.query;

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

//get a single user with their permissions
router.get(
  "/:id",
  requirePermission("read_users"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;

      const [user] = await db
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
        .where(eq(users.id, id));

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const permRows = await db
        .select({ permissionId: userPermissions.permissionId })
        .from(userPermissions)
        .where(eq(userPermissions.userId, id));

      const permissionIds = permRows.map((r) => r.permissionId);

      res.json({ ...user, permissionIds });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  },
);

// update user details and permissions
router.put(
  "/:id",
  requirePermission("update_users"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;
      const { firstname, lastname, username, email, userType, permissionIds } =
        req.body;

      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, id));

      if (!existing) {
        return res.status(404).json({ error: "User not found" });
      }

      if (email) {
        const [emailTaken] = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.email, email), sql`${users.id} != ${id}`));
        if (emailTaken) {
          return res.status(409).json({ error: "Email already in use" });
        }
      }

      if (username) {
        const [usernameTaken] = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.username, username), sql`${users.id} != ${id}`));
        if (usernameTaken) {
          return res.status(409).json({ error: "Username already in use" });
        }
      }

      await db
        .update(users)
        .set({
          ...(firstname && { firstname }),
          ...(lastname && { lastname }),
          ...(username && { username }),
          ...(email && { email }),
          ...(userType && { userType }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      if (Array.isArray(permissionIds)) {
        await db.delete(userPermissions).where(eq(userPermissions.userId, id));

        if (permissionIds.length > 0) {
          const adminId = (req.user as any).id;

          const validPermissions = await db
            .select({ id: permissions.id })
            .from(permissions)
            .where(inArray(permissions.id, permissionIds));

          if (validPermissions.length > 0) {
            await db
              .insert(userPermissions)
              .values(
                validPermissions.map((p) => ({
                  userId: id,
                  permissionId: p.id,
                  grantedBy: adminId,
                })),
              )
              .onConflictDoNothing();
          }
        }
      }

      res.json({ message: "User updated" });
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  },
);

//delete a user
router.delete(
  "/:id",
  requirePermission("delete_users"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;
      const adminId = (req.user as any).id;

      // Prevent self-deletion
      if (id === adminId) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own account" });
      }

      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, id));

      if (!existing) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.delete(users).where(eq(users.id, id));

      res.json({ message: "User deleted" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
);

export default router;
