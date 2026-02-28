import { z } from "zod/v4";

// Validation schemas
export const FoodItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  allergies: z.string().optional().default(""),
  servings: z.number().int().positive("Servings must be a positive number"),
  expirationDate: z.string().datetime().optional(),
  freezerItemIncluded: z.boolean().default(false),
  packageIncluded: z.boolean().default(false),
  image: z.string().url().optional(),
  notes: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  pickupLocationId: z.string().uuid("Invalid pickup location ID"),
  assignedCenterId: z.string().uuid("Invalid assigned center ID").optional(),
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  pickupTime: z.string().datetime("Invalid pickup time"),
  notes: z.string().optional(),
  foodItems: z.array(FoodItemSchema).min(1, "At least one food item is required"),
  orderType: z.enum(["single", "repeated"]).default("single"),
  repeatDetails: z.object({
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
    endDate: z.string().datetime().optional(),
  }).optional(),
});