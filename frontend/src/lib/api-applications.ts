import type { Permission } from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type { Permission };

export async function getAllPermissions(): Promise<Permission[]> {
  const response = await fetch(`${API_BASE_URL}/applications/permissions`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch permissions");
  }

  return response.json();
}

export async function getApplications() {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}

export async function getApplicationCount(): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE_URL}/applications/count`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch application count");
  }

  return response.json();
}

export async function approveApplication(id: string, permissionIds: number[]) {
  const response = await fetch(
    `${API_BASE_URL}/applications/${id}/approve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ permissionIds }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to approve application");
  }

  return response.json();
}

export async function denyApplication(id: string, reason?: string) {
  const response = await fetch(
    `${API_BASE_URL}/applications/${id}/deny`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to deny application");
  }

  return response.json();
}
