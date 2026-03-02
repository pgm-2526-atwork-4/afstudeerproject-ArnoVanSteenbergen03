"use client";

import ProtectedPage from "@/components/ProtectedPage";
import OrdersScreen from "@/components/volunteer/screens/OrderScreen";
import { useAuth } from "@/lib/auth-context";

export default function DeliveriesPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedPage>
      <OrdersScreen user={user} />
    </ProtectedPage>
  );
}
