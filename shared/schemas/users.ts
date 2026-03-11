import { z } from "zod";

// Create user (admin manual upload )
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["admin", "provider", "volunteer"], {
    message: "Role must be admin, provider, or volunteer",
  }),
  permissionIds: z.array(z.number()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

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
