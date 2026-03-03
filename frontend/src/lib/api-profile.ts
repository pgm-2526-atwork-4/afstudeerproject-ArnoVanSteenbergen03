import { User } from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get profile info
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

// Update profile info
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
