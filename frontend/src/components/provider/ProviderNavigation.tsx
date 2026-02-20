"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Package, User } from "lucide-react";

interface ProviderNavigationProps {
  activeTab: "orders" | "chat" | "account";
  onTabChange: (tab: "orders" | "chat" | "account") => void;
}

export default function ProviderNavigation({
  activeTab,
  onTabChange,
}: ProviderNavigationProps) {
  return (
    
    <div className="fixed bottom-0 left-0 right-0 border-t-2 border-slate-800 bg-white flex justify-around py-4">
      <Button
        variant="ghost"
        className={`flex flex-col items-center gap-2 h-auto p-2 ${
          activeTab === "orders"
            ? "text-orange-600"
            : "text-slate-600 hover:text-orange-600"
        }`}
        onClick={() => onTabChange("orders")}
      >
        <Package className="w-6 h-6" />
        <span className="text-xs font-semibold">Orders</span>
      </Button>

      <Button
        variant="ghost"
        className={`flex flex-col items-center gap-2 h-auto p-2 ${
          activeTab === "chat"
            ? "text-orange-600"
            : "text-slate-600 hover:text-orange-600"
        }`}
        onClick={() => onTabChange("chat")}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-xs font-semibold">Chat</span>
      </Button>

      <Button
        variant="ghost"
        className={`flex flex-col items-center gap-2 h-auto p-2 ${
          activeTab === "account"
            ? "text-orange-600"
            : "text-slate-600 hover:text-orange-600"
        }`}
        onClick={() => onTabChange("account")}
      >
        <User className="w-6 h-6" />
        <span className="text-xs font-semibold">Account</span>
      </Button>
    </div>
  );
}
