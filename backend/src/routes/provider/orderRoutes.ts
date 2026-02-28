import { Router, Request, Response } from "express";
import { db } from "@/config/database";
import { activities, foodItems, vehicles, places } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRoles } from "@/middleware/auth";
import { CreateOrderSchema } from "@shared/index";

const router = Router();

// Create new order
router.post(
  "/",
  requireAuth,
  requireRoles(["provider"]),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      // Validate request body
      const validationResult = CreateOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.flatten(),
        });
      }

      const {
        pickupLocationId,
        vehicleId,
        pickupTime,
        foodItems: foodItemsData,
        ...orderData
      } = validationResult.data;

      // Verify locations exist
      const [pickupLocation] = await db
        .select()
        .from(places)
        .where(eq(places.id, pickupLocationId));

      if (!pickupLocation) {
        return res.status(404).json({ error: "Pickup location not found" });
      }

      if (orderData.assignedCenterId) {
        const [assignedCenter] = await db
          .select()
          .from(places)
          .where(eq(places.id, orderData.assignedCenterId));

        if (!assignedCenter) {
          return res.status(404).json({ error: "Assigned center not found" });
        }
      }

      // Verify vehicle exists
      const [vehicle] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId));

      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      // Create activity
      const [newActivity] = await db
        .insert(activities)
        .values({
          providerId: userId,
          pickupLocationId,
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

      // Create food items
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
  requireRoles(["provider"]),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      const providerOrders = await db
        .select({
          activity: activities,
          foodItemCount: foodItems.id,
        })
        .from(activities)
        .leftJoin(foodItems, eq(foodItems.activityId, activities.id))
        .where(eq(activities.providerId, userId));

      // Group by activity
      const ordersMap = new Map();
      providerOrders.forEach((row) => {
        if (!ordersMap.has(row.activity.id)) {
          ordersMap.set(row.activity.id, {
            ...row.activity,
            foodItemCount: 0,
          });
        }
        if (row.foodItemCount) {
          ordersMap.get(row.activity.id).foodItemCount += 1;
        }
      });

      const orders = Array.from(ordersMap.values());

      return res.json(orders);
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
  requireRoles(["provider"]),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
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
  requireRoles(["provider"]),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
      const id = req.params.id as string;
      const { status, notes } = req.body;

      // Validate status
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
