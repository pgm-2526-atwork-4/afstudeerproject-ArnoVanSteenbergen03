// Re-export all types from shared (single source of truth)
export {
  type User,
  type AuthResponse,
  type LoginCredentials,
  type RegisterCredentials,
  type AuthContextType,
  type DistributionCenter,
  type OperatingInfo,
  type TimeRange,
  type Order,
  type CreateOrderInput,
  userSchema,
  authResponseSchema,
  loginCredentialsSchema,
  registerCredentialsSchema,
  distributionCenterSchema,
  operatingInfoSchema,
  timeRangeSchema,
  orderSchema,
  CreateOrderSchema,
} from "@shared/index";

// Order form types (used by create-order / edit-order pages and steps)
export interface FoodItemData {
  itemName: string;
  allergies: string;
  servings: number;
  expirationDate?: string;
  freezerItemIncluded: boolean;
  packageIncluded: boolean;
  image?: string;
  notes?: string;
}

export interface OrderFormData {
  orderType: "single" | "repeated";
  foodItems: FoodItemData[];
  foodNotes: string;
  pickupAddress: string;
  vehicleId: string;
  deliveryNotes: string;
  pickupTime: string;
}
