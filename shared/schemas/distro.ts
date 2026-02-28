import { z } from "zod";

// Time format per day
export const timeRangeSchema = z.object({
  open: z.string().time(),
  close: z.string().time(),
});

export type TimeRange = z.infer<typeof timeRangeSchema>;

// Operating info per day
export const operatingInfoSchema = z.object({
  monday: timeRangeSchema.nullable(),
  tuesday: timeRangeSchema.nullable(),
  wednesday: timeRangeSchema.nullable(),
  thursday: timeRangeSchema.nullable(),
  friday: timeRangeSchema.nullable(),
  saturday: timeRangeSchema.nullable(),
  sunday: timeRangeSchema.nullable(),
});

export type OperatingInfo = z.infer<typeof operatingInfoSchema>;

export const operatingHoursSchema = operatingInfoSchema;

// Distribution center schema
export const distributionCenterSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["provider", "distribution_center"]),
  geojson: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  operatingInfo: operatingHoursSchema.optional(),
  contactInfo: z
    .object({
      phone: z.string().optional(),
      email: z.email().optional(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DistributionCenter = z.infer<typeof distributionCenterSchema>;
