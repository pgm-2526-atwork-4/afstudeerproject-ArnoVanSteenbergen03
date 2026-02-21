"use client";

import ProfileScreen from "@/components/provider/screens/ProfileScreen";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <ProfileScreen user={user} />;
}
