// Re-export all types from shared Zod schemas (single source of truth)
export {
  type User,
  type AuthResponse,
  type LoginCredentials,
  type RegisterCredentials,
  type AuthContextType,
  userSchema,
  authResponseSchema,
  loginCredentialsSchema,
  registerCredentialsSchema,
} from "@shared/schemas/types";