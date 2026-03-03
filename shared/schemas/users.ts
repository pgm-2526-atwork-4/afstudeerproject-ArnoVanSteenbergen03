import { z } from "zod";

// Admin user list item
export const adminUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  userType: z.string(),
  createdAt: z.string(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

// Admin user detail
export const adminUserDetailSchema = adminUserSchema.extend({
  permissionIds: z.array(z.number()),
});

export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;
