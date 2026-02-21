"use client";

import { useAuth } from "@/lib/auth-context";

export default function ChatPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <div>Chat coming soon</div>;
}
