"use client";

import ProfileScreen from "@/components/volunteer/screens/ProfileScreen";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <ProfileScreen user={user} />;
}