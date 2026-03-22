import {
  type DistributionCenter,
  distributionCenterSchema,
} from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get distribution centers
export async function getDistributionCenters(): Promise<DistributionCenter[]> {
  const response = await fetch(`${API_BASE_URL}/distribution-centers`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch distribution centers");
    } catch {
      throw new Error(
        `Failed to fetch distribution centers: ${response.statusText}`,
      );
    }
  }

  const json = await response.json();
  return distributionCenterSchema.array().parse(json);
}

// Get single distribution center
export async function getDistributionCenter(
  id: string,
): Promise<DistributionCenter> {
  const response = await fetch(`${API_BASE_URL}/distribution-centers/${id}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch distribution center");
    } catch {
      throw new Error(
        `Failed to fetch distribution center: ${response.statusText}`,
      );
    }
  }

  const json = await response.json();
  return distributionCenterSchema.parse(json);
}

// Create distribution center
export async function createDistributionCenter(
  data: Partial<DistributionCenter>,
): Promise<DistributionCenter> {
  const response = await fetch(`${API_BASE_URL}/distribution-centers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to create distribution center");
    } catch {
      throw new Error(
        `Failed to create distribution center: ${response.statusText}`,
      );
    }
  }

  const json = await response.json();
  return distributionCenterSchema.parse(json);
}

// Update distribution center
export async function updateDistributionCenter(
  id: string,
  data: Partial<DistributionCenter>,
): Promise<DistributionCenter> {
  const response = await fetch(`${API_BASE_URL}/distribution-centers/${id}`, {
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
      throw new Error(
        `Failed to update distribution center: ${response.statusText}`,
      );
    }
  }

  const json = await response.json();
  return distributionCenterSchema.parse(json);
}

// Delete distribution center
export async function deleteDistributionCenter(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/distribution-centers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete distribution center");
    } catch {
      throw new Error(
        `Failed to delete distribution center: ${response.statusText}`,
      );
    }
  }
}
