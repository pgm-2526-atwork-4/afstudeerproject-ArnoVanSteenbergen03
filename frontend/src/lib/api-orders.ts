import {
  CreateOrderInput,
  type AdminOrderRow,
  type AdminOrdersResponse,
  adminOrdersResponseSchema,
} from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type { AdminOrderRow, AdminOrdersResponse };

export async function getAdminOrders(
  params: {
    page?: number;
    limit?: number;
    status?: string;
    centerId?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
): Promise<AdminOrdersResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.centerId) query.set("centerId", params.centerId);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await fetch(
    `${API_BASE_URL}/dashboard?${query.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch orders");
  }

  const json = await response.json();
  return adminOrdersResponseSchema.parse(json);
}

// Admin: get single order by id (full details)
export async function getAdminOrderById(orderId: string) {
  const response = await fetch(`${API_BASE_URL}/dashboard/${orderId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch order");
  }

  return response.json();
}

// Admin: update order activity data
export async function updateAdminOrder(
  orderId: string,
  data: {
    status?: string;
    assignedDriver?: string | null;
    assignedCenterId?: string | null;
    location?: string;
    activityType?: string;
    orderTime?: string;
    notes?: string | null;
  },
) {
  const response = await fetch(`${API_BASE_URL}/dashboard/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update order");
  }

  return response.json();
}

// Get orders
export async function getProviderOrders() {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch orders");
    } catch {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
  }

  return response.json();
}

// Create order
export async function createOrder(data: CreateOrderInput) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to create order");
    } catch {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }
  }

  return response.json();
}

// Get order by id
export async function getProviderOrderById(orderId: string) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch order");
    } catch {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }
  }

  return response.json();
}

// Update order
export async function updateOrder(orderId: string, data: CreateOrderInput) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.error || "Failed to update order");
    } catch {
      throw new Error(`Failed to update order: ${response.statusText}`);
    }
  }

  return response.json();
}
