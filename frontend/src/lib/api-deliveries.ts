const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get open (unassigned) orders
export async function getOpenDeliveries() {
  const response = await fetch(`${API_BASE_URL}/deliveries/open`, {
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
  const response = await fetch(`${API_BASE_URL}/deliveries/mine`, {
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
    `${API_BASE_URL}/deliveries/${activityId}/accept`,
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

// Start a delivery (accepted -> in_progress)
export async function startDelivery(activityId: string) {
  const response = await fetch(
    `${API_BASE_URL}/deliveries/${activityId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    },
  );

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to start delivery");
    } catch {
      throw new Error(`Failed to start delivery: ${response.statusText}`);
    }
  }

  return response.json();
}

// Complete a delivery with completion data
export async function completeDelivery(
  activityId: string,
  completionStatus:
    | "completed"
    | "incomplete"
    | "need_assistance" = "completed",
  completionData?: Record<string, unknown>,
) {
  const response = await fetch(
    `${API_BASE_URL}/deliveries/${activityId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: completionStatus,
        completionData,
      }),
    },
  );

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to complete delivery");
    } catch {
      throw new Error(`Failed to complete delivery: ${response.statusText}`);
    }
  }

  return response.json();
}

// Get assistance requests
export async function getAssistanceRequests() {
  const response = await fetch(
    `${API_BASE_URL}/deliveries/assistance/requests`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch assistance requests");
    } catch {
      throw new Error(
        `Failed to fetch assistance requests: ${response.statusText}`,
      );
    }
  }

  return response.json();
}

// Accept an assistance request
export async function acceptAssistance(activityId: string) {
  const response = await fetch(
    `${API_BASE_URL}/deliveries/${activityId}/accept-assistance`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to accept assistance");
    } catch {
      throw new Error(`Failed to accept assistance: ${response.statusText}`);
    }
  }

  return response.json();
}
