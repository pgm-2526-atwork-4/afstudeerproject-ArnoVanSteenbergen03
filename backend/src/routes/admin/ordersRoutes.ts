import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { activities, goods, collectionActivities, places, users, vehicles } from "@/db/schema";
import { eq, and, gte, lte, sql, desc, count } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth, requirePermission } from "@/middleware/auth";

const router = Router();

// Get orders with pagination, filters
router.get("/", requireAuth, requirePermission("read_activities"), async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const { status, centerId, dateFrom, dateTo } = req.query;

    const conditions = [];

    if (status && typeof status === "string") {
      conditions.push(eq(activities.status, status));
    }
    if (centerId && typeof centerId === "string") {
      conditions.push(eq(activities.assignedCenterId, centerId));
    }
    if (dateFrom && typeof dateFrom === "string") {
      conditions.push(gte(activities.orderTime, new Date(dateFrom)));
    }
    if (dateTo && typeof dateTo === "string") {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(activities.orderTime, end));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await db
      .select({ total: count() })
      .from(activities)
      .where(whereClause);

    const rows = await db
      .select({
        id: activities.id,
        status: activities.status,
        orderTime: activities.orderTime,
        location: activities.location,
        activityType: activities.activityType,
        notes: activities.notes,
        assignedCenterId: activities.assignedCenterId,
        createdAt: activities.createdAt,
        providerFirstname: users.firstname,
        providerLastname: users.lastname,
        centerName: places.name,
      })
      .from(activities)
      .leftJoin(users, eq(activities.providerId, users.id))
      .leftJoin(places, eq(activities.assignedCenterId, places.id))
      .where(whereClause)
      .orderBy(desc(activities.orderTime))
      .limit(limit)
      .offset(offset);

    return res.json({
      orders: rows,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    });
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

// Update order activity data (not goods)
router.put(
  "/:id",
  requireAuth,
  requirePermission("update_activities"),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;

      const [existing] = await db
        .select()
        .from(activities)
        .where(eq(activities.id, id));

      if (!existing) {
        return res.status(404).json({ error: "Order not found" });
      }

      const schema = z.object({
        status: z.string().optional(),
        assignedDriver: z.string().uuid().nullable().optional(),
        assignedCenterId: z.string().uuid().nullable().optional(),
        location: z.string().min(1).optional(),
        activityType: z.string().optional(),
        orderTime: z.string().optional(),
        notes: z.string().nullable().optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      }

      const data = parsed.data;
      const updatePayload: Record<string, unknown> = { updatedAt: new Date() };

      if (data.status !== undefined) updatePayload.status = data.status;
      if (data.assignedDriver !== undefined) updatePayload.assignedDriver = data.assignedDriver;
      if (data.assignedCenterId !== undefined) updatePayload.assignedCenterId = data.assignedCenterId;
      if (data.location !== undefined) updatePayload.location = data.location;
      if (data.activityType !== undefined) updatePayload.activityType = data.activityType;
      if (data.orderTime !== undefined) updatePayload.orderTime = new Date(data.orderTime);
      if (data.notes !== undefined) updatePayload.notes = data.notes;

      const [updated] = await db
        .update(activities)
        .set(updatePayload)
        .where(eq(activities.id, id))
        .returning();

      return res.json({ message: "Order updated", activity: updated });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
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
