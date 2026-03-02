import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { activities, foodItems, vehicles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requirePermission } from "@/middleware/auth";
import { CreateOrderSchema } from "@shared/index";

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
        pickupAddress,
        vehicleId,
        pickupTime,
        foodItems: foodItemsData,
        ...orderData
      } = validationResult.data;

      const [vehicle] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId));

      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      const [newActivity] = await db
        .insert(activities)
        .values({
          providerId: userId,
          pickupAddress,
          assignedCenterId: orderData.assignedCenterId || null,
          vehicleId,
          pickupTime: new Date(pickupTime),
          notes: orderData.notes,
          status: "requested",
          details: {
            orderType: orderData.orderType,
            repeatDetails: orderData.repeatDetails,
          },
        })
        .returning();

      const createdFoodItems = await db
        .insert(foodItems)
        .values(
          foodItemsData.map((item: any) => ({
            activityId: newActivity.id,
            itemName: item.itemName,
            allergies: item.allergies || null,
            servings: item.servings,
            expirationDate: item.expirationDate
              ? new Date(item.expirationDate)
              : null,
            freezerItemIncluded: item.freezerItemIncluded,
            packageIncluded: item.packageIncluded,
            image: item.image || null,
            notes: item.notes || null,
          })),
        )
        .returning();

      return res.status(201).json({
        message: "Order created successfully",
        activity: newActivity,
        foodItems: createdFoodItems,
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
          const foodItemsList = await db
            .select()
            .from(foodItems)
            .where(eq(foodItems.activityId, activity.id));

          return {
            ...activity,
            foodItemCount: foodItemsList.length,
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

      const items = await db
        .select()
        .from(foodItems)
        .where(eq(foodItems.activityId, id));

      return res.json({
        activity: order,
        foodItems: items,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
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
