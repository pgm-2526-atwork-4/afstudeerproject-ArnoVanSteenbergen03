"use client";

import { User } from "@/types";
import { useState } from "react";
import ProviderNavigation from "./ProviderNavigation";
import OrdersScreen from "./screens/OrderScreen";
import ProfileScreen from "./screens/ProfileScreen";

export default function ProviderLayout({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<"orders" | "chat" | "account">(
    "orders",
  );

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === "orders" && <OrdersScreen user={user} />}
        {activeTab === "chat" && <div>Chat coming soon</div>}
        {activeTab === "account" && <ProfileScreen user={user} />}
      </div>

      <ProviderNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
