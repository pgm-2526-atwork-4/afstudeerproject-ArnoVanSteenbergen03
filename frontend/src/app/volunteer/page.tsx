"use client";

import OrdersScreen from "@/components/volunteer/screens/OrderScreen";
import { useAuth } from "@/lib/auth-context";

export default function VolunteerPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <OrdersScreen user={user} />;
}