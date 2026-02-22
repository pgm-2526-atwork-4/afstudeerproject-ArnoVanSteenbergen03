"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Truck, User, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function VolunteerNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t-2 border-slate-800 bg-white flex justify-around py-4">
      <Link href="/volunteer">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-2 h-auto p-2 ${
            pathname === "/volunteer"
              ? "text-orange-600"
              : "text-slate-600 hover:text-orange-600"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-semibold">All Orders</span>
        </Button>
      </Link>

      <Link href="/volunteer/deliveries">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-2 h-auto p-2 ${
            pathname === "/volunteer/deliveries"
              ? "text-orange-600"
              : "text-slate-600 hover:text-orange-600"
          }`}
        >
          <Truck className="w-6 h-6" />
          <span className="text-xs font-semibold">Your Deliveries</span>
        </Button>
      </Link>

      <Link href="/volunteer/chatroom">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-2 h-auto p-2 ${
            pathname === "/volunteer/chatroom"
              ? "text-orange-600"
              : "text-slate-600 hover:text-orange-600"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-semibold">Chat</span>
        </Button>
      </Link>

      <Link href="/volunteer/profile">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-2 h-auto p-2 ${
            pathname === "/volunteer/profile"
              ? "text-orange-600"
              : "text-slate-600 hover:text-orange-600"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-semibold">Account</span>
        </Button>
      </Link>
    </div>
  );
}