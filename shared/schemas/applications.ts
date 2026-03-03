import { z } from "zod";

// Permission schema
export const permissionSchema = z.object({
  id: z.number(),
  resource: z.string(),
  action: z.string(),
  key: z.string(),
  description: z.string().nullable(),
});

export type Permission = z.infer<typeof permissionSchema>;
