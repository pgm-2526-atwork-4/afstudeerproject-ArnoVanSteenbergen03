import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { db } from "@/config/database";
import { users, applications, userPermissions, permissions } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/middleware/auth";
import { registerApiSchema, loginSchema } from "@shared/schemas/auth";
import { z } from "zod/v4";
import { generateUsername } from "@/services/generateUsername";

const router = Router();

function getSessionCookieSettings() {
  const frontendOrigins = process.env.FRONTEND_URL ?? "";
  const sessionCookieDomain = process.env.SESSION_COOKIE_DOMAIN;
  const firstOrigin = frontendOrigins
    .split(",")
    .map((origin) => origin.trim())
    .find(Boolean);

  let secure = process.env.NODE_ENV === "production";
  if (firstOrigin) {
    try {
      secure = new URL(firstOrigin).protocol === "https:";
    } catch {
      // Keep fallback value when FRONTEND_URL is malformed.
    }
  }

  const sameSite: "lax" | "none" = secure ? "none" : "lax";

  return {
    secure,
    sameSite,
    ...(sessionCookieDomain ? { domain: sessionCookieDomain } : {}),
  };
}

router.get("/", requireAuth, (req, res) => {
  res.json({ ok: true });
});

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const validated = registerApiSchema.parse(req.body);
    const { email, firstname, lastname, password, userType } = validated;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
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
      status: "pending",
    });

    req.login(newUser, (err: any) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }

      req.session.save((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ error: "Session save failed" });
        }

        res.status(201).json({
          message: "Registration successful — awaiting admin approval",
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            userType: newUser.userType,
            isApproved: false,
          },
        });
      });
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }
  }

  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.login(user, async (loginErr: any) => {
      if (loginErr) {
        return res.status(500).json({ error: "Login failed" });
      }

      // Compute isApproved from applications table
      const approvedApp = await db.query.applications.findFirst({
        where: and(
          eq(applications.userId, user.id),
          eq(applications.status, "approved"),
        ),
      });

      req.session.save((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ error: "Session save failed" });
        }

        res.status(200).json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            userType: user.userType,
            profileImage: user.profileImage,
            isApproved: user.userType === "admin" || !!approvedApp,
          },
        });
      });
    });
  })(req, res, next);
});

// Get current user with permissions
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.user.id;

  const fullUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!fullUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // Fetch user's permission keys
  const permRows = await db
    .select({ key: permissions.key })
    .from(userPermissions)
    .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
    .where(eq(userPermissions.userId, userId));

  const permissionKeys = permRows.map((r) => r.key);

  // Compute isApproved from applications table
  const approvedApp = await db.query.applications.findFirst({
    where: and(
      eq(applications.userId, userId),
      eq(applications.status, "approved"),
    ),
  });

  const isApproved = fullUser.userType === "admin" || !!approvedApp;

  res.json({
    id: fullUser.id,
    email: fullUser.email,
    username: fullUser.username,
    firstname: fullUser.firstname,
    lastname: fullUser.lastname,
    userType: fullUser.userType,
    profileImage: fullUser.profileImage,
    isApproved,
    permissions: permissionKeys,
  });
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    const sessionCookieSettings = getSessionCookieSettings();

    // Session is automatically destroyed by passport.logout()
    // Clear cookies just to be safe
    res.clearCookie("connect.sid", {
      httpOnly: true,
      ...sessionCookieSettings,
    });

    res.json({ message: "Logged out successfully" });
  });
});

export default router;
