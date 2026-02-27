import { User, AuthResponse, LoginCredentials, RegisterCredentials, DistributionCenter } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    let errorMessage = "Registration failed";
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = `Registration failed: ${response.statusText}`;
    }
    throw new Error(errorMessage);
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
    let errorMessage = "Login failed";
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = `Login failed: ${response.statusText}`;
    }
    throw new Error(errorMessage);
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

export async function updateProfile(
  data: { firstname: string; lastname: string; username: string; email: string },
  rolePrefix: string,
) {
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
    let errorMessage = "Failed to update profile";
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

//// Distribution Centers API calls

export async function getDistributionCenters() {
  const response = await fetch(`${API_BASE_URL}/admin/distro`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch distribution centers");
    } catch {
      throw new Error(`Failed to fetch distribution centers: ${response.statusText}`);
    }
  }

  return response.json();
}


export async function updateDistributionCenter(
  id: string,
  data: Partial<DistributionCenter>,
) {
  const response = await fetch(`${API_BASE_URL}/admin/distro/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to update distribution center");
    } catch {
      throw new Error(`Failed to update distribution center: ${response.statusText}`);
    }
  }

  return response.json();
}