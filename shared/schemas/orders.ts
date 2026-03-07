import { z } from "zod";

// Validation schemas for goods items
export const GoodsSchema = z.object({
  goodType: z.enum(["food", "clothing", "household", "equipment"]).default("food"),
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().positive("Quantity must be a positive number"),
  unit: z.enum(["kg", "items", "boxes", "pallets", "liters"]).default("items"),
  allergies: z.string().optional(),
  expirationDate: z.string().optional(),
  packageIncluded: z.boolean().default(false),
  image: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  location: z.string().min(1, "Location is required"),
  assignedCenterId: z.string().optional(),
  vehicleId: z.string(),
  orderTime: z.string(),
  notes: z.string().optional(),
  goods: z.array(GoodsSchema).min(1, "At least one good item is required"),
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
  orderTime: z.string(),
  location: z.string(),
  assignedCenterId: z.string().optional(),
  notes: z.string().optional(),
  details: z.any().optional(),
  goodsCount: z.number(),
  activityType: z.string().optional(),
  centerName: z.string().nullable().optional(),
  firstGoodType: z.string().nullable().optional(),
  firstGoodCategory: z.string().nullable().optional(),
});

export type Order = z.infer<typeof orderSchema>;

// Goods item form data 
export const goodsDataSchema = z.object({
  goodType: z.enum(["food", "clothing", "household", "equipment"]).default("food"),
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
  goodType: z.string(),
  category: z.string(),
  name: z.string(),
  quantity: z.union([z.string(), z.number()]),
  unit: z.string(),
  status: z.string(),
  sourcePlaceId: z.string().nullable().optional(),
  currentPlaceId: z.string().nullable().optional(),
  sourceActivityId: z.number().nullable().optional(),
  distributionActivityId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  image: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
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
  goodsNotes: z.string(),
  location: z.string(),
  vehicleId: z.string(),
  deliveryNotes: z.string(),
  orderTime: z.string(),
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
});

export type DeliveryOrder = z.infer<typeof deliveryOrderSchema>;
