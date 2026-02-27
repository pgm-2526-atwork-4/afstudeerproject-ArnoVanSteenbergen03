import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { updateProfileSchema } from "@shared/schemas/profile";
import { z } from "zod/v4";

const router = Router();

// Get profile info
router.get("/", async (req: Request, res: Response) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, (req.user as any).id),
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update profile info
router.put("/", async (req: Request, res: Response) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const { firstname, lastname, username, email } = validated;
    const userId = (req.user as any).id;

    const existingUsername = await db.query.users.findFirst({
      where: and(eq(users.username, username), ne(users.id, userId)),
    });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const existingEmail = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, userId)),
    });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const updated = await db
      .update(users)
      .set({ firstname, lastname, username, email })
      .where(eq(users.id, userId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
