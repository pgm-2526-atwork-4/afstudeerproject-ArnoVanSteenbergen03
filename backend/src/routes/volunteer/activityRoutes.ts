import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { activities, foodItems, places, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requirePermission } from "@/middleware/auth";

const router = Router();

//Get all assigned activities for volunteer
router.get("/", requireAuth, requirePermission("read_activities"), async (req: Request, res: Response) => {
  try {
    const assignedActivities = await db
      .select({
        activity: activities,
        provider: users,
      })
      .from(activities)
      .leftJoin(users, eq(activities.providerId, users.id))
      .where(eq(activities.status, "accepted"));

    return res.json(assignedActivities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

//Get activity details with food items
router.get("/:id", requireAuth, requirePermission("read_activities"), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const items = await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.activityId, id));

    const assignedCenter = activity.assignedCenterId
      ? (
          await db
            .select()
            .from(places)
            .where(eq(places.id, activity.assignedCenterId))
        )[0]
      : null;

    const [provider] = await db
      .select()
      .from(users)
      .where(eq(users.id, activity.providerId));

    return res.json({
      activity,
      foodItems: items,
      assignedCenter,
      provider,
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

//Update activity status
router.patch(
  "/:id/status",
  requireAuth,
  requirePermission("update_activities"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      const validStatuses = ["in_progress", "completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Volunteers can only set status to: ${validStatuses.join(", ")}`,
        });
      }

      const [activity] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, id));

      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }

      const [updatedActivity] = await db
        .update(activities)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, id))
        .returning();

      return res.json({
        message: "Activity status updated",
        activity: updatedActivity,
      });
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ error: "Failed to update activity" });
    }
  }
);

export default router;
