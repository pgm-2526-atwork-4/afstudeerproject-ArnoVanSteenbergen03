"use client";

import { User } from "@/types";
import { Building2, Users, Package, ClipboardList } from "lucide-react";
import Link from "next/link";

interface AdminDashProps {
  user: User;
}

interface DashboardLink {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  permission: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

export default function AdminDash({ user }: AdminDashProps) {
  const links: DashboardLink[] = [
    {
      href: "/manage-orders",
      label: "Manage Orders",
      description: "View and manage all incoming orders",
      icon: ClipboardList,
      permission: "view_orders",
      bgColor: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-300",
    },
    {
      href: "/suppliers",
      label: "Manage Suppliers",
      description: "Add and organize supplier information",
      icon: Package,
      permission: "view_suppliers",
      bgColor: "from-green-50 to-green-100",
      iconColor: "text-green-600",
      borderColor: "border-green-300",
    },
    {
      href: "/distribution-centers",
      label: "Manage Distribution Centers",
      description: "Oversee distribution center operations",
      icon: Building2,
      permission: "view_distribution_centers",
      bgColor: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-purple-300",
    },
    {
      href: "/users",
      label: "Manage Users & Permissions",
      description: "Control user access and permissions",
      icon: Users,
      permission: "view_users",
      bgColor: "from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
      borderColor: "border-orange-300",
    },
  ];
  
  const userPermissions = new Set(user.permissions ?? []);
  const visibleLinks = links.filter((item) => userPermissions.has(item.permission));

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 to-slate-100 p-6 pb-24">
      <div className="flex justify-center mb-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600 w-40 mx-auto rounded-full"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        {visibleLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleLinks.map((item) => {
              const Icon = item.icon;
              const bgGradient = item.bgColor;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`h-full bg-gradient-to-br ${bgGradient} rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${item.borderColor} group`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${item.iconColor} bg-white p-3 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {item.description}
                    </p>
                    
                    <div className="inline-block text-sm font-semibold text-slate-700 group-hover:translate-x-1 transition-transform duration-300">
                      Manage →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>No dashboard sections are available for your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
