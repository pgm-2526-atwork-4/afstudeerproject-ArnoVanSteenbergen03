const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get open (unassigned) orders
export async function getOpenDeliveries() {
  const response = await fetch(`${API_BASE_URL}/volunteer/activities/open`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch open deliveries");
    } catch {
      throw new Error(
        `Failed to fetch open deliveries: ${response.statusText}`,
      );
    }
  }

  return response.json();
}

// Get deliveries
export async function getMyDeliveries() {
  const response = await fetch(`${API_BASE_URL}/volunteer/activities/mine`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch your deliveries");
    } catch {
      throw new Error(
        `Failed to fetch your deliveries: ${response.statusText}`,
      );
    }
  }

  return response.json();
}

// Accept an open order
export async function acceptDelivery(activityId: string) {
  const response = await fetch(
    `${API_BASE_URL}/volunteer/activities/${activityId}/accept`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to accept delivery");
    } catch {
      throw new Error(`Failed to accept delivery: ${response.statusText}`);
    }
  }

  return response.json();
}
