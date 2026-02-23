import { z } from "zod/v4";

export const updateProfileSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.email("Invalid email address"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
