import { Router, Request, Response } from "express";
import { requireAuth } from "@/middleware/auth";
import { db } from "@/config/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.use(requireAuth);

// Get account info
router.get("/account", async (req: Request, res: Response) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, (req.user as any).id),
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

// Update account info
router.put("/account", async (req: Request, res: Response) => {
  try {
    const { firstname, lastname } = req.body;
    const updated = await db
      .update(users)
      .set({ firstname, lastname })
      .where(eq(users.id, (req.user as any).id))
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update account" });
  }
});

export default router;