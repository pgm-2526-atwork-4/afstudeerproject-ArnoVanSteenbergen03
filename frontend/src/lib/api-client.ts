import { User, AuthResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstname: string;
  lastname: string;
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
    try {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    } catch {
      throw new Error(`Registration failed: ${response.statusText}`);
    }
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
    try {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    } catch {
      throw new Error(`Login failed: ${response.statusText}`);
    }
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
    method: "GET",
    credentials: "include", 
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Failed to parse user data");
  }
}

// Logout
export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}


//// Profile API calls

export async function getProfile(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch profile");
    } catch {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }
  }

  return response.json();
}

export async function updateProfile(data: User, rolePrefix: string) {
  const response = await fetch(
    `${API_BASE_URL}/${rolePrefix}/profile`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}