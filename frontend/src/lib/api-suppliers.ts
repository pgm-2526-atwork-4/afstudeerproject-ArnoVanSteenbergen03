import type { DistributionCenter } from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Supplier = DistributionCenter;

// Get all suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch suppliers");
    } catch {
      throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
    }
  }

  return response.json();
}

// Get single supplier by ID
export async function getSupplierById(id: string): Promise<Supplier> {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch supplier");
    } catch {
      throw new Error(`Failed to fetch supplier: ${response.statusText}`);
    }
  }

  return response.json();
}

// Create supplier
export async function createSupplier(
  data: Partial<Supplier>,
): Promise<Supplier> {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to create supplier");
    } catch {
      throw new Error(`Failed to create supplier: ${response.statusText}`);
    }
  }

  return response.json();
}

// Update supplier
export async function updateSupplier(
  id: string,
  data: Partial<Supplier>,
): Promise<Supplier> {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to update supplier");
    } catch {
      throw new Error(`Failed to update supplier: ${response.statusText}`);
    }
  }

  return response.json();
}

// Delete supplier
export async function deleteSupplier(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete supplier");
    } catch {
      throw new Error(`Failed to delete supplier: ${response.statusText}`);
    }
  }
}
