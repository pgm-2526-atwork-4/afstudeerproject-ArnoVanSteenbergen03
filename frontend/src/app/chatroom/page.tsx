"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth-context";
import { Suspense } from "react";
import ChatScreen from "@/components/chatroom/ChatScreen";

// TODO: chatroom per supplier (auto creates)
// TODO: supplier maakt order en maakt een post in de channel
// TODO: driver accepteerd order en word toegevoegd in de channel (link driver box chat naar supplier channel en autoscrolled naar de post in de channel)


export default function ChatroomPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedPage requiredPermission="view_chatroom">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">Loading chat...</p>
          </div>
        }
      >
        <ChatScreen />
      </Suspense>
    </ProtectedPage>
  );
}
