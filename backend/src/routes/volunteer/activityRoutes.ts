import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { activities, goods, collectionActivities, places, users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth, requirePermission } from "@/middleware/auth";

const router = Router();

// Get open (unassigned) orders
router.get("/open", requireAuth, requirePermission("read_activities"), async (_req: Request, res: Response) => {
  try {
    const openOrders = await db
      .select({
        activity: activities,
        provider: users,
      })
      .from(activities)
      .leftJoin(users, eq(activities.providerId, users.id))
      .where(
        and(
          eq(activities.status, "requested"),
          isNull(activities.assignedDriver)
        )
      );

    return res.json(openOrders);
  } catch (error) {
    console.error("Error fetching open orders:", error);
    res.status(500).json({ error: "Failed to fetch open orders" });
  }
});

// Get my deliveries
router.get("/mine", requireAuth, requirePermission("read_activities"), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id as string;

    const myDeliveries = await db
      .select({
        activity: activities,
        provider: users,
      })
      .from(activities)
      .leftJoin(users, eq(activities.providerId, users.id))
      .where(eq(activities.assignedDriver, userId));

    return res.json(myDeliveries);
  } catch (error) {
    console.error("Error fetching my deliveries:", error);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

// Accept an order
router.patch("/:id/accept", requireAuth, requirePermission("update_activities"), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id as string;
    const id = req.params.id as string;

    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!activity) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (activity.assignedDriver) {
      return res.status(400).json({ error: "Order has already been accepted by another driver" });
    }

    const [updatedActivity] = await db
      .update(activities)
      .set({
        assignedDriver: userId,
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();

    return res.json({
      message: "Order accepted",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({ error: "Failed to accept order" });
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

    const collectionActivityRows = await db
      .select()
      .from(collectionActivities)
      .where(eq(collectionActivities.activityId, id));

    let items: (typeof goods.$inferSelect)[] = [];
    if (collectionActivityRows.length > 0) {
      const caIds = collectionActivityRows.map((ca) => ca.id);
      const allGoods = await db.select().from(goods);
      items = allGoods.filter((g) => caIds.includes(g.sourceActivityId));
    }

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
      goods: items,
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
