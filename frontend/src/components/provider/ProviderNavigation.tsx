"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Package, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ProviderNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t-2 border-slate-800 bg-white flex justify-around py-4">
      <Link href="/provider">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-2 h-auto p-2 ${
            pathname === "/provider"
              ? "text-orange-600"
              : "text-slate-600 hover:text-orange-600"
          }`}
        >
          <Package className="w-6 h-6" />
          <span className="text-xs font-semibold">Orders</span>
        </Button>
      </Link>

      <Link href="/provider/chatroom">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-2 h-auto p-2 ${
            pathname === "/provider/chatroom"
              ? "text-orange-600"
              : "text-slate-600 hover:text-orange-600"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-semibold">Chat</span>
        </Button>
      </Link>

      <Link href="/provider/profile">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-2 h-auto p-2 ${
            pathname === "/provider/profile"
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
