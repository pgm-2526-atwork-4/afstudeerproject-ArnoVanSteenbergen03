import { operatingInfoSchema, type DistributionCenter } from "@shared/index";
import { z } from "zod/v4";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneDigitsRegex = /^\d+$/;

export const placeFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    contactInfo: z.object({
      phone: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || phoneDigitsRegex.test(value), {
          message: "Phone number can only contain numbers",
        }),
      email: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || emailRegex.test(value), {
          message: "Enter a valid email address",
        }),
    }),
    coordinates: z.object({
      lat: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
      lng: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
    }),
    operatingInfo: operatingInfoSchema,
  })
  .superRefine((value, ctx) => {
    for (const [day, hours] of Object.entries(value.operatingInfo)) {
      if (!hours) continue;
      if (hours.open >= hours.close) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operatingInfo", day],
          message: `${day.charAt(0).toUpperCase() + day.slice(1)} closing time must be after opening time`,
        });
      }
    }
  });

export const distributionCenterFormSchema = placeFormSchema.extend({
  type: z.enum(["supplier", "distribution_center"]),
});

export const supplierFormSchema = placeFormSchema;

export type PlaceFormValues = z.infer<typeof placeFormSchema>;
export type DistributionCenterFormValues = z.infer<
  typeof distributionCenterFormSchema
>;

function normalizeContactInfo(values: PlaceFormValues["contactInfo"]) {
  return {
    phone: values.phone?.trim() ?? "",
    email: values.email?.trim() ?? "",
  };
}

export function toPlacePayload(
  values: PlaceFormValues,
  type: "supplier" | "distribution_center",
): Partial<DistributionCenter> {
  return {
    name: values.name.trim(),
    type,
    contactInfo: normalizeContactInfo(values.contactInfo),
    operatingInfo: values.operatingInfo,
    geojson: {
      type: "Point",
      coordinates: [values.coordinates.lng, values.coordinates.lat],
    },
  };
}

export function toDistributionCenterPayload(
  values: DistributionCenterFormValues,
): Partial<DistributionCenter> {
  return toPlacePayload(values, values.type);
}

export function toSupplierPayload(
  values: PlaceFormValues,
): Partial<DistributionCenter> {
  return toPlacePayload(values, "supplier");
}
