"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth-context";
import { Suspense } from "react";
import ChatScreen from "@/components/chatroom/ChatScreen";

// TODO: chat approval. dubble check whos allowed in what chats MEETING

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
