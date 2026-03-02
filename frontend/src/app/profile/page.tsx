"use client";

import ProtectedPage from "@/components/ProtectedPage";
import ProfileScreen from "@/components/screens/ProfileScreen";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedPage>
      <ProfileScreen user={user} />
    </ProtectedPage>
  );
}
