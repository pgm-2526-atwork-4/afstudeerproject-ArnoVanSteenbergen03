import { z } from "zod";

// Validation schemas
export const FoodItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  allergies: z.string().default(""),
  servings: z.number().int().positive("Servings must be a positive number"),
  expirationDate: z.string().optional(),
  freezerItemIncluded: z.boolean().default(false),
  packageIncluded: z.boolean().default(false),
  image: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  pickupAddress: z.string().min(1, "Pickup address is required"),
  assignedCenterId: z.string().optional(),
  vehicleId: z.string(),
  pickupTime: z.string(),
  notes: z.string().optional(),
  foodItems: z.array(FoodItemSchema).min(1, "At least one food item is required"),
  orderType: z.enum(["single", "repeated"]).default("single"),
  repeatDetails: z.object({
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
    endDate: z.string().optional(),
  }).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// Order schema
export const orderSchema = z.object({
  id: z.string(),
  status: z.string(),
  pickupTime: z.string(),
  pickupAddress: z.string(),
  assignedCenterId: z.string().optional(),
  notes: z.string().optional(),
  details: z.any().optional(),
  foodItemCount: z.number(),
});

export type Order = z.infer<typeof orderSchema>;
