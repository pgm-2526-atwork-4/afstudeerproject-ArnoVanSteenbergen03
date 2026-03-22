import { z } from "zod";

// Validation schemas for goods items
export const GoodsSchema = z.object({
  goodState: z.enum(["fresh", "old", "dry"]).default("fresh"),
  overDueDate: z.boolean().default(false),
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().positive("Quantity must be a positive number"),
  unit: z.enum(["kg", "items", "boxes", "pallets", "liters"]).default("items"),
  allergies: z.string().optional(),
  expirationDate: z.string().optional(),
  packageIncluded: z.boolean().default(false),
  image: z.string().optional(),
});

export const recurrenceSlotSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format"),
});

export type RecurrenceSlot = z.infer<typeof recurrenceSlotSchema>;

export const CreateOrderSchema = z.object({
  location: z.string().min(1, "Location is required"),
  assignedCenterId: z.string().optional(),
  vehicleId: z.string(),
  orderTime: z.string(),
  notes: z.string().optional(),
  goods: z.array(GoodsSchema).min(1, "At least one good item is required"),
  orderType: z.enum(["single", "repeated"]).default("single"),
  recurrenceSlots: z.array(recurrenceSlotSchema).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// Order schema
export const orderSchema = z.object({
  id: z.string(),
  status: z.string(),
  orderTime: z.string(),
  location: z.string(),
  assignedCenterId: z.string().optional(),
  notes: z.string().optional(),
  details: z.any().optional(),
  goodsCount: z.number(),
  activityType: z.string().optional(),
  centerName: z.string().nullable().optional(),
  firstGoodCategory: z.string().nullable().optional(),
});

export type Order = z.infer<typeof orderSchema>;

export const adminOrderRowSchema = z.object({
  id: z.string(),
  status: z.string(),
  orderTime: z.string(),
  location: z.string(),
  activityType: z.string(),
  notes: z.string().nullable(),
  assignedCenterId: z.string().nullable(),
  createdAt: z.string().nullable().optional(),
  providerFirstname: z.string().nullable(),
  providerLastname: z.string().nullable(),
  centerName: z.string().nullable(),
});

export type AdminOrderRow = z.infer<typeof adminOrderRowSchema>;

export const adminOrdersResponseSchema = z.object({
  orders: z.array(adminOrderRowSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type AdminOrdersResponse = z.infer<typeof adminOrdersResponseSchema>;

// Goods item form data
export const goodsDataSchema = z.object({
  goodState: z.enum(["fresh", "old", "dry"]).default("fresh"),
  overDueDate: z.boolean().default(false),
  category: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.enum(["kg", "items", "boxes", "pallets", "liters"]).default("items"),
  allergies: z.string().optional(),
  expirationDate: z.string().optional(),
  packageIncluded: z.boolean(),
  image: z.string().optional(),
});

export type GoodsData = z.infer<typeof goodsDataSchema>;

// Edit order form constants
export const EDIT_ORDER_STATUSES = [
  "requested",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const EDIT_ORDER_ACTIVITY_TYPES = [
  "collection",
  "distribution",
  "hygiene",
  "other",
] as const;

// Edit order schema
export const editOrderSchema = z.object({
  status: z.enum(EDIT_ORDER_STATUSES),
  assignedDriver: z.string().nullable(),
  assignedCenterId: z.string().nullable(),
  location: z.string().trim().min(1, "Location is required"),
  activityType: z.enum(EDIT_ORDER_ACTIVITY_TYPES),
  orderTime: z
    .string()
    .min(1, "Order time is required")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Order time is invalid",
    }),
  notes: z.string().optional(),
});

export type EditOrderInput = z.infer<typeof editOrderSchema>;

// Goods form validation schema (with trims and transforms for form input)
export const goodsFormValidationSchema = z.object({
  goodState: z.enum(["fresh", "old", "dry"]),
  overDueDate: z.boolean(),
  category: z.string().trim().min(1, "Category is required"),
  name: z.string().trim().min(1, "Item name is required"),
  quantity: z
    .string()
    .trim()
    .min(1, "Quantity is required")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Quantity must be a positive number")
    .transform((value) => Number(value)),
  unit: z.enum(["kg", "items", "boxes", "pallets", "liters"]),
  allergies: z.string().trim().optional(),
  expirationDate: z.string().optional(),
  packageIncluded: z.boolean(),
  image: z.string().optional(),
});
export const foodItemDataSchema = goodsDataSchema;
export type FoodItemData = GoodsData;

export const goodsFormItemSchema = goodsDataSchema.extend({
  id: z.string(),
  quantity: z.string(),
});

export type GoodsFormItem = z.infer<typeof goodsFormItemSchema>;

// API goods item
export const apiGoodsItemSchema = z.object({
  id: z.string(),
  goodState: z.string(),
  overDueDate: z.boolean().nullable().optional(),
  category: z.string(),
  name: z.string(),
  quantity: z.union([z.string(), z.number()]),
  unit: z.string(),
  status: z.string(),
  sourcePlaceId: z.string().nullable().optional(),
  currentPlaceId: z.string().nullable().optional(),
  sourceActivityId: z.number().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  image: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  expirationDate: z.string().nullable().optional(),
  packageIncluded: z.boolean().nullable().optional(),
});

export type ApiGoodsItem = z.infer<typeof apiGoodsItemSchema>;

// Order form data
export const orderFormDataSchema = z.object({
  orderType: z.enum(["single", "repeated"]),
  goods: z.array(goodsDataSchema),
  location: z.string(),
  vehicleId: z.string(),
  deliveryNotes: z.string(),
  orderTime: z.string(),
  recurrenceSlots: z.array(recurrenceSlotSchema).optional(),
});

export type OrderFormData = z.infer<typeof orderFormDataSchema>;

// Delivery order
export const deliveryOrderSchema = z.object({
  activity: z.object({
    id: z.string(),
    status: z.string(),
    orderTime: z.string(),
    location: z.string(),
    notes: z.string().nullable(),
    details: z.record(z.string(), z.unknown()).nullable(),
    assignedCenterId: z.string().nullable(),
    assignedDriver: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  provider: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
    })
    .nullable(),
  vehicle: z
    .object({
      id: z.string(),
      vehicleType: z.string(),
      icon: z.string(),
    })
    .nullable(),
  center: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  supplierChannel: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
});

export type DeliveryOrder = z.infer<typeof deliveryOrderSchema>;
