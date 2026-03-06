import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import {
  activities,
  goods,
  vehicles,
  collectionActivities,
  places,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requirePermission } from "@/middleware/auth";
import { CreateOrderSchema } from "@shared/index";
import { findOpenCenter } from "@/services/autoAssign";

const router = Router();

// Create new order
router.post(
  "/",
  requireAuth,
  requirePermission("create_activities"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const validationResult = CreateOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.flatten(),
        });
      }

      const {
        location,
        vehicleId,
        orderTime,
        goods: goodsData,
        ...orderData
      } = validationResult.data;

      const [vehicle] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId));

      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const parsedOrderTime = new Date(orderTime);
      const assignedCenterId =
        orderData.assignedCenterId || (await findOpenCenter(parsedOrderTime));

      const [newActivity] = await db
        .insert(activities)
        .values({
          providerId: userId,
          location,
          activityType: "collection",
          assignedCenterId: assignedCenterId || null,
          vehicleId,
          orderTime: parsedOrderTime,
          notes: orderData.notes,
          status: "requested",
          details: {
            orderType: orderData.orderType,
            repeatDetails: orderData.repeatDetails,
          },
        })
        .returning();

      const [collectionActivity] = await db
        .insert(collectionActivities)
        .values({
          activityId: newActivity.id,
        })
        .returning();

      const createdGoods = await db
        .insert(goods)
        .values(
          goodsData.map((item: any) => ({
            goodType: item.goodType || "food",
            category: item.category,
            name: item.name,
            quantity: String(item.quantity),
            unit: item.unit || "items",
            status: "available",
            sourcePlaceId: assignedCenterId || null,
            sourceActivityId: collectionActivity.id,
            metadata: {
              allergies: item.allergies || null,
              expirationDate: item.expirationDate
                ? new Date(item.expirationDate)
                : null,
              packageIncluded: item.packageIncluded || false,
              image: item.image || null,
              notes: item.notes || null,
            },
          })),
        )
        .returning();

      return res.status(201).json({
        message: "Order created successfully",
        activity: newActivity,
        collectionActivity,
        goods: createdGoods,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  },
);

// List all orders
router.get(
  "/",
  requireAuth,
  requirePermission("read_activities"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const providerOrders = await db
        .select()
        .from(activities)
        .where(eq(activities.providerId, userId));

      const ordersWithCounts = await Promise.all(
        providerOrders.map(async (activity) => {
          const collectionActivity = await db
            .select()
            .from(collectionActivities)
            .where(eq(collectionActivities.activityId, activity.id));

          const goodsList = collectionActivity[0]
            ? await db
                .select()
                .from(goods)
                .where(eq(goods.sourceActivityId, collectionActivity[0].id))
            : [];

          let centerName: string | null = null;
          if (activity.assignedCenterId) {
            const [center] = await db
              .select({ name: places.name })
              .from(places)
              .where(eq(places.id, activity.assignedCenterId));
            centerName = center?.name ?? null;
          }

          const firstGood = goodsList[0];

          return {
            ...activity,
            goodsCount: goodsList.length,
            centerName,
            firstGoodType: firstGood?.goodType ?? null,
            firstGoodCategory: firstGood?.category ?? null,
          };
        })
      );

      return res.json(ordersWithCounts);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  },
);

// Get order details
router.get(
  "/:id",
  requireAuth,
  requirePermission("read_activities"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id as string;
      const id = req.params.id as string;

      const [order] = await db
        .select()
        .from(activities)
        .where(and(eq(activities.id, id), eq(activities.providerId, userId)));

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const collectionActivity = await db
        .select()
        .from(collectionActivities)
        .where(eq(collectionActivities.activityId, id));

      const goodsList = collectionActivity[0]
        ? await db
            .select()
            .from(goods)
            .where(eq(goods.sourceActivityId, collectionActivity[0].id))
        : [];

      return res.json({
        activity: order,
        collectionActivity: collectionActivity[0] || null,
        goods: goodsList,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  },
);

// Update order (full update)
router.put(
  "/:id",
  requireAuth,
  requirePermission("update_activities"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id as string;
      const id = req.params.id as string;

      const [existingOrder] = await db
        .select()
        .from(activities)
        .where(and(eq(activities.id, id), eq(activities.providerId, userId)));

      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      const validationResult = CreateOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.flatten(),
        });
      }

      const {
        location,
        vehicleId,
        orderTime,
        goods: goodsData,
        ...orderData
      } = validationResult.data;

      const parsedOrderTime = new Date(orderTime);
      const assignedCenterId =
        orderData.assignedCenterId || (await findOpenCenter(parsedOrderTime));

      const [updatedActivity] = await db
        .update(activities)
        .set({
          location,
          vehicleId,
          assignedCenterId: assignedCenterId || null,
          orderTime: parsedOrderTime,
          notes: orderData.notes,
          details: {
            orderType: orderData.orderType,
            repeatDetails: orderData.repeatDetails,
          },
          updatedAt: new Date(),
        })
        .where(eq(activities.id, id))
        .returning();

      let [collectionActivity] = await db
        .select()
        .from(collectionActivities)
        .where(eq(collectionActivities.activityId, id));

      if (!collectionActivity) {
        [collectionActivity] = await db
          .insert(collectionActivities)
          .values({ activityId: id })
          .returning();
      }

      await db
        .delete(goods)
        .where(eq(goods.sourceActivityId, collectionActivity.id));

      const createdGoods = await db
        .insert(goods)
        .values(
          goodsData.map((item: any) => ({
            goodType: item.goodType || "food",
            category: item.category,
            name: item.name,
            quantity: String(item.quantity),
            unit: item.unit || "items",
            status: "available",
            sourcePlaceId: assignedCenterId || null,
            sourceActivityId: collectionActivity.id,
            metadata: {
              allergies: item.allergies || null,
              expirationDate: item.expirationDate
                ? new Date(item.expirationDate)
                : null,
              packageIncluded: item.packageIncluded || false,
              image: item.image || null,
              notes: item.notes || null,
            },
          })),
        )
        .returning();

      return res.json({
        message: "Order updated successfully",
        activity: updatedActivity,
        collectionActivity,
        goods: createdGoods,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  },
);

// Update order status
router.patch(
  "/:id",
  requireAuth,
  requirePermission("update_activities"),
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id as string;
      const id = req.params.id as string;
      const { status, notes } = req.body;

      const validStatuses = [
        "requested",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const [order] = await db
        .select()
        .from(activities)
        .where(and(eq(activities.id, id), eq(activities.providerId, userId)));

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      updateData.updatedAt = new Date();

      const [updatedOrder] = await db
        .update(activities)
        .set(updateData)
        .where(eq(activities.id, id))
        .returning();

      return res.json({
        message: "Order updated successfully",
        activity: updatedOrder,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  },
);

export default router;
