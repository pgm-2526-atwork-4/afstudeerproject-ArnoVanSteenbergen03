import { DistributionCenter } from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get distribution centers
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

// Update distribution center
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
