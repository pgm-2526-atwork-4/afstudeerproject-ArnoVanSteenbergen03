import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.email("Invalid email address"),
  username: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  roles: z.array(z.string()),
});

export type User = z.infer<typeof userSchema>;

// Auth response
export const authResponseSchema = z.object({
  message: z.string(),
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Login credentials - front -> backend
export const loginCredentialsSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string(),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

// Register credentials - front -> backend
export const registerCredentialsSchema = loginCredentialsSchema.extend({
  firstname: z.string(),
  lastname: z.string(),
  role: z.string(),
});

export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;

// Auth context type - frontend auth context
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    firstname: string,
    lastname: string,
    password: string,
    role: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

// Distribution Center schema

export const distributionCenterSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["provider", "distribution_center"]),
  geojson: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  operatingInfo: z
    .object({
      monday: z.string().optional(),
      tuesday: z.string().optional(),
      wednesday: z.string().optional(),
      thursday: z.string().optional(),
      friday: z.string().optional(),
      saturday: z.string().optional(),
      sunday: z.string().optional(),
    })
    .optional(),
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