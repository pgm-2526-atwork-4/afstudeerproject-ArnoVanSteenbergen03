"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/lib/auth-context";

export default function ChatroomPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedPage>
      <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Chat</h1>
            <div className="h-1 bg-slate-800 w-40 mx-auto"></div>
          </div>
        </div>
        <div className="text-center text-slate-600 mt-8">
          Chat functionality coming soon...
        </div>
      </div>
    </ProtectedPage>
  );
}
