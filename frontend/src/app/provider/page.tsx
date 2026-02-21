"use client";

import OrdersScreen from "@/components/provider/screens/OrderScreen";
import { useAuth } from "@/lib/auth-context";

export default function ProviderPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <OrdersScreen user={user} />;
}