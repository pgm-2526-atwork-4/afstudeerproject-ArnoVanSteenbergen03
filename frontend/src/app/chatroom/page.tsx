"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth-context";
import { Suspense } from "react";
import ChatScreen from "@/components/chatroom/ChatScreen";

// TODO: add proper user managment for chats. 
// TODO: add distro chats
// TODO: chat approval. dubble chat whos allowed in what chats

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
