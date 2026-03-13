"use client";

import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Truck,
  MessageCircle,
  User,
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePermissions } from "@/hooks/usePermissions";
import { useUnreadCounts } from "../hooks/useUnreadCounts";
import { useState } from "react";

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
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

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
  const canViewChat = visibleItems.some((item) => item.href === "/chatroom");
  const unreadLabel = totalUnread > 99 ? "99+" : String(totalUnread);

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 border-t-2 border-slate-800 bg-white flex justify-around py-4 z-50 lg:hidden">
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
                      {unreadLabel}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setIsDesktopMenuOpen((prev) => !prev)}
        className="hidden lg:flex fixed top-2 left-4 z-50 items-center gap-2 rounded-lg border-2 border-slate-800 bg-white px-3 py-2 text-slate-800 shadow-sm hover:bg-slate-50"
        aria-expanded={isDesktopMenuOpen}
        aria-controls="desktop-nav-drawer"
        aria-label={isDesktopMenuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <div className="relative">
          {isDesktopMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
          {canViewChat && totalUnread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {unreadLabel}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold">Menu</span>
      </button>

      <div
        className={`hidden lg:block fixed inset-0 z-40 transition-opacity duration-200 ${
          isDesktopMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isDesktopMenuOpen}
      >
        <button
          type="button"
          onClick={() => setIsDesktopMenuOpen(false)}
          className="absolute inset-0 bg-slate-900/25"
          aria-label="Close navigation menu backdrop"
        />

        <aside
          id="desktop-nav-drawer"
          className={`absolute left-0 top-0 h-full w-72 border-r-2 border-slate-800 bg-white p-6 shadow-xl transition-transform duration-200 ${
            isDesktopMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 pt-14">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Navigation
            </p>
            <h2 className="text-2xl font-bold text-slate-800">Menu</h2>
          </div>

          <nav className="space-y-2">
            {visibleItems.map((item) => {
              const IconComponent = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsDesktopMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 px-4 py-6 rounded-lg ${
                      isActive
                        ? "bg-[#2D3E2D] text-white hover:bg-[#253425]"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="relative">
                      <IconComponent className="w-5 h-5" />
                      {item.href === "/chatroom" && totalUnread > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                          {unreadLabel}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
