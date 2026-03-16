"use client";

import ProtectedPage from "@/components/ProtectedPage";
import ProfileScreen from "@/components/profile/ProfileScreen";
import { useAuth } from "@/lib/auth-context";

//TODO: add supplier managment for providers

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedPage>
      <ProfileScreen user={user} />
    </ProtectedPage>
  );
}
