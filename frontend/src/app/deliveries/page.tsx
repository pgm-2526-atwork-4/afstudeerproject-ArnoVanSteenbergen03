"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DeliveriesScreen from "@/components/deliveries/DeliveriesScreen";

//TODO: add multiple drivers to one delivery

export default function DeliveriesPage() {
  return (
    <ProtectedPage requiredPermission="read_activities">
      <DeliveriesScreen />
    </ProtectedPage>
  );
}
