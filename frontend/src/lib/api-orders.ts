import { CreateOrderInput } from "@shared/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get orders
export async function getProviderOrders() {
  const response = await fetch(`${API_BASE_URL}/provider/orders`, {
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
  const response = await fetch(`${API_BASE_URL}/provider/orders`, {
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
  const response = await fetch(`${API_BASE_URL}/provider/orders/${orderId}`, {
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
  const response = await fetch(`${API_BASE_URL}/provider/orders/${orderId}`, {
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
