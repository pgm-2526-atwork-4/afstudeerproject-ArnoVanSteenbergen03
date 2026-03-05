import { z } from "zod";

export const vehicleSchema = z.object({
  id: z.string(),
  vehicleType: z.string(),
  icon: z.string(),
  amount: z.number(),
});

export type Vehicle = z.infer<typeof vehicleSchema>;
