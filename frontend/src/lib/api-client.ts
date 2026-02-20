import { User, AuthResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
  role: string;
}

// Register
export async function register(
  credentials: RegisterCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  // Wait for session to be established
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Fetch user with roles from /api/auth/me
  const userWithRoles = await getCurrentUser();
  const initialResponse = await response.json();

  return {
    message: initialResponse.message,
    user: userWithRoles,
  };
}

// Login
export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  // Wait for session to be established
  await new Promise((resolve) => setTimeout(resolve, 300));

  const userWithRoles = await getCurrentUser();
  const initialResponse = await response.json();

  return {
    message: initialResponse.message,
    user: userWithRoles,
  };
}

// Get current user
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
}
