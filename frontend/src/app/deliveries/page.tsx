"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DeliveriesScreen from "@/components/deliveries/DeliveriesScreen";

// TODO: add multiple drivers to one delivery
// TODO: let them click an open time slot on the calander
// TODO: time per order for recurrence
// TODO: fix the visual bug of the chat icon appearing before accepting an order


export default function DeliveriesPage() {
  return (
    <ProtectedPage requiredPermission="read_activities">
      <DeliveriesScreen />
    </ProtectedPage>
  );
}
