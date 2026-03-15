import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { activities, goods, collectionActivities, places, users, vehicles } from "@/db/schema";
import { eq, and, isNull, asc, notInArray } from "drizzle-orm";
import { requireAuth, requirePermission } from "@/middleware/auth";

const router = Router();

// Get open (unassigned) deliveries
router.get("/open", requireAuth, requirePermission("read_activities"), async (_req: Request, res: Response) => {
  try {
    const openDeliveries = await db
      .select({
        activity: activities,
        provider: users,
        vehicle: vehicles,
        center: places,
      })
      .from(activities)
      .leftJoin(users, eq(activities.providerId, users.id))
      .leftJoin(vehicles, eq(activities.vehicleId, vehicles.id))
      .leftJoin(places, eq(activities.assignedCenterId, places.id))
      .where(
        and(
          eq(activities.status, "requested"),
          isNull(activities.assignedDriver)
        )
      )
      .orderBy(asc(activities.orderTime));

    return res.json(openDeliveries);
  } catch (error) {
    console.error("Error fetching open deliveries:", error);
    res.status(500).json({ error: "Failed to fetch open deliveries" });
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
        vehicle: vehicles,
        center: places,
      })
      .from(activities)
      .leftJoin(users, eq(activities.providerId, users.id))
      .leftJoin(vehicles, eq(activities.vehicleId, vehicles.id))
      .leftJoin(places, eq(activities.assignedCenterId, places.id))
      .where(
        and(
          eq(activities.assignedDriver, userId),
          notInArray(activities.status, ["completed", "incomplete", "need_assistance"])
        )
      );

    return res.json(myDeliveries);
  } catch (error) {
    console.error("Error fetching my deliveries:", error);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

// Accept a delivery
router.patch("/:id/accept", requireAuth, requirePermission("update_activities"), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id as string;
    const id = req.params.id as string;

    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!activity) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    if (activity.assignedDriver) {
      return res.status(400).json({ error: "Delivery has already been accepted" });
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
      message: "Delivery accepted",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Error accepting delivery:", error);
    res.status(500).json({ error: "Failed to accept delivery" });
  }
});

// Get delivery details with items
router.get("/:id", requireAuth, requirePermission("read_activities"), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!activity) {
      return res.status(404).json({ error: "Delivery not found" });
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
    console.error("Error fetching delivery:", error);
    res.status(500).json({ error: "Failed to fetch delivery" });
  }
});

// Valid status transitions for deliveries
const STATUS_TRANSITIONS: Record<string, string[]> = {
  accepted: ["in_progress"],
  in_progress: ["completed", "incomplete", "need_assistance"],
};

// Update delivery status
router.patch(
  "/:id/status",
  requireAuth,
  requirePermission("update_activities"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status, completionData } = req.body;

      const validStatuses = ["in_progress", "completed", "incomplete", "need_assistance"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
        });
      }

      const [activity] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, id));

      if (!activity) {
        return res.status(404).json({ error: "Delivery not found" });
      }

      const allowed = STATUS_TRANSITIONS[activity.status];
      if (!allowed || !allowed.includes(status)) {
        return res.status(400).json({
          error: `Cannot transition from "${activity.status}" to "${status}"`,
        });
      }

      const details = completionData
        ? { ...(activity.details as Record<string, unknown> | null), ...completionData }
        : activity.details;

      const [updatedActivity] = await db
        .update(activities)
        .set({
          status,
          details,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, id))
        .returning();

      return res.json({
        message: "Delivery status updated",
        activity: updatedActivity,
      });
    } catch (error) {
      console.error("Error updating delivery:", error);
      res.status(500).json({ error: "Failed to update delivery" });
    }
  }
);

export default router;
