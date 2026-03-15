const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get all vehicles
export async function getVehicles() {
  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch vehicles");
    } catch {
      throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
    }
  }

  return response.json();
}
