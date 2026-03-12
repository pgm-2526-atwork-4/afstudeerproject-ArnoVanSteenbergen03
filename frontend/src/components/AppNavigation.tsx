"use client";

import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Truck,
  MessageCircle,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/hooks/usePermissions";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  permission: string;
}

export default function AppNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { totalUnread } = useUnreadCounts();

  if (!user) return null;

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      permission: "view_dashboard",
    },
    {
      href: "/orders",
      icon: Package,
      label: "Orders",
      permission: "view_orders",
    },
    {
      href: "/deliveries",
      icon: Truck,
      label: "Deliveries",
      permission: "view_deliveries",
    },
    {
      href: "/chatroom",
      icon: MessageCircle,
      label: "Chat",
      permission: "view_chatroom",
    },
    {
      href: "/profile",
      icon: User,
      label: "Account",
      permission: "view_profile",
    },
  ];

  const visibleItems = navItems.filter((item) =>
    hasPermission(item.permission),
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t-2 border-slate-800 bg-white flex justify-around py-4 z-50">
      {visibleItems.map((item) => {
        const IconComponent = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-2 h-auto p-2 ${
                isActive
                  ? "text-orange-600"
                  : "text-slate-600 hover:text-orange-600"
              }`}
            >
              <div className="relative">
                <IconComponent className="w-6 h-6" />
                {item.href === "/chatroom" && totalUnread > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {totalUnread}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
