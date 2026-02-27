"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Building2, Truck, Users, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AdminDashProps {
  user: User;
}
//temp stats
export default function AdminDash({ user }: AdminDashProps) {
  const stats = [
    {
      label: "Total Orders",
      value: "127",
      icon: Package,
      color: "text-orange-600",
    },
    {
      label: "Active Orders",
      value: "43",
      icon: Truck,
      color: "text-slate-600",
    },
    {
      label: "Active Volunteers",
      value: "24",
      icon: Users,
      color: "text-orange-600",
    },
    {
      label: "Distribution Centers",
      value: "2",
      icon: Building2,
      color: "text-slate-600",
    },
  ];

  const quickStats = [
    { label: "Registered Suppliers", value: "2" },
    { label: "Total Managers", value: "2" },
    { label: "System Admins", value: "0" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] bg-amber-50 p-4 pb-24">
      {/* Header */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Admin</h1>
          <div className="h-1 bg-slate-800 w-40 mx-auto"></div>
        </div>
      </div>

      {/* System Overview */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            System Overview
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white border-2 border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center"
                >
                  <IconComponent
                    className={`w-8 h-8 mb-2 ${stat.color}`}
                  />
                  <div className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-600 text-center mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Management Buttons */}
        <div className="space-y-3 mb-8">
          <Link href="/admin/suppliers">
            <Button className="w-full bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-semibold py-3 rounded-lg flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                <span>Manage Suppliers</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/admin/distribution-centers">
            <Button className="w-full bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-semibold py-3 rounded-lg flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5" />
                <span>Manage Distribution Centers</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/admin/users">
            <Button className="w-full bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-semibold py-3 rounded-lg flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Manage Users & Permissions</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="flex justify-between items-center pb-3 border-b border-slate-200 last:border-b-0"
              >
                <span className="text-sm text-slate-700">{stat.label}:</span>
                <span className="font-semibold text-slate-800">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
