import type { AdminUser, AdminUserDetail } from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type { AdminUser, AdminUserDetail };

export async function checkEmailAvailable(email: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/admin/users/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!response.ok) return true;
  const data = await response.json();
  return data.available;
}

export async function getUsers(role?: string): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (role) params.set("role", role);

  const url = `${API_BASE_URL}/admin/users${params.toString() ? `?${params}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch users");
    } catch {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
  }

  return response.json();
}

export async function getUserById(id: string): Promise<AdminUserDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch user");
  }

  return response.json();
}

export async function updateUser(
  id: string,
  data: {
    firstname?: string;
    lastname?: string;
    username?: string;
    email?: string;
    userType?: string;
    permissionIds?: number[];
  },
) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update user");
  }

  return response.json();
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to delete user");
  }

  return response.json();
}

export async function createUser(data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  userType: string;
  permissionIds?: number[];
}) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create user");
  }

  return response.json();
}
