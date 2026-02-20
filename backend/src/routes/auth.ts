import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { db } from "@/config/database";
import { userRoles, users, roles } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.json({ ok: true });
});

router.post(
  "/",
  requireAuth,
  requireRoles(["provider", "admin"]),
  (req, res) => {
    res.json({ ok: true });
  },
);

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, firstname, lastname, password, role } = req.body;

    if (!email || !firstname || !lastname || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Auto-generate username from first + last name
    let username = `${firstname}${lastname}`.toLowerCase();
    let counter = 1;
    
    // Check if username already exists, add number if it does
    while (await db.query.users.findFirst({
      where: eq(users.username, username),
    })) {
      username = `${firstname}${lastname}${counter}`.toLowerCase();
      counter++;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db
      .insert(users)
      .values({
        email,
        firstname,
        lastname,
        username,
        password: hashedPassword,
      })
      .returning();

    // Assign role
    const roleRecord = await db.query.roles.findFirst({
      where: eq(roles.roleName, role),
    });

    if (!roleRecord) {
      return res.status(400).json({ error: "Invalid role" });
    }

    await db.insert(userRoles).values({
      userId: newUser[0].id,
      roleId: roleRecord.id,
    });

    req.login(newUser[0], (err: any) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      res.status(201).json({
        message: "Registration successful",
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          username: newUser[0].username,
        },
      });
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.login(user, (loginErr: any) => {
      if (loginErr) {
        return res.status(500).json({ error: "Login failed" });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

// Get current user
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = req.user as any;

  const fullUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  const userRoleRecords = await db
    .select({ roleName: roles.roleName })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user.id));

  res.json({
    id: fullUser!.id,
    email: fullUser!.email,
    username: fullUser!.username,
    firstname: fullUser!.firstname,
    lastname: fullUser!.lastname,
    roles: userRoleRecords.map((r) => r.roleName),
  });
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
