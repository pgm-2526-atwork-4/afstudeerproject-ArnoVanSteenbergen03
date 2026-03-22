"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DeliveriesScreen from "@/components/deliveries/DeliveriesScreen";

export default function DeliveriesPage() {
  return (
    <ProtectedPage requiredPermission="read_activities">
      <DeliveriesScreen />
    </ProtectedPage>
  );
}
