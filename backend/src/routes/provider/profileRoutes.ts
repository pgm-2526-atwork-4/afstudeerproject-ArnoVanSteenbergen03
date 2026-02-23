import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    const { firstname, lastname, username, email } = req.body;
    const updated = await db
      .update(users)
      .set({ firstname, lastname, username, email })
      .where(eq(users.id, (req.user as any).id))
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;