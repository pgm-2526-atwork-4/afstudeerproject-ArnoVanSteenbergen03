"use client";

import { useAuth } from "@/lib/auth-context";

export default function ChatroomPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] bg-amber-50 p-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Your Deliveries</h1>
          <div className="h-1 bg-slate-800 w-32 mx-auto"></div>
        </div>
      </div>
      <p className="text-center text-slate-600">Deliveries coming soon</p>
    </div>
  );
}