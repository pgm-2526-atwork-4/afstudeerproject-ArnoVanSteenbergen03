import { z } from "zod";
import { OperatingInfo } from "./distro";

// Supplier data type
export interface SupplierData {
  id?: string;
  name: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  operatingInfo: OperatingInfo;
  geojson: {
    type: "Point";
    coordinates: [number, number];
  };
}

// Supplier schema
export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  contactInfo: z.object({
    phone: z.string(),
    email: z.string(),
  }),
  operatingInfo: z.any(),
  geojson: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
});
