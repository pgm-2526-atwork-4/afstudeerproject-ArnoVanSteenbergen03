"use client";

import ProtectedPage from "@/components/ProtectedPage";
import DeliveriesScreen from "@/components/deliveries/DeliveriesScreen";

// TODO: add multiple drivers to one delivery
// TODO: split the complete delivery button into 2 buttons
// complete / need assistance(problem? knop)
// TODO: need assistnace maakt post in distro channel
// TODO: add driver side channel button
// TODO: let them click an open time slot on the calander
// TODO: time per order for recurrence


export default function DeliveriesPage() {
  return (
    <ProtectedPage requiredPermission="read_activities">
      <DeliveriesScreen />
    </ProtectedPage>
  );
}
