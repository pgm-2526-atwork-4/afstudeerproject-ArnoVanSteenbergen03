import { z } from "zod/v4";

// Login
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register
export const registerSchema = z
  .object({
    email: z.email("Invalid email address"),
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    userType: z.enum(["volunteer", "provider"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Backend only register
export const registerApiSchema = z.object({
  email: z.email("Invalid email address"),
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["volunteer", "provider"]),
});

export type RegisterApiInput = z.infer<typeof registerApiSchema>;
