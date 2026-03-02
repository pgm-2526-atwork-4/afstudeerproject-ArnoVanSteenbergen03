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

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  permission?: string;
  show?: boolean;
}

export default function AppNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermissions();

  if (!user) return null;

  const navItems: NavItem[] = [
    // Admin dashboard — visible to users with any admin-like permission
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      show: hasAnyPermission(
        "read_users",
        "read_places",
        "read_applications",
      ),
    },
    // Orders — visible to users who can manage food items (providers)
    {
      href: "/orders",
      icon: Package,
      label: "Orders",
      permission: "read_food_items",
    },
    // Deliveries — visible to users who can manage activities (volunteers)
    {
      href: "/deliveries",
      icon: Truck,
      label: "Deliveries",
      permission: "read_activities",
    },
    // Chat — visible to everyone
    {
      href: "/chatroom",
      icon: MessageCircle,
      label: "Chat",
      show: true,
    },
    // Profile — visible to everyone
    {
      href: "/profile",
      icon: User,
      label: "Account",
      show: true,
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.show !== undefined) return item.show;
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t-2 border-slate-800 bg-white flex justify-around py-4 z-50">
      {visibleItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
              <IconComponent className="w-6 h-6" />
              <span className="text-xs font-semibold">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
