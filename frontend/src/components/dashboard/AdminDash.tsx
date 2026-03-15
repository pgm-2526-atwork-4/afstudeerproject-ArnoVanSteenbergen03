"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Building2, Users, Package, ClipboardList, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AdminDashProps {
  user: User;
}

interface DashboardLink {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: string;
}

export default function AdminDash({ user }: AdminDashProps) {
  const links: DashboardLink[] = [
    {
      href: "/manage-orders",
      label: "Manage Orders",
      icon: ClipboardList,
      permission: "view_orders",
    },
    {
      href: "/suppliers",
      label: "Manage Suppliers",
      icon: Package,
      permission: "view_suppliers",
    },
    {
      href: "/distribution-centers",
      label: "Manage Distribution Centers",
      icon: Building2,
      permission: "view_distribution_centers",
    },
    {
      href: "/users",
      label: "Manage Users & Permissions",
      icon: Users,
      permission: "view_users",
    },
  ];
  
  const userPermissions = new Set(user.permissions ?? []);
  const visibleLinks = links.filter((item) => userPermissions.has(item.permission));

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <div className="h-1 bg-slate-800 w-40 mx-auto"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-8 space-y-4">
          {visibleLinks.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.href}>
                <Link href={item.href}>
                  <Button className="w-full bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-semibold py-3 rounded-lg flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
            );
          })}

          {visibleLinks.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
              No dashboard sections are available for your account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
