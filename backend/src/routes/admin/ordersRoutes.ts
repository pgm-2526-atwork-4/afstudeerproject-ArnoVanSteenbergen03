import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { activities, goods, collectionActivities, places, users, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth, requirePermission } from "@/middleware/auth";

const router = Router();

// Get all orders with filters
router.get("/", requireAuth, requirePermission("read_activities"), async (req: Request, res: Response) => {
  try {
    const { status, providerId, centerId } = req.query;

    let query = db
      .select({
        activity: activities,
        provider: users,
        vehicle: vehicles,
      })
      .from(activities)
      .leftJoin(users, eq(activities.providerId, users.id));

    let whereConditions = [];

    if (status) {
      whereConditions.push(eq(activities.status, status as string));
    }

    if (providerId) {
      whereConditions.push(eq(activities.providerId, providerId as string));
    }

    if (centerId) {
      whereConditions.push(eq(activities.assignedCenterId, centerId as string));
    }

    const allOrders = await query;

    const filteredOrders = allOrders.filter((order) => {
      if (status && order.activity.status !== status) return false;
      if (providerId && order.activity.providerId !== providerId) return false;
      if (centerId && order.activity.assignedCenterId !== centerId) return false;
      return true;
    });

    return res.json(filteredOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

//Get order details with all info
router.get("/:id", requireAuth, requirePermission("read_activities"), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!activity) {
      return res.status(404).json({ error: "Order not found" });
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

    const [provider] = await db
      .select()
      .from(users)
      .where(eq(users.id, activity.providerId));

    const assignedCenter = activity.assignedCenterId
      ? (
          await db
            .select()
            .from(places)
            .where(eq(places.id, activity.assignedCenterId))
        )[0]
      : null;

    const [vehicle] = activity.vehicleId
      ? await db
          .select()
          .from(vehicles)
          .where(eq(vehicles.id, activity.vehicleId))
      : [null];

    return res.json({
      activity,
      goods: items,
      provider,
      assignedCenter,
      vehicle,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

//Assign order to distribution center
router.patch(
  "/:id/assign-center",
  requireAuth,
  requirePermission("update_activities"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { centerId } = req.body;

      if (!centerId) {
        return res.status(400).json({ error: "Center ID is required" });
      }

      const [activity] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, id));

      if (!activity) {
        return res.status(404).json({ error: "Order not found" });
      }

      const [center] = await db
        .select()
        .from(places)
        .where(eq(places.id, centerId));

      if (!center) {
        return res.status(404).json({ error: "Distribution center not found" });
      }

      const [updatedActivity] = await db
        .update(activities)
        .set({
          assignedCenterId: centerId,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, id))
        .returning();

      return res.json({
        message: "Order assigned to center",
        activity: updatedActivity,
      });
    } catch (error) {
      console.error("Error assigning order:", error);
      res.status(500).json({ error: "Failed to assign order" });
    }
  }
);

//Update order status
router.patch(
  "/:id/status",
  requireAuth,
  requirePermission("update_activities"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      const validStatuses = ["requested", "accepted", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const [activity] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, id));

      if (!activity) {
        return res.status(404).json({ error: "Order not found" });
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
        message: "Order status updated",
        activity: updatedActivity,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
);

export default router;
