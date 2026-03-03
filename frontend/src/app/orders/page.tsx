"use client";

import ProtectedPage from "@/components/ProtectedPage";
import OrdersScreen from "@/components/orders/OrderScreen";
import { useAuth } from "@/lib/auth-context";

export default function OrdersPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedPage requiredPermission="read_food_items">
      <OrdersScreen user={user} />
    </ProtectedPage>
  );
}
